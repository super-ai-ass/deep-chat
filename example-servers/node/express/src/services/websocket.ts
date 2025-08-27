import { WebSocket } from 'ws';
import { handleTemplateMessageAsHtml, } from './ws.mock';

export class WebSocketService {
  // Store active connections if needed for broadcasting
  private static connections: Set<WebSocket> = new Set();

  /**
   * Handle new WebSocket connection
   */
  public static handleConnection(ws: WebSocket): void {
    // Add to active connections
    this.connections.add(ws);
    console.log(`Active WebSocket connections: ${this.connections.size}`);
    // Set up event handlers
    this.setupEventHandlers(ws);
  }

  /**
   * Set up WebSocket event handlers
   */
  private static setupEventHandlers(ws: WebSocket): void {
    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      this.handleMessage(ws, data);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Handle connection close
    ws.on('close', () => {
      this.connections.delete(ws);
      console.log('WebSocket connection closed');
      console.log(`Active WebSocket connections: ${this.connections.size}`);
    });

    // Handle ping/pong for keeping connection alive
    ws.on('ping', () => {
      console.log('Received ping from client');
    });
    ws.on('pong', () => {
      console.log('Received pong from client');
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private static async handleMessage(ws: WebSocket, data: Buffer): Promise<void> {
    try {
      // Parse Deep Chat JSON format message
      const message = JSON.parse(data.toString());
      console.log('WebSocket message received:', message);

      if (message.type === 'ping') {
        this.sendMessage(ws, { type: 'pong', text: new Date().getTime().toString() });
        return;
      } else if (message.type === 'chat') {
        await new Promise(resolve => setTimeout(resolve, 5000));
        // Process message based on type or content
        if (message.messages) {
          // Send a contextual template response based on current time
          const msg = message.messages[0];
          const htmlResponse = handleTemplateMessageAsHtml(msg);
          if (htmlResponse) {
            this.sendMessage(ws, { type: 'chat', html: htmlResponse.html, role: 'assistant' });
            console.log(`📤 推送HTML模板响应`);
            this.sendMessage(ws, { type: 'chat_done' });
          } else {
            this.sendMessage(ws, { type: 'error', error: "11111 开小差了~" });
          }
        }
      } else if (message.type == 'location_changed') {
        this.sendMessage(ws, { type: 'location_changed', text: "event received", role: 'assistant' });
      } else if (message.type == 'user_cancel') {
        this.sendMessage(ws, { type: 'user_canceled', });
      } else {
        // Fallback for unhandled messages
        console.log('❓ 未处理的消息类型:', message);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      this.sendError(ws, 'Failed to process message');
    }
  }


  /**
   * Send message to a specific WebSocket client
   */
  public static sendMessage(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send error message to a specific WebSocket client
   */
  private static sendError(ws: WebSocket, error: string): void {
    this.sendMessage(ws, {
      error: error,
      type: 'error'
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  public static broadcast(message: any): void {
    const messageStr = JSON.stringify(message);
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  /**
   * Send streaming response (useful for chat applications)
   */
  public static async streamResponse(ws: WebSocket, chunks: string[], delayMs: number = 100): Promise<void> {
    for (const chunk of chunks) {
      if (ws.readyState !== WebSocket.OPEN) break;

      this.sendMessage(ws, {
        text: chunk,
        type: 'stream',
        streaming: true
      });

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    // Send final message to indicate streaming is complete
    if (ws.readyState === WebSocket.OPEN) {
      this.sendMessage(ws, {
        text: '',
        type: 'stream',
        streaming: false
      });
    }
  }

  /**
   * Get all active connections
   */
  public static getConnections(): Set<WebSocket> {
    return this.connections;
  }

  /**
   * Close all connections
   */
  public static closeAll(): void {
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.connections.clear();
  }
}
