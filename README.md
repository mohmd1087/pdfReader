# Ask A PDF

## Overview

**Ask A PDF** is a web application that allows users to upload PDFs, extract and store contextualized data using LlamaIndex and Pinecone, and then query the stored data to get relevant answers. The application includes an admin dashboard to manage user sessions and accounts.

## Features

- **User Authentication**: Users can sign up, log in, and log out securely.
- **PDF Upload**: Users can upload PDFs, which are processed and stored for querying.
- **Query Functionality**: Users can ask questions based on the uploaded PDF content and receive relevant answers.
- **Admin Dashboard**: Admins can view active user sessions and manage accounts.
- **Session Management**: Active sessions are tracked and can be logged out, marking them as inactive.

## Tech Stack

- **Frontend**: React, Axios
- **Backend**: Python, Flask, JWT for authentication
- **Database**: SQLite (for development)
- **Vector Database**: Pinecone
- **OCR**: Tesseract (for extracting text from PDFs)
- **Embedding Model**: LlamaIndex for text embedding

## Setup Instructions

### Prerequisites

- Python 3.x
- Node.js
- npm (Node Package Manager)
- SQLite or any other database (configured in Flask)
- Pinecone account (for vector database storage)

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ask-a-pdf.git
   cd ask-a-pdf
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
3. **Install dependencies:**:
   ```bash
   pip install -r requirements.txt
4. **Set up environment variables:**:
   ```bash
   FLASK_APP=app
   FLASK_ENV=development
   SECRET_KEY=your_secret_key
   JWT_SECRET_KEY=your_jwt_secret_key
   PINECONE_API_KEY=your_pinecone_api_ke
5. **Initialize the DB:**:
   ```bash
   flask db init
   flask db migrate
   flask db upgrade

