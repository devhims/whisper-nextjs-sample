import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';

const DynamicRecordSpeech = dynamic(() => import('@/components/RecordSpeech'), {
  ssr: false,
});

// import RecordSpeech from '@/components/RecordSpeech';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return <DynamicRecordSpeech />;
}
