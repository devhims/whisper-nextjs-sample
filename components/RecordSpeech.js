import { useState, useRef } from 'react';

const RecordSpeech = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const startRecording = async () => {
    setIsRecording(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener('dataavailable', (event) => {
      setAudioBlob(event.data);
    });

    mediaRecorder.addEventListener('stop', () => {
      setIsRecording(false);
      mediaRecorderRef.current = null;
    });

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
  };

  const uploadAudio = async () => {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([audioBlob], { type: 'audio/wav' }),
      'audio.wav'
    );

    const response = await fetch('/api/whisper', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log(data.text);
  };

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Record
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop
      </button>
      <button onClick={uploadAudio} disabled={!audioBlob}>
        Upload
      </button>
    </div>
  );
};

export default RecordSpeech;
