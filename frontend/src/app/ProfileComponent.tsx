import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {DrawComponent} from './DashboardComponent';

const ProfileComponent: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [imagePath, setImagePath] = useState("");
    const [error, setError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        console.log(event.target.value);
        setBio(event.target.value);
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    }

    // Check if user is signed in
    useEffect(() => {
        fetch("http://localhost:8080/api/me", {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => {
            if (!resp.ok) {
                throw new Error("User not authenticated!");
            }
            return resp.json();
        })
        .catch(() => {
            navigate('/');
        });
    }, [navigate]);

    useEffect(() => {
        fetch("http://localhost:8080/check-verification", {
            method: 'GET',
            credentials: "include"
        })
        .then(resp => {
            if(!resp.ok){
                throw new Error("Email not verified!");
            }
        })
        .catch((error) => {
            navigate('/');
        })
    }, [navigate]);

    
    useEffect(() => {
        fetch("http://localhost:8080/users/self", {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => {
            if (!resp.ok){
                throw new Error("Some error occured");

            }
            return resp.json();
        })
        .then(data => {
            console.log("Fetched data:", data);
            setUsername(data.username);
            setBio(data.bio);
            setImagePath(data.imagePath);
        })
    }, [])

    const saveChanges = ({ username, bio }: { username: string; bio: string }) => {
        console.log(username);
        console.log(bio);
        fetch("http://localhost:8080/users/self", {
            method: 'PATCH',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "name": username,
                "bio": bio
            })
        })
        .then(resp => {
            if(resp.status === 409) {
                setError("Username already exists!");
                setSaveSuccess(false);
            }
            else if(!resp.ok){
                console.log("Failed to fetch posts");
                setSaveSuccess(false);
            }
            else{
                setSaveSuccess(true);
            }
            return resp.json();
        });
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div style={{
                    border: '2px solid #343A40',
                    borderRadius: '0.5rem',
                    margin: '0 auto',
                    width: '75%',
                    height: '75vh',
                    padding: '1rem',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                        <div style={{
                            width: '25%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '1rem',
                        }}>
                            <label className="block text-black text-center">
                                <span>username: </span>
                                <input contentEditable className="outline outline-2 outline-gray-800 rounded-md m-2 mt-4 p-1" 
                                style={{display: 'block', overflowX:'hidden', width: '200px'}}
                                id="username"
                                onChange={handleUsernameChange}
                                value={username || ""}
                                />
                            </label>

                            <label className="block text-black text-center">
                                <span>Bio:</span>
                                <textarea 
                                    style={{ 
                                        width: '300px', 
                                        height: '250px', 
                                        overflowY: 'auto', 
                                        overflowX: 'hidden', 
                                        display: 'block', 
                                        wordBreak: 'break-word', 
                                        textAlign: 'start' 
                                    }}
                                    onChange={handleBioChange}
                                    value={bio || ""}
                                    id="bio"
                                    className="outline outline-2 outline-gray-800 rounded-md m-2 mt-4 p-2"
                                />
                            </label>

                            <button 
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: '#17A2B8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                            }}
                            onClick={() => saveChanges({ username, bio })}
                            >
                            Save Changes
                            </button>
                            <p className='text-red-500 font-bold'>{error}</p>
                            {saveSuccess && <p className='text-blue-500 font-bold'>User information saved!</p>}

                        </div>
                        <div style={{ flex: 1, padding: '1rem' }}>
                            <p className="text-black ml-4">Most Recent Post:</p>
                            <div className="outline outline-2 outline-gray-800 rounded-md m-2 mt-4 p-1">
                                <DrawComponent
                                    username={""}
                                    imagePath={imagePath}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileComponent;