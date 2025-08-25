import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import dotenv from "dotenv";
import { z } from "zod";
import { TemplateService } from "./templateService.js";
import {
  gasStationSchema,
  restaurantSchema,
  attractionSchema,
  departureReminderSchema,
  scheduleChangeSchema,
  fullScheduleSchema
} from "./templateSchemas.js";

dotenv.config();

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

// Template resources
server.registerResource(
  "template",
  new ResourceTemplate("template://{templateType}", { list: undefined }),
  {
    title: "Template Resource",
    description: "Access template files and view their content"
  },
  async (uri, { templateType }) => {
    try {
      const templatePath = TemplateService.getTemplatePath(templateType as string);
      const fs = await import('fs');
      const path = await import('path');
      const fullPath = path.join(__dirname, '../tpls', templatePath);
      const templateContent = fs.readFileSync(fullPath, 'utf8');

      return {
        contents: [{
          uri: uri.href,
          text: templateContent,
          mimeType: "text/html"
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        contents: [{
          uri: uri.href,
          text: `Template not found: ${templateType} - ${errorMessage}`,
          mimeType: "text/plain"
        }]
      };
    }
  }
);

server.registerResource(
  "template-example",
  new ResourceTemplate("template-example://{templateType}", { list: undefined }),
  {
    title: "Template Example Resource",
    description: "Get example data for template rendering"
  },
  async (uri, { templateType }) => {
    const examples: { [key: string]: any } = {
      'gas-station': {
        message_icon: "⛽",
        message_title: "加油提醒",
        message_content: "前方800m有家中石油加油站，油价优惠，建议前往加油。",
        station_icon: "⛽",
        station_name: "中石油加油站",
        station_image: "https://example.com/gas-station.jpg",
        fuel_types: "92#、95#、98#汽油",
        distance: "800m",
        address: "北京市朝阳区建国路88号",
        operating_hours: "24小时营业",
        services: "洗车、便利店、充电桩",
        navigate_alert_text: "正在为您导航到中石油加油站...",
        navigate_button_text: "导航前往"
      },
      'restaurant': {
        message_icon: "🍽️",
        message_title: "美食推荐",
        message_content: "附近有家评分很高的川菜馆，推荐尝试。",
        restaurant_icon: "🍽️",
        restaurant_name: "蜀香园川菜馆",
        restaurant_image: "https://example.com/restaurant.jpg",
        rating: 4.8,
        review_count: 1256,
        distance: "500m",
        address: "北京市朝阳区三里屯路19号",
        operating_hours: "11:00-22:00",
        phone: "010-12345678",
        navigate_alert_text: "正在为您导航到蜀香园川菜馆...",
        navigate_button_text: "导航前往"
      },
      'attraction': {
        message_icon: "🏛️",
        message_title: "景点推荐",
        message_content: "附近有个著名的历史景点，值得一游。",
        attraction_icon: "🏛️",
        attraction_name: "故宫博物院",
        attraction_image: "https://example.com/attraction.jpg",
        rating: 4.9,
        review_count: 5678,
        distance: "2.5km",
        address: "北京市东城区景山前街4号",
        operating_hours: "08:30-17:00",
        ticket_info: "成人票60元，学生票20元",
        navigate_alert_text: "正在为您导航到故宫博物院...",
        navigate_button_text: "导航前往"
      },
      'departure': {
        message_icon: "🚗",
        message_title: "出发提醒",
        message_content: "您的行程即将开始，请准备出发。建议提前10分钟到达集合地点。",
        current_time: "14:30",
        confirm_button_text: "确认收到"
      },
      'schedule-change': {
        alert_color: "text-orange-600",
        alert_icon: "⚠️",
        alert_title: "行程变更通知",
        alert_message: "由于天气原因，原定的户外活动已调整为室内参观。",
        service_title: "调整后的行程安排",
        action_button_text: "查看详情",
        action_alert_text: "正在为您展示调整后的详细行程...",
        schedule_items: [
          {
            label: "原计划",
            icon: "mdi:calendar-remove",
            icon_color: "icon-red",
            content: "14:00-16:00 户外徒步"
          },
          {
            label: "调整为",
            icon: "mdi:calendar-check",
            icon_color: "icon-green",
            content: "14:00-16:00 博物馆参观"
          }
        ]
      }
    };

    const example = examples[templateType as string];
    if (!example) {
      return {
        contents: [{
          uri: uri.href,
          text: `No example available for template type: ${templateType}`,
          mimeType: "text/plain"
        }]
      };
    }

    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(example, null, 2),
        mimeType: "application/json"
      }]
    };
  }
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

    await sendNotification({
      method: "notifications/message",
      params: { level: "info", data: `First greet to ${name}` }
    } as any)

    await sleep(1000)

    await sendNotification({
      method: "notifications/message",
      params: { level: "info", data: `Second greet to ${name}` }
    } as any);

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

