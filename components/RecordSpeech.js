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
  Flex,
  FormControl,
  Select,
} from '@chakra-ui/react';

import { CopyIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState, useRef, useEffect } from 'react';

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
  const [processingText, setProcessingText] = useState('');
  const [textResponse, setTextResponse] = useState('');
  const [subText, setSubText] = useState('Translate audio into English text');

  const [operation, setOperation] = useState('translate');

  const maxRecordingTimeoutRef = useRef(null);

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

  useEffect(() => {
    if (processingText === 'Max. recording limit crossed') {
      setIsProcessing(true);
    }

    return () => {
      clearTimeout(maxRecordingTimeoutRef.current);
    };
  }, [processingText]);

  const handleOperationChange = (e) => {
    setOperation(e.target.value);

    if (e.target.value === 'translate') {
      setSubText('Translate audio into English text');
    } else if (e.target.value === 'transcribe') {
      setSubText('Transcribe audio into input Language');
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    setProcessingText('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = isSafari() ? 'audio/mp4' : 'audio/webm';
      const options = { mimeType };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      // Set the 10-second timer
      maxRecordingTimeoutRef.current = setTimeout(() => {
        console.log('Max. recording limit reached');
        setProcessingText('Max. recording limit crossed');
        setIsRecording(false);
        mediaRecorderRef.current.stop();
      }, 10000);
    } catch (error) {
      console.error('Error during startRecording:', error);
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob, errorCallback) => {
    setIsProcessing(true);

    try {
      const audioBuffer = await blobToAudioBuffer(audioBlob);
      const wavArrayBuffer = audioBufferToWav(audioBuffer);
      const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('file', wavBlob, 'audio.wav');

      const response = await fetch(
        operation === 'translate' ? '/api/translations' : '/api/transcriptions',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        errorCallback(`API error: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      setTextResponse(data.text);
    } catch (error) {
      console.error('Error during uploadAudio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    maxRecordingTimeoutRef.current &&
      clearTimeout(maxRecordingTimeoutRef.current);

    if (!mediaRecorderRef.current) {
      console.error('MediaRecorder is not initialized.');
      setIsRecording(false);
      return;
    }

    setIsRecording(false);
    setProcessingText('Processing...');
    mediaRecorderRef.current.stop();

    const onDataAvailable = (event) => {
      uploadAudio(event.data, (error) => {
        console.error(error);
      });
      mediaRecorderRef.current.removeEventListener(
        'dataavailable',
        onDataAvailable
      );
    };

    mediaRecorderRef.current.addEventListener('dataavailable', onDataAvailable);
  };

  return (
    <Box w={'100vw'}>
      <PageCenter>
        <Stack
          height='auto'
          width='100%'
          alignItems='center'
          justify={'center'}
          spacing={4}
        >
          <VStack spacing={2} pt={5}>
            <Heading
              fontSize={{ base: '3xl', lg: '4xl' }}
              bgGradient='linear(to-r, teal.600, teal.400, teal.300, teal.400)'
              bgClip='text'
              letterSpacing='tight'
              textAlign={'center'}
            >
              Whisper : Speech to Text
            </Heading>
            <Heading
              fontSize='md'
              color={'gray.600'}
              letterSpacing='tight'
              mb='2'
              fontWeight={'semibold'}
              textAlign={'center'}
            >
              {subText}
            </Heading>
          </VStack>
          <Divider />
          <Flex w='100%' pb={5}>
            <FormControl
              display={'flex'}
              flexDirection={'column'}
              justify='center'
              alignItems='center'
            >
              <Select
                w='70%'
                maxW='200px'
                display='inline-block'
                onChange={handleOperationChange}
                defaultValue={operation}
              >
                <option value='translate'>Translate</option>
                <option value='transcribe'>Transcribe</option>
              </Select>
            </FormControl>
          </Flex>
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
            {processingText}
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
