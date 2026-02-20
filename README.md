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

## Developer Setup (Optional: For Python Backend/Tools)

While this particular application is a frontend-only JavaScript project, you might consider setting up a Python development environment if you plan to extend it with a Python backend (e.g., a Flask application to manage RabbitMQ, or to act as an intermediary) or other Python-based tools.

### Python Virtual Environment (`venv`)

It's highly recommended to use a virtual environment to manage Python dependencies for any Python project.

1.  **Create a virtual environment:**
    ```bash
    python3 -m venv .venv
    ```
    This creates a folder named `.venv` in your project root containing a Python interpreter and `pip`.

2.  **Activate the virtual environment:**

    *   **On macOS/Linux:**
        ```bash
        source .venv/bin/activate
        ```
    *   **On Windows (Command Prompt):**
        ```bash
        .venv\Scripts\activate.bat
        ```
    *   **On Windows (PowerShell):**
        ```bash
        .venv\Scripts\Activate.ps1
        ```
    You'll know it's active when your terminal prompt changes (e.g., `(.venv) your_username@your_machine:~/rmq-websockets$`).

3.  **Install dependencies:**
    If your Python project has a `requirements.txt` file, install dependencies using:
    ```bash
    pip install -r requirements.txt
    ```

### Example Python Snippets (Contextualized)

The following snippets demonstrate how you might structure Python code for various purposes within a larger project, such as backend services or utility scripts.

#### `setup_venv` function (Hypothetical Python script for environment setup)

```python
import subprocess
import sys
import os

def setup_venv():
    """Sets up a Python virtual environment and installs dependencies."""
    venv_dir = ".venv"
    if not os.path.exists(venv_dir):
        print(f"Creating virtual environment in {venv_dir}...")
        subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True)
        print("Virtual environment created.")
    else:
        print(f"Virtual environment already exists in {venv_dir}.")

    # Activate the venv (This part is usually done manually in the shell,
    # but programmatically you'd run commands *within* the venv's python)
    # For programmatic use:
    python_executable = os.path.join(venv_dir, "bin", "python") # Linux/macOS
    if sys.platform == "win32":
        python_executable = os.path.join(venv_dir, "Scripts", "python.exe")

    print(f"Installing dependencies using {python_executable}...")
    try:
        subprocess.run([python_executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("Dependencies installed.")
    except FileNotFoundError:
        print("requirements.txt not found. Skipping dependency installation.")
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")

if __name__ == "__main__":
    # This function would typically be called from a main script or build process.
    # For a dev setup, manual activation and pip install are more common.
    pass # setup_venv()
```

#### Flask Application Example (`create_app`)

If you were to add a Python backend using Flask, here's a basic structure for creating your application instance.

```python
# app.py (example Flask application file)
from flask import Flask

def create_app():
    app = Flask(__name__)
    # Configuration, blueprint registration, etc. would go here
    # app.config.from_object('config.DevelopmentConfig')

    @app.route('/')
    def hello_world():
        return 'Hello, Flask Backend!'

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
```
This Flask app could, for example, expose REST API endpoints that interact with RabbitMQ (e.g., for persistent message storage, complex processing, or managing exchange/queue declarations beyond what the frontend directly does).

## Further Development / Related Concepts

The following snippets illustrate various software engineering patterns and utility functions. While not directly integrated into this basic AMQP WebSocket frontend application, they represent concepts that could be useful in extending this project or in related development tasks.




```
# 1. Create a network
podman network create rabbit-net

# 2. Re-run RabbitMQ on that network
podman stop rabbitmq && podman rm rabbitmq
podman run -d --name rabbitmq --network rabbit-net \
  -p 5672:5672 -p 15672:15672 -p 15678:15678 -p 15678:15678 \
  rabbitmq:4.0-management

# 3. Run PerfTest on the same network using the container name 'rabbitmq'
podman run -it --rm --network rabbit-net pivotalrabbitmq/perf-test:latest \
  --uri amqp://guest:guest@rabbitmq:5672 \
  --producers 1000 \
  --consumers 1000 \
  --queue-pattern 'test-%d' \
  --queue-pattern-from 1 \
  --queue-pattern-to 1000
```


```
kubectl exec upstream-rabbit-new-server-0 -- rabbitmqctl add_user arul password
kubectl exec upstream-rabbit-new-server-0 -- rabbitmqctl set_permissions  -p / arul ".*" ".*" ".*"
kubectl exec upstream-rabbit-new-server-0 -- rabbitmqctl set_user_tags arul administrator

```


```
 k port-forward svc/upstream-rabbit-new 15678:15678
 k port-forward svc/upstream-rabbit-new 15672:15672
 k port-forward svc/upstream-rabbit-new 5672:5672
```

```
instance=notls-rabbit
username=$(kubectl -n rabbitmq-system   get secret ${instance}-default-user -o jsonpath="{.data.username}" | base64 --decode)
password=$(kubectl -n rabbitmq-system   get secret ${instance}-default-user -o jsonpath="{.data.password}" | base64 --decode)
service=${instance}
echo $username
echo $password



kubectl -n rabbitmq-system --restart=Always run arul-perf2 --image=pivotalrabbitmq/perf-test -- \
--uri "amqp://${username}:${password}@${service}" \
-z 1800 \
-f persistent \
-q 1000 \
-c 1000 \
-ct -1 \
-ad false \
--rate 50 \
--size 1024 \
--queue-pattern 'perf-test-%d' \
--queue-pattern-from 1 \
--queue-pattern-to 100 \
-qa auto-delete=false,durable=true,x-queue-type=quorum \
--producers 1 \
--consumers 100 \
-t fanout \
-e "fanout-test-exchange" \
--consumer-latency 10
```

```
k -n rabbitmq-system  exec notls-rabbit-server-0 -i --  rabbitmqctl list_queues name type | grep quorum | awk '{print $2}' | sort | uniq -c
```

---

I hope this detailed `README.md` provides a comprehensive overview of the project and guidance for further development!


# rmq-websockets
