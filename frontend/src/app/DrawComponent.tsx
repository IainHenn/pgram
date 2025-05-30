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

    const post = () => {

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.toBlob((blob) => {
                
                if(!blob){
                    alert("Failed to save blob as image!");
                    return;
                }

                const formData = new FormData();
                formData.append("image",blob,"user-image.png");

                fetch("http://localhost:8080/api/images", {
                    method: 'POST',
                    credentials: "include",
                    body: formData
                })
                .then(resp => {
                    if (!resp.ok){
                        throw new Error("Error posting image!");
                    }
                    return resp.json()
                })
                .then(data => {
                    console.log(data);
                })
                .catch((error) => {
                    alert(error);
                })
            });
        }
    }

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

    // Clear the drawing
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
                    marginBottom: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                }}
                onClick={() => setCollapsed(!collapsed)}
                >
                Collapse
                </button>
                <button
                style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#6C757D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                }}
                onClick={post}
                >
                Post
                </button>
                <button
                style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#28A745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                }}
                >
                Save and Continue
                </button>
                <button
                style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#FFC107',
                    color: 'black',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                }}
                onClick={undo}
                >
                Undo
                </button>
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
                onClick={redo}
                >
                Redo
                </button>
                <button
                style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#DC3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                }}
                onClick={clear}
                >
                Clear
                </button>
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
                Exit
                </button>
            </div>
            )}
            <div className="bg-light min-h-screen" style={{ padding: '1rem', backgroundColor: 'white' }}>
            {collapsed && (
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
                    color: 'white',
                }}
                >
                <button
                    style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    }}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    Expand
                </button>
                </div>
            )}
            <canvas
                ref={canvasRef}
                width={1400}
                height={800}
                style={{
                border: '2px solid #343A40',
                borderRadius: '0.5rem',
                cursor: 'crosshair',
                display: 'block',
                margin: '0 auto',
                }}
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