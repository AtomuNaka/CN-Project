import React, { useRef, useEffect, useState } from "react";

const ConvertAudio = ({ message }) => {
  const audioElementRef = useRef(null);
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    const loadAudio = async () => {
      // Check if the message contains a Blob URL
      const isBlobURL =
        typeof message.message === "string" &&
        message.message.includes("blob:http://localhost:3000");

      if (isBlobURL) {
        // Create an audio element
        const audioElement = new Audio(message);

        // Wait for the audio to be loaded
        await new Promise((resolve) => {
          audioElement.addEventListener("onLoadedData", resolve, {
            once: true,
          });
        });

        // Set the audio element in the ref
        audioElementRef.current = audioElement;

        // Set the audioLoaded state to true
        setAudioLoaded(true);
      }
    };

    loadAudio();
  }, [message]);

  return (
    <div>
      {/* Render the audio element with controls if available, otherwise show "No music" */}
      {audioLoaded ? <audio controls ref={audioElementRef} /> : <p>No music</p>}
    </div>
  );
};

export default ConvertAudio;
