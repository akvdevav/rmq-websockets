#!/usr/bin/env node
/*
  Simple load tester for RabbitMQ Web-AMQP (supports ws:// WebSocket AMQP and plain amqp:// tcp).

  Usage examples:
    node loadtest.js --broker ws://localhost:15678/ws --username arul --password password --producers 5 --messages 1000 --rate 200 --destination q.test

  Options:
    --broker       Broker url (ws://... or amqp://host:port). Default: ws://localhost:15678/ws
    --username     Username (optional)
    --password     Password (optional)
    --producers    Number of concurrent producer connections (default 1)
    --messages     Messages per producer (default 1000)
    --rate         Messages per second per producer (default 100)
    --size         Message body size in bytes (default 128)
    --destination  Address/queue to send to (default q.test)
*/

let rhea;
try {
    rhea = require('rhea');
} catch (e) {
    // fall back to bundled browser build if present
    try {
        require('./rhea.js');
        rhea = global.rhea || (typeof window !== 'undefined' && window.rhea);
    } catch (e2) {
        rhea = null;
    }
    if (!rhea) {
        console.error('rhea module not found. Either `npm install rhea` or ensure `rhea.js` is present.');
        process.exit(1);
    }
}
const WebSocket = require('ws');
const os = require('os');

function parseArgs() {
    const args = {};
    const argv = process.argv.slice(2);
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith('--')) {
            const k = a.slice(2);
            const v = argv[i+1] && !argv[i+1].startsWith('--') ? argv[++i] : true;
            args[k] = v;
        }
    }
    return args;
}

const opts = parseArgs();
const BROKER = opts.broker || 'ws://localhost:15678/ws';
const USER = opts.username || opts.user || null;
const PASS = opts.password || opts.pass || null;
const PRODUCERS = parseInt(opts.producers || '1', 10);
const CONSUMERS = parseInt(opts.consumers || '0', 10);
const MESSAGES = parseInt(opts.messages || '1000', 10);
const RATE = parseInt(opts.rate || '100', 10);
const SIZE = parseInt(opts.size || '128', 10);
const DEST = opts.destination || 'q.test';
const ACK_PROB = parseFloat(opts.ack_prob || '100'); // percent chance to ack (else release)

let sentTotal = 0;
let consumedTotal = 0;
let ackedTotal = 0;
let nackedTotal = 0;
let startTime = Date.now();

function makeBody(i) {
    // small predictable payload
    return Buffer.alloc(SIZE, 'x').toString() + '|' + i;
}

function isWebsocketUrl(url) {
    return url.startsWith('ws://') || url.startsWith('wss://');
}

async function runProducer(id) {
    return new Promise((resolve, reject) => {
        const connOpts = {};
        if (isWebsocketUrl(BROKER)) {
            connOpts.connection_details = rhea.websocket_connect(WebSocket)(BROKER, ["binary", "AMQPWSB10", "amqp"]);
            if (USER) { connOpts.username = USER; }
            if (PASS) { connOpts.password = PASS; }
        } else {
            // assume amqp://host:port
            try {
                const u = new URL(BROKER);
                connOpts.host = u.hostname;
                connOpts.port = u.port || 5672;
                if (u.username) connOpts.username = decodeURIComponent(u.username);
                if (u.password) connOpts.password = decodeURIComponent(u.password);
            } catch (e) {
                return reject(new Error('Invalid broker URL: ' + BROKER));
            }
        }

        const connection = rhea.connect(connOpts);

        connection.on('connection_open', (c) => {
            const sender = connection.open_sender(DEST);
            sender.on('sender_open', () => {
                let sent = 0;
                const intervalMs = Math.max(1, Math.floor(1000 / RATE));
                const tick = setInterval(() => {
                    if (sent >= MESSAGES) {
                        clearInterval(tick);
                        // close sender/conn after short delay to flush
                        setTimeout(() => {
                            try { sender.close(); connection.close(); } catch (e) {}
                            resolve();
                        }, 200);
                        return;
                    }
                    const body = makeBody(`${id}-${sent}`);
                    try {
                        sender.send({ body: body });
                        sent++;
                        sentTotal++;
                    } catch (err) {
                        console.error('Send error:', err && err.message);
                    }
                }, intervalMs);
            });
        });

        connection.on('error', (err) => {
            console.error('Connection error (producer', id, '):', err && err.message);
        });

        connection.on('disconnected', (ctx) => {
            // ignore
        });
    });
}

