import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple template renderer that handles basic Handlebars-like syntax
 * without requiring external dependencies
 */
export class TemplateRenderer {
  private static templateCache: Map<string, string> = new Map();
  private static templateBasePath = path.join(__dirname, '../tpls');

  /**
   * Render a template with the given data
   */
  public static renderTemplate(templatePath: string, data: any): string {
    try {
      const fullPath = path.join(this.templateBasePath, templatePath);

      // Get template content (with caching)
      let templateContent = this.templateCache.get(fullPath);
      if (!templateContent) {
        templateContent = fs.readFileSync(fullPath, 'utf8');
        this.templateCache.set(fullPath, templateContent);
      }

      // Render the template
      return this.processTemplate(templateContent, data);
    } catch (error) {
      console.error('Template rendering error:', error);
      return `<div class="error">Template rendering failed: ${templatePath}</div>`;
    }
  }

  /**
   * Process template content with data
   */
  private static processTemplate(template: string, data: any): string {
    let result = template;

    // Handle simple variable substitution {{variable}}
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const trimmedVar = variable.trim();

      // Handle nested properties like {{object.property}}
      const value = this.getNestedProperty(data, trimmedVar);
      return value !== undefined ? String(value) : '';
    });

    // Handle {{#if condition}} blocks
    result = this.processIfBlocks(result, data);

    // Handle {{#each array}} blocks
    result = this.processEachBlocks(result, data);

    return result;
  }

  /**
   * Get nested property from object using dot notation
   */
  private static getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Process {{#if condition}} blocks
   */
  private static processIfBlocks(template: string, data: any): string {
    const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    return template.replace(ifRegex, (match, condition, content) => {
      const trimmedCondition = condition.trim();
      const value = this.getNestedProperty(data, trimmedCondition);

      // Check if condition is truthy
      if (value && value !== '' && value !== 0 && value !== false) {
        return this.processTemplate(content, data);
      }
      return '';
    });
  }

  /**
   * Process {{#each array}} blocks
   */
  private static processEachBlocks(template: string, data: any): string {
    const eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

    return template.replace(eachRegex, (match, arrayName, content) => {
      const trimmedArrayName = arrayName.trim();
      const array = this.getNestedProperty(data, trimmedArrayName);

      if (!Array.isArray(array)) {
        return '';
      }

      return array.map((item, index) => {
        // Create context with current item and index
        const itemContext = {
          ...data,
          ...item,
          '@index': index,
          '@first': index === 0,
          '@last': index === array.length - 1
        };

        return this.processTemplate(content, itemContext);
      }).join('');
    });
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
