"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DrawComponent: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);

    // Attaching canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = 'black';
                setContext(ctx);
            }
        }
    }, []);

    // Checking if user is logged in, otherwise kick them out
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

    // Save state - clears stack + sets history with current canvas
    const saveState = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL();
            setHistory(prev => [...prev, dataUrl]);
            setRedoStack([]);
        }
    };

    // Undo function
    const undo = () => {
        if (history.length > 0) {
            const canvas = canvasRef.current;
            if (canvas && context) {
                const newHistory = [...history];
                const lastState = newHistory.pop();
                setRedoStack(prev => [...prev, canvas.toDataURL()]);
                setHistory(newHistory);

                const img = new Image();
                img.src = lastState || '';
                img.onload = () => {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(img, 0, 0);
                };
            }
        }
    };

    // Redo function
    const redo = () => {
        if (redoStack.length > 0) {
            const canvas = canvasRef.current;
            if (canvas && context) {
                const newRedoStack = [...redoStack];
                const nextState = newRedoStack.pop();
                setRedoStack(newRedoStack);
                setHistory(prev => [...prev, canvas.toDataURL()]);

                const img = new Image();
                img.src = nextState || '';
                img.onload = () => {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(img, 0, 0);
                };
            }
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            setRedoStack([]);
            setHistory([]);
        }
    }

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!context) return;

        saveState();
        context.beginPath();
        context.moveTo(
            event.nativeEvent.offsetX,
            event.nativeEvent.offsetY
        );
        setIsDrawing(true);
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !context) return;

        context.lineTo(
            event.nativeEvent.offsetX,
            event.nativeEvent.offsetY
        );
        context.stroke();
    };

    const stopDrawing = () => {
        if (!context) return;

        context.closePath();
        setIsDrawing(false);
    };

    const leaveDraw = () => {
        navigate("/dashboard");
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'z') {
                undo();
            } else if (event.ctrlKey && event.key === 'y') {
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo]);

    return (
        <>
            {!collapsed && (
                <div style={{ position: 'absolute', top: '20px', height: '150px', right: '20px', width: '10rem', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1000 }}>
                    <button>
                        <span className="w-40 absolute top-0 right-0 text-black bg-blue-300 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold text-lg p-2.5 text-center flex justify-center inline-flex items-center rounded-t" onClick={() => setCollapsed(!collapsed)}>&uarr;</span>
                    </button>

                    <button>
                        <span className="w-40 h-14 absolute top-12 right-0 text-black bg-purple-500 hover:bg-purple-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold text-sm p-2.5 text-center flex justify-center inline-flex items-center">Post</span>
                    </button>

                    <button>
                        <span className="w-40 h-14 absolute top-26 right-0 text-black bg-green-500 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold text-sm p-2.5 text-center flex justify-center inline-flex items-center">Save and Continue</span>
                    </button>

                    <button>
                        <span className="w-40 h-14 absolute top-40 right-0 text-black bg-white-500 hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold text-lg p-2.5 text-center flex justify-center inline-flex items-center" onClick={undo}>Undo</span>
                    </button>

                    <button>
                        <span className="w-40 h-14 absolute top-54 right-0 text-black bg-white-500 hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold text-lg p-2.5 text-center flex justify-center inline-flex items-center" onClick={redo}>Redo</span>
                    </button>

                    <button>
                        <span className="w-40 h-14 absolute top-68 right-0 text-black bg-white-500 hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold text-lg p-2.5 text-center flex justify-center inline-flex items-center" onClick={clear}>Clear</span>
                    </button>

                    <button>
                        <span className="w-40 h-14 absolute top-82 right-0 text-black bg-red-500 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold text-lg p-2.5 text-center flex justify-center inline-flex items-center rounded-b" onClick={leaveDraw}>Exit</span>
                    </button>
                </div>
            )}
            <div className="bg-white min-h-screen">
                {collapsed && (
                    <div style={{ position: 'absolute', top: '20px', height: '300px', right: '20px', width: '10rem', padding: '1rem' }}>
                        <button>
                            <span className="w-40 absolute top-0 right-0 text-black bg-blue-300 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold text-lg p-2.5 text-center flex justify-center inline-flex items-center rounded-t" onClick={() => setCollapsed(!collapsed)}>&darr;</span>
                        </button>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    width={1400}
                    height={800}
                    style={{ border: '1px solid black', cursor: 'crosshair' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />
            </div>
        </>
    );
};

export default DrawComponent;