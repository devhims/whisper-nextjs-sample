import { withFileUpload } from 'next-multiparty';
import fetch from 'node-fetch';

export const config = {
  // Set the runtime to 'edge'
  runtime: 'edge',
};

export default withFileUpload(async (req, res) => {
  console.log('req.body: ', req.body);
  console.log('req.fields: ', req.fields);
  console.log('req', req);

  const file = req.file;
  const language = req.fields.language;

  console.log('language: ', language);

  if (!file) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(400).send('No file uploaded');
    return;
  }

  const formData = new FormData();
  formData.append('file', file.stream, { filename: 'audio.wav' });
  formData.append('model', 'whisper-1');
  formData.append(
    'prompt',
    'The transcript is about AVA: Adaptive Voice Assistant'
  );

  if (language) formData.append('language', language);

  const response = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    }
  );

  const { text, error } = await response.json();
  if (response.ok) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ text: text, lang: language });
  } else {
    console.log('OPEN AI ERROR:');
    console.log(error.message);
    res.status(400).send(new Error());
  }
});
