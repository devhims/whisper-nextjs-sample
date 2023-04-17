import { withFileUpload } from 'next-multiparty';
import { promises as fsPromises } from 'fs';
import { OpenAIApi, Configuration } from 'openai';
import { Readable } from 'stream';

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

  try {
    const fileBuffer = await fsPromises.readFile(file.filepath);
    const audioReadStream = Readable.from(fileBuffer);
    audioReadStream.path = 'audio.wav';

    const response = await openai.createTranscription(
      audioReadStream,
      'whisper-1'
    );

    const { text } = response.data;

    if (text) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({ text: text });
    } else {
      res.status(400).send(new Error('No text returned'));
    }
  } catch (error) {
    console.log('OPEN AI ERROR:');
    console.log(error.message);
    res.status(400).send(new Error(error.message));
  }
});
