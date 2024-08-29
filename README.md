Ask A PDF
Overview
Ask A PDF is a web application that allows users to upload PDFs, extract and store contextualized data using LlamaIndex and Pinecone, and then query the stored data to get relevant answers. The application includes an admin dashboard to manage user sessions and accounts.

Features
User Authentication: Users can sign up, log in, and log out securely.
PDF Upload: Users can upload PDFs, which are processed and stored for querying.
Query Functionality: Users can ask questions based on the uploaded PDF content and receive relevant answers.
Admin Dashboard: Admins can view active user sessions and manage accounts.
Session Management: Active sessions are tracked and can be logged out, marking them as inactive.
Tech Stack
Frontend: React, Axios
Backend: Python, Flask, JWT for authentication
Database: SQLite (for development)
Vector Database: Pinecone
OCR: Tesseract (for extracting text from PDFs)
Embedding Model: LlamaIndex for text embedding
Setup Instructions
Prerequisites
Python 3.x
Node.js
npm (Node Package Manager)
SQLite or any other database (configured in Flask)
Pinecone account (for vector database storage)
Backend Setup
Clone the repository:

bash
Copy code
git clone https://github.com/your-username/ask-a-pdf.git
cd ask-a-pdf
Create a virtual environment:

bash
Copy code
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
Install dependencies:

bash
Copy code
pip install -r requirements.txt
Set up environment variables:

Create a .env file in the project root and add the following:
env
Copy code
FLASK_APP=app
FLASK_ENV=development
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
PINECONE_API_KEY=your_pinecone_api_key
Initialize the database:

bash
Copy code
flask db init
flask db migrate
flask db upgrade
Run the backend server:

bash
Copy code
flask run
Frontend Setup
Navigate to the frontend directory:

bash
Copy code
cd client
Install dependencies:

bash
Copy code
npm install
Start the React application:

bash
Copy code
npm start
Running the Application
Login/Signup: Visit http://localhost:3000 to log in or sign up.
Upload PDF: Once logged in, upload a PDF to process it.
Query PDF: After uploading, navigate to the query page to ask questions.
Admin Dashboard: If logged in as an admin, access the dashboard to manage users and sessions.
Project Structure
bash
Copy code
.
├── client                   # React frontend
│   ├── public               # Public assets
│   └── src                  # React components and pages
├── migrations               # Database migrations
├── app.py                   # Main Flask application
├── models.py                # Database models
├── routes.py                # API routes
├── utils.py                 # Utility functions
├── requirements.txt         # Python dependencies
└── README.md                # Project documentation
