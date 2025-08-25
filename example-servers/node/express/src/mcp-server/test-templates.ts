import { TemplateService } from './templateService.js';
import { gasStationSchema, restaurantSchema } from './templateSchemas.js';

// Test template service
console.log('Testing Template Service...\n');

// Test 1: List available templates
console.log('1. Available templates:');
const templates = TemplateService.getAvailableTemplates();
console.log(templates.join(', '));
console.log('');

// Test 2: Test gas station template rendering
console.log('2. Testing gas station template:');
const gasStationData = {
  message_icon: "⛽",
  message_title: "加油提醒",
  message_content: "前方800m有家中石油加油站，油价优惠，建议前往加油。",
  station_name: "中石油加油站",
  station_image: "https://example.com/gas-station.jpg",
  fuel_types: "92#、95#、98#汽油",
  distance: "800m",
  address: "北京市朝阳区建国路88号",
  operating_hours: "24小时营业",
  navigate_alert_text: "正在为您导航到中石油加油站...",
  navigate_button_text: "导航前往"
};

try {
  // Validate data
  const validatedData = gasStationSchema.parse(gasStationData);
  console.log('✓ Data validation passed');

  // Render template
  const html = TemplateService.renderTemplate('recommendation/gas-station.html', validatedData);
  console.log('✓ Template rendered successfully');
  console.log(`HTML length: ${html.length} characters`);
  console.log('');
} catch (error) {
  console.error('✗ Template rendering failed:', error);
}

// Test 3: Test restaurant template rendering
console.log('3. Testing restaurant template:');
const restaurantData = {
  message_icon: "🍽️",
  message_title: "美食推荐",
  message_content: "附近有家评分很高的川菜馆，推荐尝试。",
  restaurant_name: "蜀香园川菜馆",
  restaurant_image: "https://example.com/restaurant.jpg",
  rating: 4.8,
  review_count: 1256,
  distance: "500m",
  address: "北京市朝阳区三里屯路19号",
  operating_hours: "11:00-22:00",
  navigate_alert_text: "正在为您导航到蜀香园川菜馆...",
  navigate_button_text: "导航前往"
};

try {
  // Validate data
  const validatedData = restaurantSchema.parse(restaurantData);
  console.log('✓ Data validation passed');

  // Render template
  const html = TemplateService.renderTemplate('recommendation/restaurant.html', validatedData);
  console.log('✓ Template rendered successfully');
  console.log(`HTML length: ${html.length} characters`);
  console.log('');
} catch (error) {
  console.error('✗ Template rendering failed:', error);
}

// Test 4: Test template path mapping
console.log('4. Testing template path mapping:');
templates.forEach(templateType => {
  const path = TemplateService.getTemplatePath(templateType);
  console.log(`${templateType} -> ${path}`);
});

console.log('\nTemplate integration test completed!');
