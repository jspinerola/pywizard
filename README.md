<img width="312" height="563" alt="pywizard" src="https://github.com/user-attachments/assets/859a36dd-2d13-43f5-8186-6d36415f2c9c" />

# pywizard

Python Source Code Analyzer

---

# Getting Started

## Frontend

### ⚙️ Installation

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

---

### Usage

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This will start the Vite development server, and you can view the application in your browser, typically at `http://localhost:5173`. The server has hot-reloading enabled, so your changes will be reflected instantly.

## Backend

1.  **Navigate to the backend directory:**

```bash
cd backend
```

2.  **Create a virtual environment** (recommended):

```bash
python -m venv venv
```

3.  **Activate the virtual environment:**

- On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```
- On Windows:
  ```bash
  venv\Scripts\activate
  ```

4.  **Install the dependencies:**

```bash
pip install -r requirements.txt
```
5. **Set up API Key**
   - Create a .env file in the backend directory
   - Write the following in the .env file
```bash
GEMINI_API_KEY="your_key_here"
```

---

### Usage

1.  **Start the server** from within the `backend` directory:

```bash
uvicorn main:app --reload
```

The server will run at `http://127.0.0.1:8000`. The `--reload` flag is great for development as it automatically restarts the server when you save changes.

2.  **Explore the API documentation:**
    FastAPI automatically generates interactive documentation for your API endpoints.

- **Swagger UI**: Open your browser and go to `http://127.0.0.1:8000/docs`.
- **ReDoc**: A more compact version of the docs is available at `http://127.0.0.1:8000/redoc`.

---
