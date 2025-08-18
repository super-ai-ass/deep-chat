import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

/**
 * Template renderer using Handlebars library
 */
export class TemplateRenderer {
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
      return `<div class="error">Template rendering failed: ${templatePath}</div>`;
    }
  }

  /**
   * Clear template cache (useful for development)
   */
  public static clearCache(): void {
    this.templateCache.clear();
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
}
