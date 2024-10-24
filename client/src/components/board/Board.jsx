import { useEffect, useRef } from "react";
import io from "socket.io-client";

function Board() {
    const canvasRef = useRef(null); // Reference to the canvas element
    const socketRef = useRef(null); // Reference to store the socket instance

    useEffect(() => {
        // Initialize the socket connection
        socketRef.current = io.connect(import.meta.env.VITE_SERVER_URL);

        // Setup socket listener for receiving canvas data
        socketRef.current.on("canvas-data", (data) => {
            const image = new Image();
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            image.onload = () => {
                ctx.drawImage(image, 0, 0);
            };
            image.src = data;
        });

        // Setup socket listener for clearing the canvas
        socketRef.current.on("clear-canvas", () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        });

        // Draw on canvas once the component mounts
        drawOnCanvas();

        // Cleanup on component unmount
        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const drawOnCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const sketch = document.querySelector('#sketch');
        const sketchStyle = getComputedStyle(sketch);
        canvas.width = parseInt(sketchStyle.getPropertyValue('width'));
        canvas.height = parseInt(sketchStyle.getPropertyValue('height'));

        let mouse = { x: 0, y: 0 };
        let lastMouse = { x: 0, y: 0 };

        /* Mouse capturing work */
        canvas.addEventListener('mousemove', function (e) {
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);

        /* Drawing on Paint App */
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'blue';

        canvas.addEventListener('mousedown', function () {
            canvas.addEventListener('mousemove', onPaint, false);
        }, false);

        canvas.addEventListener('mouseup', function () {
            canvas.removeEventListener('mousemove', onPaint, false);
        }, false);

        const onPaint = () => {
            ctx.beginPath();
            ctx.moveTo(lastMouse.x, lastMouse.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.closePath();
            ctx.stroke();

            const base64ImageData = canvas.toDataURL("image/png");
            socketRef.current.emit("canvas-data", base64ImageData); // Emit the canvas data directly
        };
    };

    // Function to clear the canvas
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the local canvas
        socketRef.current.emit("clear-canvas"); // Emit the clear event to the server
    };

    return (
        <div id="sketch" className="w-full h-full">
            <canvas ref={canvasRef} className="w-full h-full" id="board"></canvas>
            <button className="bg-red-600 mt-5 p-2 text-center rounded-xl" onClick={clearCanvas}>Clear Canvas</button> {/* Button to clear canvas */}
        </div>
    );
}

export default Board;
