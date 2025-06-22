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
    const [resend, setResend] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [emailSentMessage, setEmailSentMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);


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

            setResend(true);
            setEmailSentMessage("Verification email sent!");
            setIsSubmitting(true);

        } catch {
            setError('Error bad credentials or an error on the system!');
        }
    }

    function resendEmail(){
        fetch("http://localhost:8080/resend-token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"email": email})
        })
        .then(resp => {
            if(!resp.ok){
                console.log("verification fail");
                throw new Error("Email not verified!");
            }
            setResendMessage("Verification email resent!");
        })
        .catch(() => {
            navigate('/');
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
                <button className="block w-full p-2 bg-black text-white rounded hover:bg-black-600" onClick={signupUser} disabled={isSubmitting}>Sign Up</button>
                {emailSentMessage !== "" && <p className='text-blue-500 font-bold'>{emailSentMessage}</p>}
                {resend && <button className="block w-full p-2 bg-blue-400 text-white rounded hover:bg-blue-600" onClick={resendEmail}>Resend</button>}
                {resendMessage !== "" && <p className='text-blue-500 font-bold'>{resendMessage}</p>}
            </div>
        </div>
    );  
};


export default SignupComponent;