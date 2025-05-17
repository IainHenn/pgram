import React from 'react';
import { useNavigate } from 'react-router-dom';
function LoginComponent(){
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/signup');
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-5 border border-gray-300 rounded-md">
                <input 
                    className="block w-full mb-3 p-2 border border-gray-300 rounded text-black placeholder:text-center" 
                    placeholder="enter username"
                />

                <input 
                    className="block w-full mb-3 p-2 border border-gray-300 rounded text-black placeholder:text-center" 
                    placeholder="enter password"
                />

                <button className="block w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Login</button>
                <button className="block w-full p-2 bg-black text-white rounded hover:bg-black-600" onClick={handleClick}>Sign Up</button>
            </div>
        </div>
    );  
};

export default LoginComponent;