**Load Test**

- **What:** A small Node.js load tester that sends AMQP messages to a RabbitMQ Web-AMQP endpoint (supports `ws://` WebSocket AMQP and `amqp://` TCP).
- **Files added:** `package.json`, `loadtest.js`.

- **Install:**

```bash
npm install
```

- **Run example (WebSocket Web-AMQP):**

```bash
node loadtest.js --broker ws://localhost:15678/ws --username arul --password password --producers 3 --messages 2000 --rate 500 --destination q.test
```

- **Run example (AMQP TCP):**

```bash
node loadtest.js --broker amqp://localhost:5672 --producers 4 --messages 10000 --rate 1000 --destination q.test
```


- ** Producer and Consumer**

```
node loadtest.js --broker ws://localhost:15678/ws --username arul --password password --producers 5 --consumers 5 --messages 100 --rate 100 --ack_prob 100 --destination q.test
```

- **Notes:**
  - Tune `--producers`, `--messages`, and `--rate` to shape load.
  - `--rate` is messages per second per producer (approximate).
  - The script prints live sent count and final summary.

If you prefer using the Java `rabbitmq-perf-test` suite instead, you can run that against your cluster; this script is intended for quick, lightweight Web-AMQP specific checks and to integrate easily into the existing sample app flow.
