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

    function signupUser(){
        fetch('http://localhost:8080/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, password, email})
        })
        .then(resp => {
            if(!resp.ok){
                return resp.json().then((error) => {
                    setError('Error bad credentials or an error on the system!');
                })
            }
            else{
                navigate("/");
            }
        })
        .catch((error) => {
            setError('Error bad credentials or an error on the system!');
        })
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