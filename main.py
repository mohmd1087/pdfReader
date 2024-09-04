from flask import Flask
from flask import request
from flask import jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.utils import secure_filename
from llama_index.llms.huggingface import HuggingFaceInferenceAPI
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.core import Settings, StorageContext
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from pinecone import Pinecone, ServerlessSpec
from werkzeug.security import generate_password_hash
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploaded_pdfs'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_secret_key')

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploaded_pdfs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize HuggingFace and Pinecone
HF_TOKEN = os.getenv("HUGGING_FACE_TOKEN", os.getenv('HUGGING_FACE_API'))
remotely_run = HuggingFaceInferenceAPI(model_name="HuggingFaceH4/zephyr-7b-alpha", token=HF_TOKEN)
embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

Settings.embed_model = embed_model
Settings.llm = remotely_run

file_name1 = ''

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)  # New field to identify admin users
    sessions = db.relationship('Session', backref='user', lazy=True)

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    login_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    logout_time = db.Column(db.DateTime)
    active = db.Column(db.Boolean, default=True)

class PDF(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(120), nullable=False)
    namespace = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    pdf_id = db.Column(db.Integer, db.ForeignKey('pdf.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


# Register new users
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(first_name=data['first_name'], last_name=data['last_name'], email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=email)
        
        # Create a new session
        new_session = Session(user_id=user.id, login_time=datetime.utcnow(), active=True)
        db.session.add(new_session)
        db.session.commit()
        
        return jsonify({'access_token': access_token, 'isAdmin': user.is_admin}), 200
    return jsonify({'message': 'Invalid credentials'}), 401




# Get the total number of accounts
@app.route('/admin/total_accounts', methods=['GET'])
@jwt_required()
def get_total_accounts():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403
    
    total_accounts = User.query.count()
    return jsonify({'total_accounts': total_accounts}), 200


@app.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()

    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    users = User.query.all()
    user_list = [{'id': u.id, 'first_name': u.first_name, 'last_name': u.last_name, 'email': u.email} for u in users]
    
    return jsonify({'users': user_list}), 200


@app.route('/admin/pdfs', methods=['GET'])
@jwt_required()
def get_all_pdfs():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()

    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    pdfs = PDF.query.all()
    pdf_list = [{'id': pdf.id, 'filename': pdf.filename, 'namespace': pdf.namespace, 'user_id': pdf.user_id} for pdf in pdfs]
    
    return jsonify({'pdfs': pdf_list}), 200


@app.route('/admin/pdf_chats/<int:pdf_id>', methods=['GET'])
@jwt_required()
def get_pdf_chats(pdf_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()

    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    # Fetch chats for the specified PDF
    chats = ChatHistory.query.filter_by(pdf_id=pdf_id).all()
    chat_list = [{'id': chat.id, 'question': chat.question, 'answer': chat.answer} for chat in chats]
    
    return jsonify({'chats': chat_list}), 200



# Get only the active (logged-in) users
@app.route('/admin/active_users', methods=['GET'])
@jwt_required()
def get_active_users():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403
    
    active_sessions = Session.query.filter_by(active=True).all()
    active_users = [
        {
            'user_id': s.user_id,
            'login_time': s.login_time,
            'username': User.query.get(s.user_id).email
        }
        for s in active_sessions
    ]
    return jsonify({'active_users': active_users}), 200


@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Invalidate all active sessions for the user
    sessions = Session.query.filter_by(user_id=user.id, active=True).all()
    for session in sessions:
        session.active = False
        session.logout_time = datetime.utcnow()

    db.session.commit()

    return jsonify({'message': 'Logged out successfully'}), 200

    


# Protect the upload_pdf route with @jwt_required()
@app.route('/upload_pdf', methods=['POST'])
@jwt_required()
def upload_pdf():
    if 'pdf' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['pdf']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    current_user_email = get_jwt_identity() 
    file_name = secure_filename(file.filename)  # Ensure the filename is secure
    namespace = f"{current_user_email}_{file_name}"

    file_name1 = file_name


    pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))

    index_name = 'pdf-qa'

    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name = index_name,
            dimension=384,
            metric = 'cosine',
            spec = ServerlessSpec(
                cloud = 'aws',
                region = 'us-east-1'
        )
    )

    index = pc.Index(index_name)

    # Process PDF
    documents = SimpleDirectoryReader("uploaded_pdfs").load_data()
    vector_store = PineconeVectorStore(pinecone_index=index, namespace=namespace)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context, show_progress=True)

    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    pdf = PDF(filename=filename, namespace=f"{current_user_email}_{filename}", user_id=user.id)
    db.session.add(pdf)
    db.session.commit()

    pdf_folder = app.config['UPLOAD_FOLDER']
    for file_name in os.listdir(pdf_folder):
        file_path = os.path.join(pdf_folder, file_name)
        if os.path.isfile(file_path):
            os.remove(file_path)

    return jsonify({'message': 'Upload successful'}), 200



