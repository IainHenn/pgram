import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
function LoginComponent(){
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');


    const handleClick = () => {
        navigate('/signup');
    }

    function loginUser() {
        fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, password})
        })
        .then((response) => response.text()) // Use .text() to inspect raw response
        .then((data) => {
            console.log(data); // Log the raw response
            return JSON.parse(data); // Parse if valid
        })
        .catch((error) => {
            alert(error.message);
        });
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-5 border border-gray-300 rounded-md">
                <input 
                    className="block w-full mb-3 p-2 border border-gray-300 rounded text-black placeholder:text-center" 
                    placeholder="enter username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input 
                    className="block w-full mb-3 p-2 border border-gray-300 rounded text-black placeholder:text-center" 
                    placeholder="enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="block w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={loginUser}>Login</button>
                <button className="block w-full p-2 bg-black text-white rounded hover:bg-black-600" onClick={handleClick}>Sign Up</button>
            </div>
        </div>
    );  
};

export default LoginComponent;