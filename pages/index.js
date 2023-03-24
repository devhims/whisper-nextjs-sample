import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';

import RecordSpeech from '@/components/RecordSpeech';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return <RecordSpeech />;
}
