import Head from 'next/head';
import dynamic from 'next/dynamic';

const DynamicRecordSpeech = dynamic(() => import('@/components/RecordSpeech'), {
  ssr: false,
});

export default function Home() {
  return <DynamicRecordSpeech />;
}
