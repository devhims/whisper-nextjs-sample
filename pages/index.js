import Head from 'next/head';
import dynamic from 'next/dynamic';

const DynamicRecordSpeech = dynamic(() => import('@/components/RecordSpeech'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Whisper: Speech to Text</title>
        <meta
          name='description'
          content='Sample project showcasing setup of whisper api in a next.js project for speech to text conversion'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <DynamicRecordSpeech />
    </>
  );
}