@app.route('/delete_pdf', methods=['DELETE'])
@jwt_required()
def delete_pdf():
    # Get the filename and user identity from the request
    filename = request.json.get('filename')
    current_user_email = get_jwt_identity()
    
    # Retrieve the PDF from the database using filename
    pdf = PDF.query.filter_by(filename=filename, user_id=User.query.filter_by(email=current_user_email).first().id).first()
    if not pdf:
        return jsonify({'error': 'PDF not found'}), 404

    # Delete the PDF from the Pinecone index
    namespace = pdf.namespace
    pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))

    index_name = 'pdf-qa'
    
    index = pc.Index(index_name)
    index.delete(delete_all=True, namespace=namespace)
    
    # Delete the PDF from the database
    db.session.delete(pdf)
    db.session.commit()

    # Optionally, remove the PDF file from the server (if stored locally)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], pdf.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    return jsonify({'message': 'PDF deleted successfully'}), 200





@app.route('/get_user_pdfs', methods=['GET'])
@jwt_required()
def get_user_pdfs():
    user_email = get_jwt_identity()  # Get the user's email from the JWT token

    # Retrieve the user from the database
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Retrieve PDFs uploaded by the user
    pdfs = PDF.query.filter_by(user_id=user.id).all()
    pdf_list = [{'id': pdf.id, 'filename': pdf.filename, 'namespace': pdf.namespace} for pdf in pdfs]

    return jsonify({'pdfs': pdf_list}), 200


# Endpoint to query the processed data
@app.route('/query_pdf', methods=['POST'])
@jwt_required()
def query_pdf():
    query = request.json.get('query')
    file_name = request.json.get('file_name')
    if not query:
        return jsonify({'error': 'No query provided'}), 400

    load_dotenv()   

    current_user_email = get_jwt_identity() 
    namespace = f"{current_user_email}_{file_name}"

    pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
    index_name = 'pdf-qa'
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name = index_name,
            dimension=384,
            metric = 'cosine',
            spec = ServerlessSpec(
                cloud = 'aws',
                region = 'us-east-1'
        )
    )

    index = pc.Index(index_name)
    vector_store = PineconeVectorStore(pinecone_index=index, namespace= namespace)
    query_engine = VectorStoreIndex.from_vector_store(vector_store).as_query_engine()
    response = query_engine.query(query)

    # Store the question and answer in ChatHistory
    user = User.query.filter_by(email=current_user_email).first()
    pdf = PDF.query.filter_by(filename=file_name, user_id=user.id).first()
    
    chat_message = ChatHistory(
        user_id=user.id,
        pdf_id=pdf.id,
        question=query,
        answer=str(response)
    )
    db.session.add(chat_message)
    db.session.commit()
    return jsonify({'response': str(response)}), 200


@app.route('/get_chat_history', methods=['GET'])
@jwt_required()
def get_chat_history():
    file_name = request.args.get('file_name')
    current_user_email = get_jwt_identity()

    user = User.query.filter_by(email=current_user_email).first()
    pdf = PDF.query.filter_by(filename=file_name, user_id=user.id).first()

    if not pdf:
        return jsonify({'error': 'PDF not found'}), 404

    chat_messages = ChatHistory.query.filter_by(user_id=user.id, pdf_id=pdf.id).order_by(ChatHistory.timestamp).all()
    
    chat_history = [{'question': msg.question, 'answer': msg.answer, 'timestamp': msg.timestamp} for msg in chat_messages]
    
    return jsonify({'chat_history': chat_history}), 200




if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 80)
