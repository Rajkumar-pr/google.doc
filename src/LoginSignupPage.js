import React, { useState } from 'react';


import { useNavigate } from 'react-router-dom';

function LoginSignupPage() {
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoginForm, setIsLoginForm] = useState(true);
    const navigate = useNavigate();
    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: loginUsername, password: loginPassword })
            });

            const data = await response.json();

            if (response.ok) {
              
                navigate('/editor');
                console.log('Login successful');
                console.log('Login successful');
            } else {
                setError(data.error || 'Error logging in');
            }
        } catch (error) {
            console.error('Error logging in', error);
            setError('Internal server error');
        }
    };

    const handleSignup = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: signupUsername, password: signupPassword })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Signup successful');
            } else {
                setError(data.error || 'Error signing up');
            }
        } catch (error) {
            console.error('Error signing up', error);
            setError('Internal server error');
        }
    };

    return (
      
            <div>
                <h1>{isLoginForm ? 'Login Page' : 'Signup Page'}</h1>
                {error && <div>{error}</div>}
                {isLoginForm ? (
                    <form onSubmit={handleLogin}>
                        <label>
                            Username:
                            <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required />
                        </label><br /><br />
                        <label>
                            Password:
                            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                        </label><br /><br />
                        <button type="submit">Login</button>
                        <button type="button" onClick={() => setIsLoginForm(false)}>Switch to Signup</button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup}>
                        <label>
                            Username:
                            <input type="text" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} required />
                        </label><br /><br />
                        <label>
                            Password:
                            <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                        </label><br /><br />
                        <button type="submit">Signup</button>
                        <button type="button" onClick={() => setIsLoginForm(true)}>Switch to Login</button>
                    </form>
                )}
            </div>
        
    );
}

export default LoginSignupPage;
