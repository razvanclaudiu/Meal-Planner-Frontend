// Home.tsx
import React, { useState, useEffect, useRef } from 'react';
import "../stylesheets/Home.css";
import track_image1 from "../assets/images/track_image (1).jpeg";
import track_image2 from "../assets/images/track_image (2).jpeg";
import track_image3 from "../assets/images/track_image (3).jpeg";
import track_image4 from "../assets/images/track_image (4).jpeg";
import track_image5 from "../assets/images/track_image (5).jpeg";
import track_image6 from "../assets/images/track_image (6).jpeg";
import track_image7 from "../assets/images/track_image (7).jpeg";
import track_image8 from "../assets/images/track_image (8).jpeg";
import track_image9 from "../assets/images/track_image (9).jpeg";
import track_image10 from "../assets/images/track_image (10).jpeg";

const Home: React.FC = () => {
    const [mouseDownAt, setMouseDownAt] = useState<number | null>(null);
    const [currentTranslate, setCurrentTranslate] = useState<number>(0);
    const trackRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: MouseEvent) => {
        if (!trackRef.current?.contains(e.target as Node)) return; // Check if the click is within the track
        setMouseDownAt(e.clientX);
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (mouseDownAt !== null) {
            const mouseDelta = mouseDownAt - e.clientX;
            const maxDelta = window.innerWidth;
            const percentage = (mouseDelta / maxDelta) * -100;
            const newTranslate = Math.max(Math.min(currentTranslate + percentage, 0), -100);
            setCurrentTranslate(newTranslate);
        }
        setMouseDownAt(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (mouseDownAt === null || !trackRef.current) return;

        const mouseDelta = mouseDownAt - e.clientX;
        const maxDelta = window.innerWidth;
        const percentage = (mouseDelta / maxDelta) * -100;
        const newTranslate = Math.max(Math.min(currentTranslate + percentage, 0), -100);

        const track = document.getElementById('image-track');
        if (track) {
            track.animate([{
                transform: `translate(${newTranslate}%, -50%)` }
            ], {
                duration: 1200, fill: 'forwards',
            });
        }

        // Adjust objectPosition for each image
        const images = trackRef.current.getElementsByClassName('track-image') as HTMLCollectionOf<HTMLImageElement>;
        Array.from(images).forEach(image => {
            image.animate({
                objectPosition: `${newTranslate + 100}% 50%`
            }, {duration:1200, fill: 'forwards'
            })
        });
    };

    useEffect(() => {
        trackRef.current?.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            trackRef.current?.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [mouseDownAt, currentTranslate]);

    return (
        <div>
            <h2 className="drag-images">Join the community</h2>
            <p className="drag-flavor">Drag the images to see some of our best rated recipes!</p>
            <h2 className="secret-message">Let's munch!</h2>
            <p className="secret-flavor">Register an account today!</p>
            <div id="image-track" className="track" ref={trackRef}>
                <img className="track-image" src={track_image1} alt="track" draggable="false" />
                <img className="track-image" src={track_image2} alt="track" draggable="false" />
                <img className="track-image" src={track_image3} alt="track" draggable="false" />
                <img className="track-image" src={track_image4} alt="track" draggable="false" />
                <img className="track-image" src={track_image5} alt="track" draggable="false" />
                <img className="track-image" src={track_image6} alt="track" draggable="false" />
                <img className="track-image" src={track_image7} alt="track" draggable="false" />
                <img className="track-image" src={track_image8} alt="track" draggable="false" />
                <img className="track-image" src={track_image9} alt="track" draggable="false" />
                <img className="track-image" src={track_image10} alt="track" draggable="false" />
            </div>
        </div>
    );
};

export default Home;
