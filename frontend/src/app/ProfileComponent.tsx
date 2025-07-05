import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DrawComponent } from './DashboardComponent';
import { useDropzone } from 'react-dropzone';

const ProfileComponent: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [imagePath, setImagePath] = useState("");
    const [error, setError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [self, isSelf] = useState(false);
    const [selfUsername, setSelfUsername] = useState('');
    const [usernameInURL, setUsernameInURL] = useState('');
    const [profilePicturePath, setProfilePicturePath] = useState('');
    const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBio(event.target.value);
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    }

    const leaveDraw = () => {
        navigate("/dashboard");
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
        .catch(() => {
            navigate('/');
        })
    }, [navigate]);

    // Fetch logged-in user's username
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
            setSelfUsername(data.username);
            setUsername(data.username);
            setLoading(false);
        })
        .catch(() => {
            setError("Failed to fetch user data");
        });
    }, []);

    useEffect(() => {
        if (loading) return;

        const hashPath = window.location.hash;
        const pathParts = hashPath.replace(/^#\/?/, '').split('/'); 
        const urlUsername = pathParts[pathParts.length - 1] || '';
        setUsernameInURL(urlUsername);

        if (urlUsername && urlUsername !== 'profile' && urlUsername !== selfUsername) {
            // Viewing someone else's profile
            fetch(`http://localhost:8080/users/${urlUsername}`)
            .then(resp => {
                if (!resp.ok) {
                    throw new Error("User not found");
                }
                return resp.json();
            })
            .then(data => {
                setUsername(data.username);
                setBio(data.bio);
                setImagePath(data.imagePath);
                setProfilePicturePath(data.profilePicturePath);
                isSelf(false);
            })
            .catch(() => {
                setError("User not found");
            });
        } else if (urlUsername === selfUsername || urlUsername === 'profile' || !urlUsername) {
            // Viewing own profile
            isSelf(true);
            fetch(`http://localhost:8080/users/${urlUsername}`)
            .then(resp => {
                if (!resp.ok) {
                    throw new Error("User not found");
                }
                return resp.json();
            })
            .then(data => {
                setUsername(data.username);
                setBio(data.bio);
                setImagePath(data.imagePath);
                setProfilePicturePath(data.profilePicturePath);
            })
            .catch(() => {
                setError("User not found");
            });
            
            setError("");
        }
    }, [selfUsername, loading, window.location.hash]);

    // Dropzone for profile picture
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setNewProfilePicture(acceptedFiles[0]);
            setPreviewUrl(URL.createObjectURL(acceptedFiles[0]));
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
        disabled: !self,
    });

    // Clean up preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const saveChanges = ({ username, bio }: { username: string; bio: string }) => {
        // If new profile picture, upload it first
        if (newProfilePicture) {
            const formData = new FormData();
            formData.append('profilePicture', newProfilePicture);
            fetch("http://localhost:8080/users/self/profile-picture", {
                method: 'POST',
                credentials: "include",
                body: formData
            })
            .then(resp => {
                if (!resp.ok) {
                    throw new Error("Failed to upload profile picture! Make sure it's a PNG, JPEG, or JPG");
                }
                return resp.json();
            })
            .then(data => {
                setProfilePicturePath(data.profilePicturePath);
                setNewProfilePicture(null);
                setPreviewUrl(null);
                // Now save username and bio
                saveUserInfo(username, bio);
            })
            .catch(() => {
                setError("Failed to upload profile picture");
                setSaveSuccess(false);
            });
        } else {
            saveUserInfo(username, bio);
        }
    };

    const saveUserInfo = (username: string, bio: string) => {
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
                            <div
                                {...getRootProps()}
                                style={{
                                    position: 'relative',
                                    width: 400,
                                    height: 400,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    cursor: self ? 'pointer' : 'default',
                                    border: isDragActive ? '3px dashed #17A2B8' : 'none',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f8f9fa'
                                }}
                                title={self ? "Click or drag to upload new profile picture" : undefined}
                            >
                                <input {...getInputProps()} />
                                <img
                                    src={previewUrl || profilePicturePath}
                                    alt="No PFP"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        opacity: isDragActive ? 0.5 : 1,
                                        pointerEvents: 'none'
                                    }}  
                                />
                                {self && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        width: '100%',
                                        background: 'rgba(23,162,184,0.7)',
                                        color: 'white',
                                        textAlign: 'center',
                                        padding: '1rem',
                                        fontWeight: 600,
                                        fontSize: '1rem'
                                    }}>
                                        {isDragActive ? "Drop image here..." : "Change Profile Picture"}
                                    </div>
                                )}
                            </div>

                            <label className="block text-black text-center">
                                <span>username: </span>
                                <input className="outline outline-2 outline-gray-800 rounded-md m-2 mt-4 p-1" 
                                style={{display: 'block', overflowX:'hidden', width: '200px'}}
                                id="username"
                                onChange={handleUsernameChange}
                                value={username || ""}
                                disabled={!self}
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
                                    disabled={!self}
                                />
                            </label>

                            {self && (
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
                            )}
                            <p className='text-red-500 font-bold'>{error}</p>
                            {saveSuccess && <p className='text-blue-500 font-bold'>User information saved!</p>}

                        </div>
                        <div style={{ flex: 1, padding: '1rem' }}>
                            <p className="text-black ml-4">Most Recent Post:</p>
                            <div className="outline outline-2 outline-gray-800 rounded-md m-2 mt-4 p-1">
                                <DrawComponent
                                    username={""}
                                    imagePath={imagePath}
                                    onPFP={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div
                style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '12rem',
                padding: '1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                zIndex: 1000,
                color: 'white',
                }}
            >
                <button
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#343A40',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                }}
                onClick={leaveDraw}
                >
                To Dashboard
                </button>
            </div>
        </div>
    )
}

export default ProfileComponent;