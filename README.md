# AMQP WebSocket Test Application

This is a simple browser-based application designed to demonstrate and test Advanced Message Queuing Protocol (AMQP) 1.0 communication over WebSockets with a RabbitMQ broker. It allows users to connect to a RabbitMQ instance, send messages to a specified queue, and receive messages from another queue, all directly from their web browser.

## Features

*   Connect to RabbitMQ using AMQP 1.0 over WebSocket.
*   Send text messages to any specified queue or exchange.
*   Subscribe to and receive messages from any specified queue.
*   Real-time display of connection status and received messages.
*   Simple, intuitive user interface.

## Technologies Used

*   **Frontend**: HTML, CSS, JavaScript
*   **AMQP 1.0 Library**: [rhea](https://github.com/grs/rhea) (JavaScript library for AMQP 1.0)
*   **Message Broker**: RabbitMQ (with `rabbitmq_web_amqp` plugin enabled)

## RabbitMQ Setup

To use this application, you need a running RabbitMQ instance with the `rabbitmq_web_amqp` plugin enabled.

1.  **Enable the `rabbitmq_web_amqp` plugin:**
    This plugin is essential for enabling AMQP over WebSocket support. You can enable it using the RabbitMQ CLI:
    ```bash
    rabbitmq-plugins enable rabbitmq_web_amqp
    ```
    You may need to restart RabbitMQ after enabling the plugin.

2.  **Verify WebSocket Endpoint:**
    By default, the plugin will expose a WebSocket endpoint at `ws://<your-rabbitmq-host>:15674/ws` (for non-TLS) or `wss://<your-rabbitmq-host>:15673/ws` (for TLS, usually on port 443 if configured with an SSL listener). Ensure these ports are open and accessible from where you're running the web app. If you are using a cloud-hosted RabbitMQ, consult your provider's documentation for the correct WebSocket URL. The default URL in the application's connection settings is `ws://localhost:15674/ws`.

3.  **Create a Queue (Optional, but recommended for testing):**
    You can create a queue named `my_queue` (or any other name you prefer) in RabbitMQ. This can be done via the RabbitMQ Management UI or using `rabbitmqadmin`. The sample app uses `my_queue` by default for both sending and receiving messages.

## Running the Application

To run this application, you need a simple web server to serve the static files (`index.html`, `style.css`, `script.js`). You **cannot** simply open `index.html` directly in your browser due to browser security restrictions (e.g., CORS, `file:///` protocol limitations with JavaScript modules).

Here are a few ways to quickly spin up a local web server:

### Option 1: Using Python's built-in HTTP server (if Python is installed)

1.  Open your terminal or command prompt.
2.  Navigate to the project root directory:
3.  Run the Python HTTP server:
    ```bash
    python -m http.server 8000
    ```
4.  Open your web browser and go to `http://localhost:8000`.

### Option 2: Using `http-server` (if Node.js and npm are installed)

1.  If you don't have `http-server` installed, install it globally:
    ```bash
    npm install -g http-server
    ```
2.  Open your terminal or command prompt.
3.  Navigate to the project root directory:
4.  Run `http-server`:
    ```bash
    http-server
    ```
5.  The terminal will display the local URL(s) where the application is being served (e.g., `http://127.0.0.1:8080`). Open one of these in your web browser.

## Usage

1.  **Broker WebSocket URL:** Ensure the URL in the "Connection Settings" matches your RabbitMQ WebSocket endpoint (e.g., `ws://localhost:15674/ws`).
2.  **Connect:** Click the "Connect" button. The status should change to "Connected", and sender/receiver links will be opened.
3.  **Send Message:**
    *   Enter a "Target Queue/Exchange" (e.g., `my_queue`).
    *   Type your message in the "Message" field.
    *   Click "Send Message". The message will be sent to RabbitMQ.
4.  **Receive Messages:**
    *   Enter the "Queue to Consume From" (e.g., `my_queue`).
    *   Click "Subscribe". This will open a receiver link for that queue.
    *   Any messages published to that queue will appear in the "Messages Received" area.
    *   Click "Unsubscribe" to stop receiving messages.
5.  **Disconnect:** Click the "Disconnect" button to close the AMQP connection.





---

I hope this detailed `README.md` provides a comprehensive overview of the project and guidance for further development!


# rmq-websockets
