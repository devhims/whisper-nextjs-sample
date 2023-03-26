# Whisper-NextJs-Sample

Sample project showcasing setup of Whisper api in a Next.js project for realtime speech to english text conversion.

![Whisper API Demo Image](public/Demo.png?raw=true 'Whisper API Demo')

## Features

- Uses the microphone on your device to interact with the whisper api
- Over 50 languages supported
- Option to copy the text to clipboard and delete the text
- Uses ChakraUI for UI components
- Uses Next.js API routes for serverless functions to interact with the whisper api

## Getting Started

1. Clone the repo
2. Create a file called `.env.local` at the root level of the project, and set the following environment variable: OPENAI_API_KEY={your OpenAI API key} (visit https://platform.openai.com/account/api-keys to get your API key)
3. Run `npm i --legacy-peer-deps` to install dependencies
4. Run `npm run dev` to start the development server

## Deploying to Vercel

This project is setup to deploy on the free version of vercel, just clone and add it to your project and deploy it to production. Remember to add the api key as an environment variable in the vercel dashboard.

**Note:** In order for this to deploy and work properly on Vercel, you must use Node 16.x for your serverless functions.

## License

[MIT](https://choosealicense.com/licenses/mit/)
