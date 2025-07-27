import React, { useState, useEffect, useRef } from "react";

const ChatBox = ({ onClose, neighbour = "User", wsRef, clientID, incomingMsg, draggable = true }) => {
    const [messages, setMessages] = useState([
        { type: 'incoming', text: 'Hello! How can I help you?' }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);

    const boxRef = useRef(null);
    const dragData = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

    useEffect(() => {
        if (!draggable) return;

        const handleMouseMove = (e) => {
            if (!dragData.current.dragging || !boxRef.current) return;
            boxRef.current.style.left = `${e.clientX - dragData.current.offsetX}px`;
            boxRef.current.style.top = `${e.clientY - dragData.current.offsetY}px`;
        };

        const handleMouseUp = () => {
            dragData.current.dragging = false;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggable]);

    const startDrag = (e) => {
        if (!draggable || !boxRef.current) return;
        dragData.current.dragging = true;
        const rect = boxRef.current.getBoundingClientRect();
        dragData.current.offsetX = e.clientX - rect.left;
        dragData.current.offsetY = e.clientY - rect.top;
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        wsRef.current.send(JSON.stringify({ type: 'user_msg', msg: newMessage, to: neighbour, from: clientID }))
        setMessages([...messages, { type: 'outgoing', text: newMessage }]);
        setNewMessage('');

        // setTimeout(() => {
        //     setMessages(prev => [...prev, { type: 'incoming', text: 'Thanks for your message!' }]);
        // }, 1000);
    };

    // wsRef.current.onmessage = (event)=> {
    //     const incomingMsg = JSON.parse(event.data);
    //     console.log(incomingMsg);
    // } 
    useEffect(() => {
        setMessages([
            { type: 'incoming', text: 'You are connected...!' }
        ])
    }, [neighbour])
    useEffect(() => {
        console.log("incoming message:", incomingMsg)
        setMessages(prev => [...prev, { type: 'incoming', text: incomingMsg.msg }])
    }, [incomingMsg])



    const handleKeyDown = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div
            ref={boxRef}
            className={`fixed top-20 right-5 max-w-md w-[90vw] md:w-full border rounded-xl shadow-lg bg-white z-[9999] flex flex-col transition-all duration-300 ${isMinimized ? 'h-auto' : 'min-h-[400px]'}`}
            style={{ cursor: draggable ? 'move' : 'default' }}
        >
            {/* Header */}
            <div
                className="flex justify-between items-center bg-blue-600 text-white px-4 py-2 rounded-t-xl cursor-move"
                onMouseDown={startDrag}
            >
                <div className="font-semibold">Chat with {neighbour}</div>
                <div className="flex gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="hover:opacity-80 text-lg">
                        {isMinimized ? '🔼' : '🔽'}
                    </button>
                    <button onClick={onClose} className="hover:text-red-400 text-xl leading-4">&times;</button>
                </div>
            </div>

            {/* Chat Body (Hidden if minimized) */}
            {!isMinimized && (
                <>
                    <div className="flex-1 p-4 overflow-y-auto max-h-[300px] space-y-2">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${msg.type === 'outgoing'
                                    ? 'bg-blue-500 text-white self-end ml-auto'
                                    : 'bg-gray-200 text-gray-800 self-start mr-auto'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="flex p-2 border-t gap-2">
                        <input
                            type="text"
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600"
                            onClick={sendMessage}
                        >
                            Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatBox