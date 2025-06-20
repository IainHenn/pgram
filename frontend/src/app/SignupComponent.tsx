import { error } from 'console';
import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignupComponent(){
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    async function signupUser() {
        try {
            const resp1 = await fetch('http://localhost:8080/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, password, email })
            });

            if (resp1.status !== 201) {
                await resp1.json();
                setError('Error bad credentials or an error on the system!');
                return;
            }

            const resp2 = await fetch(`http://localhost:8080/generate-token?email=${email}`, {
                method: 'POST'
            });

            if (!resp2.ok) {
                await resp2.json();
                setError('Error bad credentials or an error on the system!');
                return;
            }

            navigate("/");
        } catch {
            setError('Error bad credentials or an error on the system!');
        }
    }
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-5 border border-gray-300 rounded-md">
                <input
                    id="usernameInput"
                    className="block w-full mb-3 p-2 border border-gray-300 rounded text-black placeholder:text-center" 
                    placeholder="enter username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input 
                    id="passwordInput"
                    className="block w-full mb-3 p-2 border border-gray-300 rounded text-black placeholder:text-center" 
                    placeholder="enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    id="emailInput"
                    className="block w-full mb-3 p-2 border border-gray-300 rounded text-black placeholder:text-center" 
                    placeholder="enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <p className='text-red-500 font-bold'>{error}</p>
                <button className="block w-full p-2 bg-black text-white rounded hover:bg-black-600" onClick={signupUser}>Sign Up</button>
            </div>
        </div>
    );  
};


export default SignupComponent;