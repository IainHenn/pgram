import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Andada_Pro } from 'next/font/google';
function LoginComponent(){
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showEmailBox, setShowEmailBox] = useState(false);
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState('');
    

    const handleClick = () => {
        navigate('/signup');
    }

    function sendEmail(){
        fetch(`http://localhost:8080/users/generate-password-token?email=${email}`, {
            method: 'POST'
        })
        .then(resp => {
            if(!resp.ok){
                setError("Failed to send email!");
            }
            else {
                setError('');
                setSuccess("Successfully sent password reset email!");
            }
        })
        .catch((error) => {
            setError(error.message || 'Failed to send email!');
        });
    }


    function loginUser() {
        setError('');
        fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ name, password })
        })
        .then(loginResp => {
            if (!loginResp.ok) {
                setError('Error bad credentials or an error on the system!');
                return;
            }
            navigate("/dashboard");
        })
        .catch((error) => {
            setError(error.message || 'Error bad credentials or an error on the system!');
        });
    }

    return (
        <>
            {!showEmailBox && 
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
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className='text-red-500 font-bold'>{error}</p>
                        <button className="block w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4" onClick={loginUser}>Login</button>
                        <button className="block w-full p-2 bg-black text-white rounded hover:bg-gray-700 mb-4" onClick={handleClick}>Sign Up</button>
                        <p 
                            className="cursor-pointer text-blue-600 hover:underline p-0"
                            onClick={() => {setShowEmailBox(true)}}
                        >
                            Forgot Password?
                        </p>
                    </div>
                </div>
            }

            {showEmailBox && 
                <div className="flex items-center justify-center min-h-screen bg-gray-100">
                    <div className="bg-white p-5 border border-gray-300 rounded-md">
                        <input 
                            className="block w-full mb-3 p-2 border border-gray-300 rounded text-black placeholder:text-center" 
                            placeholder="enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button className="block w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4" onClick={sendEmail}>Send Email</button>

                        <p 
                        className="cursor-pointer text-blue-600 hover:underline p-0"
                        onClick={() => {
                            setShowEmailBox(false);
                            }
                        }
                        >
                            Go Back To Login?
                        </p>
                        <p className='text-red-500 font-bold'>{error}</p>
                        <p className='text-blue-500 font-bold'>{success}</p>
                    </div>
                </div>
            }
        </>
    );  
}

export default LoginComponent;