import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

/**
 * Template service for MCP server
 * Integrates with existing template system
 */
export class TemplateService {
  private static templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private static templateBasePath = path.join(__dirname, '../tpls');

  /**
   * Render a template with the given data
   */
  public static renderTemplate(templatePath: string, data: any): string {
    try {
      const fullPath = path.join(this.templateBasePath, templatePath);

      // Get compiled template (with caching)
      let compiledTemplate = this.templateCache.get(fullPath);
      if (!compiledTemplate) {
        const templateContent = fs.readFileSync(fullPath, 'utf8');
        compiledTemplate = Handlebars.compile(templateContent);
        this.templateCache.set(fullPath, compiledTemplate);
      }

      // Render the template with data
      return compiledTemplate(data);
    } catch (error) {
      console.error('Template rendering error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Template rendering failed: ${templatePath} - ${errorMessage}`);
    }
  }

  /**
   * Get template path mapping from config
   */
  public static getTemplatePath(templateType: string): string {
    const templateMap: { [key: string]: string } = {
      'gas-station': 'recommendation/gas-station.html',
      'attraction': 'recommendation/attraction.html',
      'restaurant': 'recommendation/restaurant.html',
      'departure': 'reminder/departure.html',
      'schedule-change': 'itinerary/schedule-change.html',
      'full-schedule': 'itinerary/full-schedule.html'
    };

    return templateMap[templateType] || templateMap['gas-station'];
  }

  /**
   * Clear template cache (useful for development)
   */
  public static clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Get all available template types
   */
  public static getAvailableTemplates(): string[] {
    return [
      'gas-station',
      'attraction',
      'restaurant',
      'departure',
      'schedule-change',
      'full-schedule'
    ];
  }

  /**
   * Validate template data structure
   */
  public static validateTemplateData(templateType: string, data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation - check for required fields based on template type
    switch (templateType) {
      case 'gas-station':
        if (!data.message_title) errors.push('message_title is required');
        if (!data.station_name) errors.push('station_name is required');
        if (!data.navigate_button_text) errors.push('navigate_button_text is required');
        break;
      case 'restaurant':
        if (!data.message_title) errors.push('message_title is required');
        if (!data.restaurant_name) errors.push('restaurant_name is required');
        if (!data.navigate_button_text) errors.push('navigate_button_text is required');
        break;
      case 'attraction':
        if (!data.message_title) errors.push('message_title is required');
        if (!data.attraction_name) errors.push('attraction_name is required');
        if (!data.navigate_button_text) errors.push('navigate_button_text is required');
        break;
      case 'departure':
        if (!data.message_title) errors.push('message_title is required');
        if (!data.confirm_button_text) errors.push('confirm_button_text is required');
        break;
      case 'schedule-change':
        if (!data.alert_title) errors.push('alert_title is required');
        if (!data.service_title) errors.push('service_title is required');
        break;
      case 'full-schedule':
        if (!data.trip_title) errors.push('trip_title is required');
        if (!data.days || !Array.isArray(data.days)) errors.push('days array is required');
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
