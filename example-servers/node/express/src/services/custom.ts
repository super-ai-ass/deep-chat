import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { MessageFile } from '../../types/response';


export class Custom {
  public static async chat(body: Request['body'], res: Response) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    console.log(body);
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    res.json({ text: 'This is a respone from ExpressJs server. Thankyou for your message!' });
  }

  public static async chatStream(body: Request['body'], res: Response) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    console.log(body);
    const responseChunks = 'This is a respone from ExpressJs server. Thankyou for your message!'.split(' ');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    Custom.sendStream(res, responseChunks);
  }

  private static sendStream(res: Response, responseChunks: string[], chunkIndex = 0) {
    setTimeout(() => {
      const chunk = responseChunks[chunkIndex];
      if (chunk) {
        // Sends response back to Deep Chat using the Response format:
        // https://deepchat.dev/docs/connect/#Response
        res.write(`data: ${JSON.stringify({ text: `${chunk} ` })}\n\n`);
        Custom.sendStream(res, responseChunks, chunkIndex + 1);
      } else {
        res.end();
      }
    }, 70);
  }

  public static async files(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      const savedFiles: MessageFile[] = [];

      if (files && files.length > 0) {
        console.log('Files received:', files.length);

        // Ensure temp/uploads directory exists
        const uploadDir = path.join(process.cwd(), 'temp', 'uploads');
        await fs.promises.mkdir(uploadDir, { recursive: true });

        // Save each file to temp/uploads directory
        for (const file of files) {
          const filePath = path.join(uploadDir, file.originalname);
          await fs.promises.writeFile(filePath, file.buffer);

          // Generate file URL
          const fileUrl = `http://localhost:8080/uploads/${file.originalname}`;
          savedFiles.push({
            name: file.originalname,
            src: fileUrl
          });

          console.log(`File saved: ${file.originalname} -> ${fileUrl}`);
        }
      }

      // When sending text along with files, it is stored inside the request body using the Deep Chat JSON format:
      // https://deepchat.dev/docs/connect
      if (Object.keys(req.body).length > 0) {
        console.log('Text messages:');
        // message objects are stored as strings and they will need to be parsed (JSON.parse) before processing
        console.log(req.body);
      }

      // Sends response back to Deep Chat using the Response format:
      // https://deepchat.dev/docs/connect/#Response
      if (savedFiles.length > 0) {
        res.json({
          text: `Files uploaded successfully! ${savedFiles.length} file(s) saved.`,
          files: savedFiles
        });
      } else {
        res.json({ text: 'No files were uploaded.' });
      }
    } catch (error) {
      console.error('Error processing files:', error);
      res.status(500).json({
        text: 'Error occurred while processing files.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
