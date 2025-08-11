import express, { Express, NextFunction, Request, Response } from 'express';
import { HuggingFace } from './services/huggingFace';
import { StabilityAI } from './services/stabilityAI';
import { ErrorUtils } from './utils/errorUtils';
import { Custom } from './services/custom';
import { OpenAI } from './services/openAI';
import { Cohere } from './services/cohere';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';

// ------------------ SETUP ------------------

dotenv.config();

// this is used for parsing FormData with size limits
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    fieldSize: 50 * 1024 * 1024, // 50MB per field
    fields: 10, // Max number of non-file fields
    files: 10 // Max number of files
  }
});

const app: Express = express();
const port = 8080;

// this will need to be reconfigured before taking the app to production
app.use(cors());

// Configure body parsing with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.raw({ limit: '50mb', type: 'application/octet-stream' }));

// Configure static file serving for uploaded files
app.use('/uploads', express.static('temp/uploads'));

// ------------------ CUSTOM API ------------------

app.post('/chat', async (req: Request, res: Response) => {
  Custom.chat(req.body, res);
});

app.post('/chat-stream', async (req: Request, res: Response) => {
  Custom.chatStream(req.body, res);
});

app.post('/files', upload.array('files'), async (req: Request, res: Response) => {
  Custom.files(req, res);
});

// ------------------ OPENAI API ------------------

app.post('/openai-chat', async (req: Request, res: Response, next: NextFunction) => {
  OpenAI.chat(req.body, res, next);
});

app.post('/openai-chat-stream', async (req: Request, res: Response, next: NextFunction) => {
  OpenAI.chatStream(req.body, res, next);
});

app.post('/openai-image', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  OpenAI.imageVariation(req, res, next);
});

// ------------------ HUGGING FACE API ------------------

app.post('/huggingface-conversation', async (req: Request, res: Response, next: NextFunction) => {
  HuggingFace.conversation(req.body, res, next);
});

app.post('/huggingface-image', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  HuggingFace.imageClassification(req, res, next);
});

app.post('/huggingface-speech', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  HuggingFace.speechRecognition(req, res, next);
});

// ------------------ STABILITY AI API ------------------

app.post('/stability-text-to-image', async (req: Request, res: Response, next: NextFunction) => {
  StabilityAI.textToImage(req.body, res, next);
});

app.post('/stability-image-to-image', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  StabilityAI.imageToImage(req, res, next);
});

app.post('/stability-image-upscale', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  StabilityAI.imageToImageUpscale(req, res, next);
});

// ------------------ Cohere API ------------------

app.post('/cohere-chat', async (req: Request, res: Response, next: NextFunction) => {
  Cohere.chat(req.body, res, next);
});

app.post('/cohere-generate', async (req: Request, res: Response, next: NextFunction) => {
  Cohere.generateText(req.body, res, next);
});

app.post('/cohere-summarize', async (req: Request, res: Response, next: NextFunction) => {
  Cohere.summarizeText(req.body, res, next);
});

// ------------------ START SERVER ------------------

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// ------------------ ERROR HANDLER ------------------

// Handle payload too large errors specifically
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.type === 'entity.too.large') {
    res.status(413).json({
      error: 'Payload too large',
      message: 'The request payload exceeds the maximum allowed size of 50MB',
      details: err.message
    });
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      error: 'File too large',
      message: 'The uploaded file exceeds the maximum allowed size of 50MB',
      details: err.message
    });
  } else {
    next(err);
  }
});

app.use(ErrorUtils.handle);
