const FormData = require('form-data');
import { withFileUpload } from 'next-multiparty';
import { createReadStream } from 'fs';
import { Configuration, OpenAIApi } from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default withFileUpload(async (req, res) => {
  const file = req.file;
  if (!file) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(400).send('No file uploaded');
    return;
  }
  //   const formData = new FormData();
  //   formData.append('file', createReadStream(file.filepath), 'audio.wav');
  //   formData.append('model', 'whisper-1');
  //   formData.append('prompt', 'the recorded audio is in english or hindi');
  console.log('filepath', file.filepath);
  const response = await openai.createTranscription(
    createReadStream(file.filepath, 'audio.wav'),
    'whisper-1'
  );

  const { text, error } = await response.json();
  if (response.ok) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ text: text });
  } else {
    console.log('OPEN AI ERROR:');
    console.log(error.message);
    res.status(400).send(new Error());
  }
});
