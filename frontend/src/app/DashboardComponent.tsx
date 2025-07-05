import React from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { error } from 'console';
import InfiniteScroll from 'react-infinite-scroll-component';
import { redirect } from 'next/dist/server/api-utils';


interface DrawComponentProps {
    username: string;
    imagePath: string;
    postId: number;
    deleteable: boolean;
    profilePicturePath: string;
    onDelete?: (postId: number) => void;
    onPFP: boolean;
}

const DrawComponent: React.FC<DrawComponentProps> = ({ username, imagePath, postId, profilePicturePath, deleteable, onDelete, onPFP}) => {
    const [showOptions, setShowOptions] = useState<boolean | "deleted">(false);
    const navigate = useNavigate();

    const handleOptionsClick = () => {
        setShowOptions((prev) => !prev);
    };

    const redirectToProfile = (username: string) => {
        navigate(`/profile/${username}`)
    }
        


    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    {!onPFP && <img
                        src={profilePicturePath}
                        style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => redirectToProfile(username)}
                    />}
                    <h1
                        className="text-black font-bold hover:underline text-4xl"
                        onClick={() => redirectToProfile(username)}
                    >
                        {username}
                    </h1>
                </div>
                {deleteable && (
                    <div className="relative">
                        <button
                            className="bg-gray-500 font-bold rounded-full p-3 hover:bg-gray-700 transition"
                            aria-label="Options"
                            onClick={handleOptionsClick}
                        >
                            <span className="text-2xl font-bold" title="Options">&#8942;</span>
                        </button>
                        {showOptions && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                                {showOptions === "deleted" ? (
                                    <div className="px-4 py-2 text-green-600">Post Deleted</div>
                                ) : (
                                    <button
                                        className="block w-full text-left px-4 py-2 rounded text-red-600 hover:bg-gray-100"
                                        onClick={() => {
                                            let confirmDelete = confirm('Are you sure you would like to delete this post?');
                                            if (confirmDelete) {
                                                fetch(`http://localhost:8080/posts/${postId}`, {
                                                    method: 'DELETE',
                                                    credentials: "include",
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    }
                                                })
                                                .then(resp => {
                                                    if (resp.status !== 204) {
                                                        throw new Error("Failed to delete post!");
                                                    }
                                                    setShowOptions("deleted");
                                                    if (onDelete) {
                                                        onDelete(postId);
                                                    }
                                                    setTimeout(() => setShowOptions(false), 6000);
                                                })
                                                .catch((error) => {
                                                    alert(`Error! ${error}`);
                                                    setShowOptions(false);
                                                });
                                            } else {
                                                setShowOptions(false);
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <a>
                <img src={imagePath} alt="Failed to fetch user post!" className='text-black' />
            </a>
        </div>
    );
};

function DashboardComponent(){
    interface Post {
        username: string; 
        imagePath: string;
        id: string;
        profilePicturePath: string;
    }
    const [pageNum, setPageNum] = useState(-1);
    const [dataAvailable, setDataAvailable] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const navigate = useNavigate();
    const [userLoggedIn, setUserLoggedIn] = useState("");
    const [focusedPost, setFocusedPost] = useState(null);


    const handleDeletePost = (postId: number) => {
        setPosts(prevPosts => prevPosts.filter(post => Number(post.id) !== postId));
    };

    const sendToDraw = () => {
        navigate('/draw');
    }

    const sendToProfile = () => {
        navigate(`/profile/${userLoggedIn}`);
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
            return resp.json();
        })
        .catch((error) => {
            navigate('/');
        })
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
            if(!resp.ok){
                throw new Error("User not authenticated!");
            }
            return resp.json()
        })
        .then(data => {
            setUserLoggedIn(data.username);
        })
    }, []);


    const fetchData = () => {
        const nextPage = pageNum + 1;
        fetch(`http://localhost:8080/posts?page=${nextPage}&size=6`, {
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
                if (data && data.content && data.content.length > 0) {
                    setPosts(prev => [...prev, ...data.content]);
                    setPageNum(nextPage);
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
        fetch(`http://localhost:8080/posts?page=0&size=6`, {
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
            if(data && data.content && data.content.length > 0) {
                setPosts(data.content);
                setPageNum(0);
            } else {
                setDataAvailable(false);
            }
        })
        .catch(() => setDataAvailable(false));
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
                        <div
                            key={index}
                            className="border rounded-lg shadow-md p-4 bg-gray-100 hover:bg-gray-500 h-[50%] w-[90%]"
                            onClick={() => setFocusedPost(post)}
                            style={{ cursor: 'pointer' }}
                        >
                            <DrawComponent
                                username={post.username}
                                imagePath={post.imagePath}
                                postId={Number(post.id)}
                                profilePicturePath={post.profilePicturePath}
                                deleteable={userLoggedIn === post.username}
                                onDelete={handleDeletePost}
                                onPFP={false}
                            />
                        </div>
                    ))}
                </div>

                {focusedPost && (
                    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60 z-50 h-full w-full"
                    onClick={e => {
                        if (e.target === e.currentTarget) {
                            setFocusedPost(null);
                        }
                    }}>
                        <div className="bg-grey-100 rounded-lg p-8 shadow-lg max-w-xl max-h-xl w-full relative">
                            <DrawComponent
                                username={focusedPost.username}
                                imagePath={focusedPost.imagePath}
                                profilePicturePath={focusedPost.profilePicturePath}
                                postId={Number(focusedPost.id)}
                                deleteable={userLoggedIn === focusedPost.username}
                                onDelete={handleDeletePost}
                                onPFP={false}
                            />
                        </div>
                    </div>
                )}

            </InfiniteScroll>
        </>
    );  
};

export default DashboardComponent;
export { DrawComponent };