// Template rendering tools
server.registerTool(
  "render-gas-station",
  {
    title: "Render Gas Station Recommendation",
    description: "渲染加油站推荐卡片HTML",
    inputSchema: gasStationSchema.shape
  },
  async (data, { sendNotification }) => {
    try {
      const validatedData = gasStationSchema.parse(data);
      const html = TemplateService.renderTemplate('recommendation/gas-station.html', validatedData);
      return {
        content: [{ type: "text", text: html }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Gas station template rendering failed:', errorMessage);
      return {
        content: [{ type: "text", text: `<div class="error">Template rendering failed: ${errorMessage}</div>` }]
      };
    }
  }
);

server.registerTool(
  "render-restaurant",
  {
    title: "Render Restaurant Recommendation",
    description: "渲染餐厅推荐卡片HTML",
    inputSchema: restaurantSchema.shape
  },
  async (data, { sendNotification }) => {
    try {
      const validatedData = restaurantSchema.parse(data);
      const html = TemplateService.renderTemplate('recommendation/restaurant.html', validatedData);
      return {
        content: [{ type: "text", text: html }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Restaurant template rendering failed:', errorMessage);
      return {
        content: [{ type: "text", text: `<div class="error">Template rendering failed: ${errorMessage}</div>` }]
      };
    }
  }
);

server.registerTool(
  "render-attraction",
  {
    title: "Render Attraction Recommendation",
    description: "渲染景点推荐卡片HTML",
    inputSchema: attractionSchema.shape
  },
  async (data, { sendNotification }) => {
    try {
      const validatedData = attractionSchema.parse(data);
      const html = TemplateService.renderTemplate('recommendation/attraction.html', validatedData);
      return {
        content: [{ type: "text", text: html }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Attraction template rendering failed:', errorMessage);
      return {
        content: [{ type: "text", text: `<div class="error">Template rendering failed: ${errorMessage}</div>` }]
      };
    }
  }
);

server.registerTool(
  "render-departure-reminder",
  {
    title: "Render Departure Reminder",
    description: "渲染出发提醒HTML",
    inputSchema: departureReminderSchema.shape
  },
  async (data, { sendNotification }) => {
    try {
      const validatedData = departureReminderSchema.parse(data);
      const html = TemplateService.renderTemplate('reminder/departure.html', validatedData);
      return {
        content: [{ type: "text", text: html }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Departure reminder template rendering failed:', errorMessage);
      return {
        content: [{ type: "text", text: `<div class="error">Template rendering failed: ${errorMessage}</div>` }]
      };
    }
  }
);

server.registerTool(
  "render-schedule-change",
  {
    title: "Render Schedule Change Notification",
    description: "渲染行程变更通知HTML",
    inputSchema: scheduleChangeSchema.shape
  },
  async (data, { sendNotification }) => {
    try {
      const validatedData = scheduleChangeSchema.parse(data);
      const html = TemplateService.renderTemplate('itinerary/schedule-change.html', validatedData);
      return {
        content: [{ type: "text", text: html }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Schedule change template rendering failed:', errorMessage);
      return {
        content: [{ type: "text", text: `<div class="error">Template rendering failed: ${errorMessage}</div>` }]
      };
    }
  }
);

server.registerTool(
  "render-full-schedule",
  {
    title: "Render Full Schedule",
    description: "渲染完整行程表HTML",
    inputSchema: fullScheduleSchema.shape
  },
  async (data, { sendNotification }) => {
    try {
      const validatedData = fullScheduleSchema.parse(data);
      const html = TemplateService.renderTemplate('itinerary/full-schedule.html', validatedData);
      return {
        content: [{ type: "text", text: html }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Full schedule template rendering failed:', errorMessage);
      return {
        content: [{ type: "text", text: `<div class="error">Template rendering failed: ${errorMessage}</div>` }]
      };
    }
  }
);

// Template utility tools
server.registerTool(
  "list-templates",
  {
    title: "List Available Templates",
    description: "列出所有可用的模板类型",
    inputSchema: {}
  },
  async () => {
    const templates = TemplateService.getAvailableTemplates();
    return {
      content: [{
        type: "text",
        text: `Available templates: ${templates.join(', ')}`
      }]
    };
  }
);

server.registerTool(
  "clear-template-cache",
  {
    title: "Clear Template Cache",
    description: "清除模板缓存（开发时使用）",
    inputSchema: {}
  },
  async () => {
    TemplateService.clearCache();
    return {
      content: [{
        type: "text",
        text: "Template cache cleared successfully"
      }]
    };
  }
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

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`MCP Server listening on port ${port}`);
});
