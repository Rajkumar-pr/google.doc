const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const uri = 'mongodb+srv://kulkarniajinkya729:Ajinkya1234@cluster0.mujzcv2.mongodb.net/my_database?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database', error);
        process.exit(1); // Terminate the application on database connection error
    }
}

const databaseName = 'your_database_name'; 
const userCollectionName = 'user';
const signupcollectionName = 'signup';
const documentCollectionName = 'documents';

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'No token provided' });
    }
    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
        if (err) {
            return res.status(401).send({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const database = client.db(databaseName);
    const collection = database.collection(signupcollectionName);
    
    try {
        const user = await collection.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const token = jwt.sign({ userId: user._id, email: user.username }, 'your_jwt_secret_key');
        res.json({ token });
    } catch (error) {
        console.error('Error during login', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const database = client.db(databaseName);
    const collection = database.collection(signupcollectionName);
    try {
        const result = await collection.insertOne({ username, password });
        res.json({ message: 'Signup successful', insertedId: result.insertedId });
    } catch (error) {
        console.error('Unable to insert data in collection');
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Share document route
app.post('/documents/:id/share', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    const database = client.db(databaseName);
    const collection = database.collection(documentCollectionName);

    try {
        const document = await collection.findOne({ _id: new ObjectId(id) });
        if (!document) {
            return res.status(404).send('Document not found');
        }

        if (!document.sharedWith.includes(email)) {
            document.sharedWith.push(email);
            await collection.updateOne({ _id: new ObjectId(id) }, { $set: { sharedWith: document.sharedWith } });
        }
        res.send(document);
    } catch (error) {
        console.error('Error sharing document:', error);
        res.status(500).send('Internal server error');
    }
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (userId) => {
        console.log(`User ${userId} joined the socket connection`);
    });

    socket.on('send-changes', (delta) => {
        socket.broadcast.emit('receive-changes', delta);
    });

    socket.on('get-document', async (id) => {
        const db = client.db(databaseName);
        const collection = db.collection(documentCollectionName);
        const document = await collection.findOne({ _id: new ObjectId(id) });
        socket.emit('load-document', document ? document.content : '');
    });

    socket.on('save-document', async ({ id, content }) => {
        const db = client.db(databaseName);
        const collection = db.collection(documentCollectionName);
        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { content } },
            { upsert: true }
        );
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

async function startServer() {
    await connectToDatabase();
    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

startServer();
