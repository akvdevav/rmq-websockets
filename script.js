/**
 * rabbitmq-client.js
 * 
 * A dedicated service class for handling RabbitMQ Web STOMP connections.
 * 
 * DEPENDENCY:
 * You must install the STOMP library:
 *    npm install @stomp/stompjs
 * 
 * IF USING VANILLA HTML (No bundler):
 *    Remove the 'import' line below and ensure you have the CDN script in your HTML.
 *    The library will be available as 'StompJs'.
 */

import { Client } from '@stomp/stompjs';

// CONFIGURATION
const RABBITMQ_CONFIG = {
    // Note: 'ws' (WebSocket) or 'wss' (Secure WebSocket)
    // Port 15674 is standard for Web STOMP. Do NOT use 5672.
    brokerURL: 'ws://localhost:15678/ws',
    username: 'arul',
    password: 'password',
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
};

export class RabbitMQClient {
    constructor(onMessageCallback) {
        this.client = null;
        this.onMessage = onMessageCallback; // Function to handle incoming messages
    }

    connect() {
        console.log(`Connecting to ${RABBITMQ_CONFIG.brokerURL} as ${RABBITMQ_CONFIG.username}...`);

        this.client = new Client({
            brokerURL: RABBITMQ_CONFIG.brokerURL,
            
            // Credentials
            connectHeaders: {
                login: RABBITMQ_CONFIG.username,
                passcode: RABBITMQ_CONFIG.password,
            },

            // Resilience settings
            reconnectDelay: RABBITMQ_CONFIG.reconnectDelay,
            heartbeatIncoming: RABBITMQ_CONFIG.heartbeatIncoming,
            heartbeatOutgoing: RABBITMQ_CONFIG.heartbeatOutgoing,

            // Debugging (optional: comment out in production)
            debug: (str) => {
                console.log(': ' + str);
            },
        });

        // Lifecycle Hooks
        this.client.onConnect = (frame) => {
            console.log('✅ Connected to RabbitMQ Web STOMP');
            this.subscribeToQueue('/queue/test');
        };

        this.client.onStompError = (frame) => {
            console.error('❌ Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.onWebSocketError = (event) => {
            console.error('❌ WebSocket error. Check if RabbitMQ Web STOMP plugin is enabled (port 15674).');
        };

        // Initiate connection
        this.client.activate();
    }

    subscribeToQueue(destination) {
        if (!this.client ||!this.client.connected) return;

        console.log(`Subscribing to ${destination}...`);
        this.client.subscribe(destination, (message) => {
            // Forward the message body to your UI or logic
            if (this.onMessage) {
                this.onMessage(message.body);
            }
        });
    }

    sendMessage(destination, body) {
        if (!this.client ||!this.client.connected) {
            console.error('Cannot send: Client is not connected.');
            return;
        }

        this.client.publish({
            destination: destination,
            body: body,
            // Optional headers (e.g., persistence)
            headers: { 'content-type': 'text/plain' }
        });
        console.log(`Sent message to ${destination}`);
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            console.log('Disconnected.');
        }
    }
}

// --- USAGE EXAMPLE ---
// Use the code below in your main app file (e.g., main.js or App.js)
/*
    import { RabbitMQClient } from './rabbitmq-client.js';

    // 1. Initialize logic to handle incoming messages
    const handleMessage = (msg) => {
        console.log("UI Received:", msg);
    };

    // 2. Start the client
    const rmq = new RabbitMQClient(handleMessage);
    rmq.connect();

    // 3. Send a message later
    // rmq.sendMessage('/queue/test', 'Hello World from JS!');
*/