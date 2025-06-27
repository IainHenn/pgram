import { error } from 'console';
import { useParams } from 'next/navigation';
import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation} from 'react-router-dom';

function PasswordResetComponent(){
    const location = useLocation();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    let token = null;

    let params = new URLSearchParams(location.search);
    token = params.get("token");

    const [message, setMessage] = useState("");

    const changePassword = async () => {
        // First, verify the token
        const verifyResp = await fetch(`http://localhost:8080/users/verify-token?token=${token}`, {
            method: 'POST'
        });

        if (!verifyResp.ok) {
            const msg = await verifyResp.text();
            setMessage(msg);
            return;
        }

        if (!oldPassword || !newPassword) {
            setMessage("Both old and new passwords are required.");
            return;
        }

        fetch(`http://localhost:8080/users/reset-password?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                oldPassword,
                newPassword
            })
        })
        .then(resp => {
            resp.text().then(msg => setMessage(msg));
        })
        .catch((error) => {
            setMessage("An error occurred: " + error);
        });
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-5 border border-gray-300 rounded-md">
                <input 
                    className="block w-full mb-3 p-2 border border-gray-300 rounded text-black placeholder:text-center" 
                    placeholder="enter old password"
                    onChange={(e) => setOldPassword(e.target.value)}
                />

                <input 
                    className="block w-full mb-3 p-2 border border-gray-300 rounded text-black placeholder:text-center" 
                    placeholder="enter new password"
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <button className="block w-full p-2 bg-black text-white rounded hover:bg-black-600" onClick={changePassword}>Change Password</button>
                <p className='text-black font-bold mt-3'>{message}</p>
            </div>
        </div>
    );  
};

export default PasswordResetComponent;