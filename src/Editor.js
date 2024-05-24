import { useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Box, Button, TextField } from '@mui/material';
import styled from '@emotion/styled';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Component = styled.div`
    background: #F5F5F5;
`;

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean']
];

const Editor = () => {
    const [socket, setSocket] = useState(null);
    const [quill, setQuill] = useState(null);
    const [email, setEmail] = useState('');
    const { id } = useParams();

    useEffect(() => {
        const quillServer = new Quill('#container', { theme: 'snow', modules: { toolbar: toolbarOptions } });
        quillServer.disable();
        quillServer.setText('Loading the document...');
        setQuill(quillServer);
    }, []);

    useEffect(() => {
        const socketServer = io('http://localhost:8080');
        setSocket(socketServer);

        return () => {
            socketServer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !quill) return;

        const handleChange = (delta, oldData, source) => {
            if (source !== 'user') return;
            socket.emit('send-changes', delta);
        };

        quill.on('text-change', handleChange);

        return () => {
            quill.off('text-change', handleChange);
        };
    }, [quill, socket]);

    useEffect(() => {
        if (!socket || !quill) return;

        const handleChange = (delta) => {
            quill.updateContents(delta);
        };

        socket.on('receive-changes', handleChange);

        return () => {
            socket.off('receive-changes', handleChange);
        };
    }, [quill, socket]);

    useEffect(() => {
        if (!quill || !socket) return;

        socket.once('load-document', (document) => {
            quill.setContents(document);
            quill.enable();
        });

        socket.emit('get-document', id);
    }, [quill, socket, id]);

    useEffect(() => {
        if (!socket || !quill) return;

        const interval = setInterval(() => {
            socket.emit('save-document', { id, content: quill.getContents() });
        }, 2000);

        return () => {
            clearInterval(interval);
        };
    }, [socket, quill, id]);

    const handleShare = async () => {
        const token = localStorage.getItem('token'); // Ensure the token is stored here after login
        if (!token) {
            console.error('No token found, please login first.');
            return;
        }

        try {
            await axios.post(
                `http://localhost:8080/documents/${id}/share`,
                { email },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Document shared successfully');
        } catch (error) {
            console.error('Error sharing document:', error);
        }
    };

    return (
        <Component>
            <Box className='container' id='container' style={{ height: '100vh' }}></Box>
            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                <TextField
                    label="Share with email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleShare} style={{ marginLeft: '10px' }}>
                    Share
                </Button>
            </Box>
        </Component>
    );
};

export default Editor;