async function runConsumer(id, expectedTotal, producersDoneFlag) {
    return new Promise((resolve, reject) => {
        const connOpts = {};
        if (isWebsocketUrl(BROKER)) {
            connOpts.connection_details = rhea.websocket_connect(WebSocket)(BROKER, ["binary", "AMQPWSB10", "amqp"]);
            if (USER) { connOpts.username = USER; }
            if (PASS) { connOpts.password = PASS; }
        } else {
            try {
                const u = new URL(BROKER);
                connOpts.host = u.hostname;
                connOpts.port = u.port || 5672;
                if (u.username) connOpts.username = decodeURIComponent(u.username);
                if (u.password) connOpts.password = decodeURIComponent(u.password);
            } catch (e) {
                return reject(new Error('Invalid broker URL: ' + BROKER));
            }
        }

        const connection = rhea.connect(connOpts);

        connection.on('connection_open', (c) => {
            // open receiver with manual acceptance
            const receiver = connection.open_receiver({ source: { address: DEST }, autoaccept: false });

            receiver.on('message', (context) => {
                consumedTotal++;
                const rand = Math.random() * 100;
                if (rand <= ACK_PROB) {
                    try { context.delivery.accept(); } catch (e) {}
                    ackedTotal++;
                } else {
                    try { context.delivery.release(); } catch (e) {}
                    nackedTotal++;
                }

                // If producers finished and we've consumed everything, resolve
                if (producersDoneFlag.done && consumedTotal >= expectedTotal) {
                    try { receiver.close(); connection.close(); } catch (e) {}
                    resolve();
                }
            });

            receiver.on('receiver_error', (ctx) => {
                console.error('Receiver error (consumer', id, '):', ctx && ctx.error && ctx.error.message);
            });
        });

        connection.on('error', (err) => {
            console.error('Connection error (consumer', id, '):', err && err.message);
        });

        // Safety timeout: if producers are done but messages aren't arriving, resolve after wait
        const safety = setInterval(() => {
            if (producersDoneFlag.done && consumedTotal >= expectedTotal) {
                clearInterval(safety);
            }
        }, 1000);
    });
}

async function main() {
    console.log('Load test starting with options:');
    console.log({ BROKER, USER, PRODUCERS, MESSAGES, RATE, SIZE, DEST });
    if (CONSUMERS > 0) console.log({ CONSUMERS, ACK_PROB });

    startTime = Date.now();

    // start stats printer
    const statsInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const tps = (sentTotal / Math.max(1, elapsed)).toFixed(2);
        const cps = (consumedTotal / Math.max(1, elapsed)).toFixed(2);
        process.stdout.write(`\rSent: ${sentTotal} msgs — ${tps} msg/s | Consumed: ${consumedTotal} — ${cps} msg/s — a:${ackedTotal} n:${nackedTotal} — elapsed ${elapsed.toFixed(1)}s`);
    }, 1000);

    // launch consumers (if any)
    const expectedTotal = PRODUCERS * MESSAGES;
    const producersDoneFlag = { done: false };
    const consumerProms = [];
    for (let i = 0; i < CONSUMERS; i++) {
        consumerProms.push(runConsumer(i, expectedTotal, producersDoneFlag));
    }

    // launch producers
    const proms = [];
    for (let i = 0; i < PRODUCERS; i++) {
        proms.push(runProducer(i));
    }

    await Promise.all(proms);
    producersDoneFlag.done = true;

    // wait for consumers to finish consuming expected messages, but add a max wait
    if (CONSUMERS > 0) {
        const consumerTimeoutMs = Math.max(30000, Math.ceil(expectedTotal / Math.max(1, RATE * PRODUCERS)) * 1000 + 20000);
        await Promise.race([
            Promise.all(consumerProms),
            new Promise((res) => setTimeout(res, consumerTimeoutMs))
        ]);
    }

    clearInterval(statsInterval);
    const elapsed = (Date.now() - startTime) / 1000;
    console.log('\nLoad test complete.');
    console.log(`Total sent: ${sentTotal} messages in ${elapsed.toFixed(2)}s — avg ${(sentTotal/Math.max(1,elapsed)).toFixed(2)} msg/s`);
    if (CONSUMERS > 0) {
        console.log(`Total consumed: ${consumedTotal} (acked: ${ackedTotal}, nacked/released: ${nackedTotal})`);
    }
    process.exit(0);
}

main().catch((e) => {
    console.error('Fatal error:', e && e.message);
    process.exit(1);
});
