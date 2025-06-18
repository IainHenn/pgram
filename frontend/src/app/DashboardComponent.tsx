import React from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { error } from 'console';
import InfiniteScroll from 'react-infinite-scroll-component';


const DrawComponent: React.FC<{ username: string; imagePath: string }> = ({ username, imagePath }) => {
    return (
        <div>
            <h1 className='text-black font-bold'>{username}</h1>
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
    const [items, setItems] = useState([]);
    const [pageNum, setPageNum] = useState(-1);
    const [dataAvailable, setDataAvailable] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const navigate = useNavigate();


    const sendToDraw = () => {
        navigate('/draw');
    }

    const sendToProfile = () => {
        navigate('/profile');
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

    const fetchData = () => {
        fetch(`http://localhost:8080/posts?page=${pageNum + 1}&size=6`, {
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
                if (data && data.content && data.content.length > 0) {
                    setPosts(prev => [...prev, ...data.content]);
                    setPageNum(prev => prev + 1);
                } else {
                    setDataAvailable(false);
                }            
            } else {
                console.log("Failed to find sufficient data");
            }
        })
        .catch(() => setDataAvailable(false));
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <nav className="bg-gray-800 text-white p-4 flex items-center justify-between shadow-lg">
                <div className="space-x-4 flex items-center">
                    <Link to="/dashboard" className="text-white text-xl font-bold hover:text-blue-400 transition duration-300">
                        Pictogram
                    </Link>
                </div>
                <div className="space-x-4 flex items-center">
                    <button 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                        onClick={sendToProfile}
                    >
                        Profile
                    </button>
                    <button 
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                        onClick={sendToDraw}
                    >
                        Draw
                    </button>
                    <button 
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                        onClick={signOut}
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            <InfiniteScroll
                dataLength={posts.length}
                next={fetchData}
                hasMore={dataAvailable}
                loader={
                    <div className="bg-white min-h-screen flex justify-center items-center py-8">
                        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                }
            >
                <div className="bg-white min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-4">
                    {posts.map((post, index) => (
                        <div key={index} className="border rounded-lg shadow-md p-4 bg-gray-100 h-[100%] w-[90%]">
                            <DrawComponent
                                username={post.username}
                                imagePath={post.imagePath}
                            />
                        </div>
                    ))}
                </div>
            </InfiniteScroll>
        </>
    );  
};

export default DashboardComponent;
export { DrawComponent };