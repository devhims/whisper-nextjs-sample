import { Box, Image, Tooltip } from '@chakra-ui/react';
import { ReactMic } from 'react-mic';

const Recorder = ({ isRecording, startRecording, stopRecording }) => {
  return (
    <Box position='relative' display='inline-block'>
      <ReactMic
        record={isRecording}
        className='sound-wave'
        strokeColor='#4ad295'
        backgroundColor='#ffffff'
      />
      {!isRecording && (
        <Tooltip
          hasArrow
          label='Click to begin recording'
          aria-label='tooltip'
          bg='#4ad295'
        >
          <Image
            src='microphone.png'
            alt='start recording button'
            width='80px'
            height='80px'
            position='absolute'
            top='50%'
            left='50%'
            transform='translate(-50%, -50%)'
            objectFit='contain'
            zIndex='1'
            onClick={startRecording}
            _hover={{ cursor: 'pointer' }}
          />
        </Tooltip>
      )}
      {isRecording && (
        <Image
          src='stop.png'
          alt='stop recording button'
          width='80px'
          height='80px'
          position='absolute'
          top='50%'
          left='50%'
          transform='translate(-50%, -50%)'
          objectFit='contain'
          zIndex='1'
          onClick={stopRecording}
          _hover={{ cursor: 'pointer' }}
        />
      )}
    </Box>
  );
};

export default Recorder;
