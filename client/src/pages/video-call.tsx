// src/pages/VideoCall.tsx
import React, {useEffect, useRef, useState} from "react";

const socket = new WebSocket("wss://e4fb-79-125-235-150.ngrok-free.app:8000/ws");

const VideoCall = () => {
    const localVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);
    const [pc] = useState(new RTCPeerConnection());

    useEffect(() => {
        let localStream: MediaStream;

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera access is not supported in this browser.");
            return;
        }

        navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
            localStream = stream;

            if (localVideo.current) {
                localVideo.current.srcObject = stream;
            }

            stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });

        pc.ontrack = event => {
            if (remoteVideo.current) {
                remoteVideo.current.srcObject = event.streams[0];
            }
        };

        pc.onicecandidate = e => {
            if (e.candidate) {
                socket.send(JSON.stringify({type: "candidate", candidate: e.candidate}));
            }
        };

        socket.onmessage = async message => {
            const data = JSON.parse(message.data);
            if (data.type === "offer") {
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({type: "answer", answer}));
            } else if (data.type === "answer") {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            } else if (data.type === "candidate") {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        };

        return () => {
            // 🛑 Cleanup media stream
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }

            // Optional: close peer connection and socket
            pc.close();
            socket.close();
        };
    }, [pc]);


    const startCall = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.send(JSON.stringify({type: "offer", offer}));
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <video ref={localVideo} autoPlay muted playsInline className="w-1/2 border"/>
            <video ref={remoteVideo} autoPlay playsInline className="w-1/2 border"/>
            <button
                onClick={startCall}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Start Call
            </button>
        </div>
    );
}
export default VideoCall;
