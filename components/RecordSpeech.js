import {
  Box,
  Text,
  SlideFade,
  Stack,
  Heading,
  VStack,
  Link,
  HStack,
  useClipboard,
  useToast,
  Divider,
} from '@chakra-ui/react';

import { CopyIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState, useRef } from 'react';

import Recorder from './Recorder';
import PageCenter from './PageCenter';

import audioBufferToWav from 'audiobuffer-to-wav';

const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

const blobToAudioBuffer = async (blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return await audioContext.decodeAudioData(arrayBuffer);
};

const RecordSpeech = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textResponse, setTextResponse] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);

  const { onCopy } = useClipboard(textResponse);
  const toast = useToast();

  const copyText = () => {
    toast({
      variant: 'left-accent',
      title: '',
      description: 'Text copied to clipboard',
      status: 'success',
      duration: 1500,
    });
    onCopy();
  };

  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = isSafari() ? 'audio/mp4' : 'audio/webm';
    const options = { mimeType };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  const uploadAudio = async (audioBlob) => {
    setIsProcessing(true);

    try {
      const audioBuffer = await blobToAudioBuffer(audioBlob);
      const wavArrayBuffer = audioBufferToWav(audioBuffer);
      const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });

      const formData = new FormData();
      formData.append(
        'file',
        new Blob([wavBlob], { type: 'audio/wav' }),
        'audio.wav'
      );

      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      setTextResponse(data.text);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error during uploadAudio:', error);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) {
      console.error('MediaRecorder is not initialized.');
      setIsRecording(false);
      return;
    }

    setIsRecording(false);
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
      uploadAudio(event.data);
    });
  };

  return (
    <Box w={'100vw'} h='auto' margin='0' padding='0' overflowY='auto'>
      <PageCenter>
        <Stack
          height='100%'
          width='100%'
          alignItems='center'
          justify={'center'}
          spacing={4}
        >
          <VStack spacing={2}>
            <Heading
              fontSize={{ base: '3xl', lg: '4xl' }}
              bgGradient='linear(to-r, teal.600, teal.400, teal.300, teal.400)'
              bgClip='text'
              letterSpacing='tight'
            >
              Whisper : Speech to Text
            </Heading>
            <Heading
              fontSize='md'
              color={'gray.600'}
              letterSpacing='tight'
              mb='2'
              fontWeight={'semibold'}
            >
              Translate Audio into English text
            </Heading>
          </VStack>
          <Divider />
          <SlideFade in={textResponse !== ''} offsetY='20px'>
            <Box
              w='80vw'
              h='20vh'
              bgColor={'gray.200'}
              p={4}
              borderRadius='lg'
              overflowY='auto'
            >
              <Text>{textResponse}</Text>
            </Box>
            <HStack justify={'space-between'} p={'2'}>
              <DeleteIcon
                color='red.500'
                onClick={() => setTextResponse('')}
                cursor={'pointer'}
              />{' '}
              <CopyIcon
                color='green.500'
                onClick={copyText}
                cursor={'pointer'}
              />
            </HStack>
          </SlideFade>
          <Recorder
            isRecording={isRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
          />
          <Text
            visibility={isProcessing ? 'visible' : 'hidden'}
            color='teal.600'
          >
            Processing...
          </Text>
          <VStack spacing={0}>
            <Text fontWeight={'bold'} color='gray.600'>
              Supported Laguagues:
            </Text>
            <Box
              w={{ base: '50%', lg: '90%' }}
              height={'15vh'}
              overflowY='auto'
            >
              <Text align={'center'} fontSize='sm'>
                Afrikaans, Arabic, Armenian, Azerbaijani, Belarusian, Bosnian,
                Bulgarian, Catalan, Chinese, Croatian, Czech, Danish, Dutch,
                English, Estonian, Finnish, French, Galician, German, Greek,
                Hebrew, Hindi, Hungarian, Icelandic, Indonesian, Italian,
                Japanese, Kannada, Kazakh, Korean, Latvian, Lithuanian,
                Macedonian, Malay, Marathi, Maori, Nepali, Norwegian, Persian,
                Polish, Portuguese, Romanian, Russian, Serbian, Slovak,
                Slovenian, Spanish, Swahili, Swedish, Tagalog, Tamil, Thai,
                Turkish, Ukrainian, Urdu, Vietnamese, and Welsh.
              </Text>
              <Text align={'center'} mt={2} fontWeight='bold'>
                <Link
                  href='https://help.openai.com/en/articles/7031512-whisper-api-faq'
                  color='blue.400'
                  _hover={{ color: 'blue.500' }}
                  isExternal
                >
                  FAQ
                </Link>
              </Text>
            </Box>
          </VStack>
          <VStack spacing={0}>
            <Text fontSize={'sm'} fontWeight={'semibold'} color='gray.500'>
              Developed by:{' '}
              <Text as='span'>
                <Link
                  href='https://www.linkedin.com/in/creativehims/'
                  color='blue.400'
                  _hover={{ color: 'blue.500' }}
                  isExternal
                >
                  Himanshu Gupta
                </Link>
              </Text>
            </Text>
            <Text fontSize={'sm'} fontWeight={'semibold'} color='gray.500'>
              GitHub{' '}
              <Text as='span'>
                <Link
                  href='https://github.com/devhims/whisper-nextjs-sample'
                  color='blue.400'
                  _hover={{ color: 'blue.500' }}
                  isExternal
                >
                  Repo
                </Link>
              </Text>
            </Text>
          </VStack>
        </Stack>
      </PageCenter>
    </Box>
  );
};

export default RecordSpeech;
