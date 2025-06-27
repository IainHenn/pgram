import { error } from 'console';
import { useParams } from 'next/navigation';
import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation} from 'react-router-dom';

function VerifyEmailComponent(){
    const location = useLocation();
    let token = null;

    let params = new URLSearchParams(location.search);
    token = params.get("token");
    console.log(token.toString());

    const [message, setMessage] = useState("");

    const signupUser = () => {
        fetch(`http://localhost:8080/verify?token=${token}`, {
            method: 'POST'
        })
        .then(resp => {
            if(!resp.ok){
                resp.text().then(msg => setMessage(msg));
                return;
            } else {
                resp.text().then(msg => setMessage(msg));
            }
        })
        .catch((error) => {
            alert(error);
        });
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-5 border border-gray-300 rounded-md">
                <button className="block w-full p-2 bg-black text-white rounded hover:bg-black-600" onClick={signupUser}>Confirm Sign Up</button>
                <p className='text-black font-bold mt-3'>{message}</p>
            </div>
        </div>
    );  
};

export default VerifyEmailComponent;