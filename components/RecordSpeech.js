import { Flex, Box, Image, Text, SlideFade, Stack } from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { ReactMic } from 'react-mic';

const MicWithImage = ({ isRecording, startRecording, stopRecording }) => {
  return (
    <Box position='relative' display='inline-block'>
      <ReactMic
        record={isRecording}
        className='sound-wave'
        strokeColor='#4ad295'
        backgroundColor='#ffffff'
      />
      {!isRecording && (
        <Image
          src='microphone.png' // Replace with the path to your image
          alt='Image description' // Replace with a description of the image
          width='80px' // Adjust the width as needed
          height='80px' // Adjust the height as needed
          position='absolute'
          top='50%'
          left='50%'
          transform='translate(-50%, -50%)'
          objectFit='contain'
          zIndex='1'
          onClick={startRecording}
        />
      )}
      {isRecording && (
        <Image
          src='stop.png' // Replace with the path to your image
          alt='Image description' // Replace with a description of the image
          width='80px' // Adjust the width as needed
          height='80px' // Adjust the height as needed
          position='absolute'
          top='50%'
          left='50%'
          transform='translate(-50%, -50%)'
          objectFit='contain'
          zIndex='1'
          onClick={stopRecording}
        />
      )}
    </Box>
  );
};

const RecordSpeech = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textResponse, setTextResponse] = useState('');

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

  const uploadAudio = async (audioBlob) => {
    setIsProcessing(true);
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
    setTextResponse(data.text);
    setIsProcessing(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
      uploadAudio(event.data);
    });
  };

  return (
    <Stack
      minW={'100vw'}
      alignItems='center'
      justify={'center'}
      spacing={4}
      minH={'100vh'}
    >
      <SlideFade in={textResponse !== ''} offsetY='20px'>
        <Box w='80vw' h='40vh' bgColor={'gray.200'} p={4} borderRadius='lg'>
          <Text>{textResponse}</Text>
        </Box>
      </SlideFade>
      <MicWithImage
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />
      <Text visibility={isProcessing ? 'visible' : 'hidden'}>
        Processing...
      </Text>
    </Stack>
  );
};

export default RecordSpeech;
