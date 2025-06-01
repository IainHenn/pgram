import React from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { error } from 'console';

const DrawComponent: React.FC<{ username: string; imagePath: string }> = ({ username, imagePath }) => {
    return (
        <div>
            <h1 className='text-black'>{username}</h1>
            <a>
                <img src={imagePath} alt="Failed to fetch user post!" className='text-black'></img>
            </a>
        </div>
    );
};

function DashboardComponent(){
    interface Post {
        username: string; 
        imagePath: string;
    }
    const [posts, setPosts] = useState<Post[]>([]);
    const navigate = useNavigate();

    const sendToDraw = () => {
        navigate('/draw');
    }

    function signOut(){
        fetch("http://localhost:8080/api/logout", {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => {
            if(!resp.ok){
                throw new Error("Failed to signout!");
            }
            navigate("/");
        })
        .catch((error) => {
            alert(`Error! ${error}`);
        })
    }

    //Checking for user authentication, otherwise redirect them to login page
    useEffect(() => {
        fetch("http://localhost:8080/api/me", {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => {
            if(!resp.ok){
                throw new Error("User not authenticated!");
            }
            return resp.json()
        })
        .catch((error) => {
            navigate('/');
        })
    }, [navigate]);

    useEffect(() => {
        fetch("http://localhost:8080/posts", {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => {
            if(!resp.ok){
                console.log("Failed to fetch posts");
            }
            return resp.json();
        })
        .then(data => {
            if(data){
                console.log(data);
                setPosts(data["result"]);
            } else {
                console.log("no data bruv");
            }
        });
    }, []);

    return (
        <>
            <nav className="bg-gray-300 text-white p-4 flex items-center justify-between">
                <div className="space-x-4 hidden md:flex">
                    <Link to="/dashboard" className="text-gray-800 font-bold">Pictogram</Link>
                </div>
            <button className='bg-blue-300 text-black px-4 py-2 rounded hover:bg-blue-800' onClick={sendToDraw}>Draw</button>
            <button className="bg-blue-300 text-black px-4 py-2 rounded hover:bg-red-600" onClick={signOut}>Sign Out</button>
            </nav>

            <div className="bg-white min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {posts.map((post, index) => (
                    <div key={index} className="border rounded-lg shadow-md p-4 bg-gray-100 h-1/2">
                        <DrawComponent
                            username={post.username}
                            imagePath={post.imagePath}
                        />
                    </div>
                ))}
            </div>
        </>
    );  
};

export default DashboardComponent;