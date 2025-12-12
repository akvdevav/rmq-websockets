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
    ```bash
    cd /Users/avannala/Documents/workspace/rmq-websockets
    ```
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
    ```bash
    cd /Users/avannala/Documents/workspace/rmq-websockets
    ```
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

#### README Parsing Utilities

These functions appear to be designed for programmatically fetching, parsing, and extracting information from `README.md` files, possibly from GitHub repositories. This could be useful for automated documentation processing, project metadata extraction, or internal tools.

```python
# Hypothetical fetch_readme, parse_readme_content, etc. functions
# (Illustrative examples based on names, actual implementation not provided)

def fetch_readme(repo_url: str) -> str:
    """Fetches the README.md content from a given repository URL."""
    # This would typically involve making an HTTP GET request to the GitHub API or raw content URL.
    pass

def parse_readme_content(content: str) -> dict:
    """Parses README content to extract key sections like description, setup, etc."""
    # This might use a Markdown parser and pattern matching.
    pass

def extract_description_from_readme(parsed_content: dict) -> str:
    """Extracts the project description from parsed README content."""
    pass

def extract_outputs_from_readme(parsed_content: dict) -> list:
    """Extracts a list of outputs or results described in the README."""
    pass

# Helper for getting README content, potentially with caching
def _get_readme_content(repo_url: str) -> str:
    pass

# Mocking for testing README fetch
def mock_github_readme(mocker):
    """Mocks GitHub API calls to return sample README content for testing."""
    pass

def test_parse_readme_content():
    """Unit test for README content parsing."""
    pass

def test_fetch_readme(mock_github_readme):
    """Unit test for fetching README content."""
    pass

def test_fetch_readme_error(mock_github_readme):
    """Unit test for error handling during README fetching."""
    pass

def extract_readme_paths(repo_path: str) -> list[str]:
    """Extracts paths to README files within a repository directory."""
    pass
```

#### Project Configuration and Environment Management

These snippets suggest mechanisms for managing project identifiers, application configurations, and environment variables, crucial for configurable and deployable applications.

```python
# Project identification
def project():
    """Returns the current project identifier."""
    # This could be hardcoded, read from environment variables, or a config file.
    return "test-project"

# More sophisticated project identification (e.g., for classes)
class SomeProjectClass:
    _project = None
    def project(self):
        """Returns the project ID, possibly from environment variable fallback."""
        return self._project or os.environ.get("OPENAI_PROJECT_ID")

# Application Configuration and Initialization
class AppConfig:
    """Base class for application configuration."""
    pass

class AppInitializer:
    """Handles application initialization logic."""
    pass

# Environment Variable Utilities
def mock_env(mocker, env_vars: dict):
    """Mocks environment variables for testing purposes."""
    pass

def mock_env_vars(env_vars: dict):
    """Utility to set environment variables for a block of code."""
    pass

def environment_tab(key: str) -> str:
    """Gets an environment variable, possibly formatted for a specific UI tab."""
    pass

def get_env_var(key: str, default: Optional[str] = None) -> str:
    """Retrieves an environment variable with an optional default."""
    pass

def get_env_file_path(base_path: str, filename: str = ".env") -> str:
    """Constructs the path to an environment file."""
    pass

def docker_env(env_name: str, build_context: str) -> dict:
    """Generates Docker environment variables based on an environment name."""
    pass
```

#### Task and Agent Management (Hypothetical)

These snippets point towards a system for defining, managing, and executing tasks, possibly in an AI agent or workflow automation context.

```python
# Task management (e.g., for project management or agent-based systems)
def add_project(project_name: str):
    """Adds a new project to a tracking system."""
    pass

def get_projects() -> list[str]:
    """Retrieves a list of all managed projects."""
    pass

def get_tasks(project_name: str) -> list[dict]:
    """Retrieves tasks associated with a given project."""
    pass

# Base environment and task execution for an agent or automated system
class BaseEnvironment:
    """Base class for environments in which tasks are executed."""
    pass

def text_env_eval(eval_input: str, env: BaseEnvironment):
    """Evaluates text-based input within an environment."""
    pass

def _create_env(env_config: dict) -> BaseEnvironment:
    """Creates an environment instance from a configuration."""
    pass

class Task:
    """Represents a discrete task to be performed."""
    pass
```

#### AWS CDK Nag Guidance

This snippet refers to `CDK Nag Guidance`, which is a tool for checking AWS Cloud Development Kit (CDK) applications against best practices and compliance rules. This would be relevant if the project involved deploying infrastructure on AWS using CDK.

```text
# Reference to CDK Nag Guidance
# This typically involves using the 'cdk-nag' library in a CDK application
# to enforce security and operational best practices.
# Example usage in a CDK app:
# import cdk_nag
# cdk_nag.NagSuppressions.add_stack_suppressions(stack, [...])
```
This demonstrates how various, seemingly disparate, code snippets can fit into a broader software development ecosystem, often related to automation, testing, configuration, and infrastructure management.

---

I hope this detailed `README.md` provides a comprehensive overview of the project and guidance for further development!


# rmq-websockets
