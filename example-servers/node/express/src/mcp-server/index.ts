import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod";

const server = new McpServer({
  name: "tpl-mcp-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {},
    logging: {},
    notifications: {
      message: {
        level: ["info", "warning", "error"]
      }
    }
  }
});

// Add an addition tool
const loggingSetLevelSchema = z.object({
  method: z.literal("logging/setLevel"),
  params: z.object({
    level: z.enum(["debug", "info", "warning", "error"])
  })
})
server.server.setRequestHandler(loggingSetLevelSchema,
  async (request, extra) => {
    await extra.sendNotification({
      method: "notifications/message",
      params: request.params
    });
    return {};
  }
);

server.registerResource(
  "echo",
  new ResourceTemplate("echo://{message}", { list: undefined }),
  {
    title: "Echo Resource",
    description: "Echoes back messages as resources"
  },
  async (uri, { message }) => ({
    contents: [{
      uri: uri.href,
      text: `Resource echo: ${message}`
    }]
  })
);

server.registerTool(
  "echo",
  {
    title: "Echo Tool",
    description: "Echoes back the provided message",
    inputSchema: { message: z.string() }
  },
  async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }]
  })
);

server.registerTool(
  "single-greet",
  {
    title: "Single Greet Tool",
    description: "Greet the user once.",
    inputSchema: {
      name: z.string()
    }
  },
  async ({ name }) => ({
    content: [{ type: "text", text: `Tool single greet: ${name}` }]
  })
);

server.registerTool(
  "multi-greet",
  {
    title: "Multi Greet Tool",
    description: "Greet the user multiple times with delay in between.",
    inputSchema: { name: z.string() }
  },
  async ({ name }, { sendNotification }) => {

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    let notification = {
      method: "notifications/message",
      params: { level: "info", data: `First greet to ${name}` }
    }

    await sendNotification(notification)

    await sleep(1000)

    notification.params.data = `Second greet to ${name}`
    await sendNotification(notification);

    await sleep(1000)

    return {
      content: [{
        type: "text",
        text: `Hope you enjoy your day!`
      }]
    }
  }
);


server.registerPrompt(
  "echo",
  {
    title: "Echo Prompt",
    description: "Creates a prompt to process a message",
    argsSchema: { message: z.string() }
  },
  ({ message }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please process this message: ${message}`
      }
    }]
  })
);

const app = express();
app.use(express.json());

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req, res) => {
  // Check for existing session ID
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    // Reuse existing transport
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // New initialization request
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        // Store the transport by session ID
        transports[sessionId] = transport;
      },
      // DNS rebinding protection is disabled by default for backwards compatibility. If you are running this server
      // locally, make sure to set:
      // enableDnsRebindingProtection: true,
      // allowedHosts: ['127.0.0.1'],
    });

    // Clean up transport when closed
    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };


    // Connect to the MCP server
    await server.connect(transport);
  } else {
    // Invalid request
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  // Handle the request
  await transport.handleRequest(req, res, req.body);
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (req: express.Request, res: express.Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', handleSessionRequest);

// Handle DELETE requests for session termination
app.delete('/mcp', handleSessionRequest);

app.listen(3000);