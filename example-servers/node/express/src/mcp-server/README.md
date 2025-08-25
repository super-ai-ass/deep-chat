# Template MCP Server

This MCP (Model Context Protocol) server provides template rendering tools for various types of content including recommendations, reminders, and itinerary management.

## Overview

The Template MCP Server integrates with the existing template system in `src/tpls/` and exposes template rendering capabilities as MCP tools and resources. It maintains full compatibility with the original template system while adding structured validation and MCP protocol support.

## Features

### Tools Available

1. **render-gas-station** - Render gas station recommendation cards
2. **render-restaurant** - Render restaurant recommendation cards
3. **render-attraction** - Render attraction recommendation cards
4. **render-departure-reminder** - Render departure reminder notifications
5. **render-schedule-change** - Render schedule change notifications
6. **render-full-schedule** - Render complete itinerary schedules
7. **list-templates** - List all available template types
8. **clear-template-cache** - Clear template cache (development use)

### Resources Available

1. **template://{templateType}** - Access raw template files
2. **template-example://{templateType}** - Get example data for templates

## Architecture

```
src/mcp-server/
├── index.ts              # Main MCP server with HTTP transport
├── templateService.ts    # Template rendering service
├── templateSchemas.ts    # Zod validation schemas
├── test-templates.ts     # Test script for validation
└── README.md            # This documentation
```

## Template Types

### Gas Station (`gas-station`)

Renders gas station recommendation cards with fuel types, location, and navigation.

**Required Fields:**

- `message_title` - Title of the message
- `station_name` - Name of the gas station
- `navigate_button_text` - Text for navigation button

**Optional Fields:**

- `message_icon` - Icon for the message (default: "⛽")
- `station_icon` - Icon for the station
- `station_image` - Image URL
- `fuel_types` - Available fuel types
- `distance` - Distance to station
- `address` - Station address
- `operating_hours` - Operating hours
- `services` - Additional services
- `navigate_alert_text` - Alert text for navigation

### Restaurant (`restaurant`)

Renders restaurant recommendation cards with ratings, contact info, and navigation.

**Required Fields:**

- `message_title` - Title of the message
- `restaurant_name` - Name of the restaurant
- `navigate_button_text` - Text for navigation button

**Optional Fields:**

- `message_icon` - Icon for the message (default: "🍽️")
- `restaurant_icon` - Icon for the restaurant
- `restaurant_image` - Image URL
- `rating` - Rating (0-5)
- `review_count` - Number of reviews
- `distance` - Distance to restaurant
- `address` - Restaurant address
- `operating_hours` - Operating hours
- `phone` - Phone number
- `navigate_alert_text` - Alert text for navigation

### Attraction (`attraction`)

Renders attraction recommendation cards with ratings, ticket info, and navigation.

**Required Fields:**

- `message_title` - Title of the message
- `attraction_name` - Name of the attraction
- `navigate_button_text` - Text for navigation button

**Optional Fields:**

- `message_icon` - Icon for the message (default: "🏛️")
- `attraction_icon` - Icon for the attraction
- `attraction_image` - Image URL
- `rating` - Rating (0-5)
- `review_count` - Number of reviews
- `distance` - Distance to attraction
- `address` - Attraction address
- `operating_hours` - Operating hours
- `ticket_info` - Ticket information
- `navigate_alert_text` - Alert text for navigation

### Departure Reminder (`departure`)

Renders departure reminder notifications.

**Required Fields:**

- `message_title` - Title of the message
- `confirm_button_text` - Text for confirmation button

**Optional Fields:**

- `message_icon` - Icon for the message (default: "🚗")
- `message_content` - Content of the message
- `current_time` - Current time display

### Schedule Change (`schedule-change`)

Renders schedule change notifications with before/after comparisons.

**Required Fields:**

- `alert_title` - Title of the alert
- `service_title` - Title of the service
- `schedule_items` - Array of schedule items with:
  - `label` - Item label
  - `icon` - Icon name
  - `icon_color` - Icon color class
  - `content` - Item content

**Optional Fields:**

- `alert_color` - Alert color class (default: "text-orange-600")
- `alert_icon` - Alert icon (default: "⚠️")
- `alert_message` - Alert message
- `action_button_text` - Action button text
- `action_alert_text` - Action alert text

### Full Schedule (`full-schedule`)

Renders complete itinerary schedules with activities and costs.

**Required Fields:**

- `trip_title` - Title of the trip
- `header_title` - Header title
- `header_subtitle` - Header subtitle
- `itinerary_title` - Itinerary title
- `days` - Array of day objects with:
  - `day_title` - Title of the day
  - `activities` - Array of activities with:
    - `time` - Activity time
    - `icon` - Activity icon
    - `title` - Activity title
    - `description` - Activity description
    - `price` - Activity price
- `footer_text` - Footer text

**Optional Fields:**

- `print_button_text` - Print button text (default: "打印行程")
- `schedule_section_title` - Schedule section title (default: "详细行程")
- `cost_summary` - Cost summary object with breakdown and totals

## Usage Examples

### Using MCP Tools

```javascript
// Render a gas station recommendation
const gasStationResult = await mcpClient.callTool('render-gas-station', {
  message_title: '加油提醒',
  message_content: '前方800m有家中石油加油站，油价优惠，建议前往加油。',
  station_name: '中石油加油站',
  station_image: 'https://example.com/gas-station.jpg',
  fuel_types: '92#、95#、98#汽油',
  distance: '800m',
  address: '北京市朝阳区建国路88号',
  operating_hours: '24小时营业',
  navigate_button_text: '导航前往',
  navigate_alert_text: '正在为您导航到中石油加油站...',
});

// List available templates
const templatesResult = await mcpClient.callTool('list-templates', {});
```

### Using MCP Resources

```javascript
// Get template source code
const templateSource = await mcpClient.readResource('template://gas-station');

// Get example data for a template
const exampleData = await mcpClient.readResource('template-example://restaurant');
```

## Server Configuration

The MCP server runs on HTTP transport with the following configuration:

- **Name**: `tpl-mcp-server`
- **Version**: `1.0.0`
- **Transport**: HTTP Streamable
- **Port**: 3000
- **Endpoints**:
  - `POST /mcp` - Tool calls and initialization
  - `GET /mcp` - Server-to-client notifications (SSE)
  - `DELETE /mcp` - Session termination

## Development

### Running the Server

```bash
cd src/mcp-server
npx ts-node index.ts
```

### Testing Templates

```bash
cd src/mcp-server
npx ts-node test-templates.ts
```

### Adding New Templates

1. Add the template HTML file to `src/tpls/`
2. Update `templateService.ts` template mapping
3. Create validation schema in `templateSchemas.ts`
4. Register the tool in `index.ts`
5. Add example data to resources

## Error Handling

The server includes comprehensive error handling:

- **Template Not Found**: Returns error message with template path
- **Validation Errors**: Returns Zod validation error details
- **Rendering Errors**: Returns HTML error div with error message
- **File System Errors**: Handles missing template files gracefully

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `handlebars` - Template engine
- `zod` - Schema validation
- `express` - HTTP server framework

## Integration Notes

This MCP server is designed to integrate seamlessly with existing template systems:

- **No Breaking Changes**: Original template files remain unchanged
- **Backward Compatibility**: Existing template usage continues to work
- **Enhanced Validation**: Adds structured data validation
- **Resource Access**: Provides programmatic access to templates
- **Caching**: Maintains template compilation cache for performance

The server preserves all original functionality while adding MCP protocol capabilities for structured access and validation.
