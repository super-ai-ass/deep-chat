import { z } from "zod";

// Gas Station Recommendation Schema
export const gasStationSchema = z.object({
  message_icon: z.string().default("⛽"),
  message_title: z.string(),
  message_content: z.string(),
  station_icon: z.string().optional(),
  station_name: z.string(),
  station_image: z.string().url(),
  fuel_types: z.string(),
  distance: z.string(),
  address: z.string(),
  operating_hours: z.string(),
  services: z.string().optional(),
  navigate_alert_text: z.string(),
  navigate_button_text: z.string()
});

// Restaurant Recommendation Schema
export const restaurantSchema = z.object({
  message_icon: z.string().default("🍽️"),
  message_title: z.string(),
  message_content: z.string(),
  restaurant_icon: z.string().optional(),
  restaurant_name: z.string(),
  restaurant_image: z.string().url(),
  rating: z.number().min(0).max(5).optional(),
  review_count: z.number().min(0).optional(),
  distance: z.string(),
  address: z.string(),
  operating_hours: z.string(),
  phone: z.string().optional(),
  navigate_alert_text: z.string(),
  navigate_button_text: z.string()
});

// Attraction Recommendation Schema
export const attractionSchema = z.object({
  message_icon: z.string().default("🏛️"),
  message_title: z.string(),
  message_content: z.string(),
  attraction_icon: z.string().optional(),
  attraction_name: z.string(),
  attraction_image: z.string().url(),
  rating: z.number().min(0).max(5).optional(),
  review_count: z.number().min(0).optional(),
  distance: z.string(),
  address: z.string(),
  operating_hours: z.string(),
  ticket_info: z.string(),
  navigate_alert_text: z.string(),
  navigate_button_text: z.string()
});

// Departure Reminder Schema
export const departureReminderSchema = z.object({
  message_icon: z.string().default("🚗"),
  message_title: z.string(),
  message_content: z.string(),
  current_time: z.string(),
  confirm_button_text: z.string()
});

// Schedule Change Schema
export const scheduleChangeSchema = z.object({
  alert_color: z.string().default("text-orange-600"),
  alert_icon: z.string().default("⚠️"),
  alert_title: z.string(),
  alert_message: z.string(),
  service_title: z.string(),
  action_button_text: z.string(),
  action_alert_text: z.string(),
  schedule_items: z.array(z.object({
    label: z.string(),
    icon: z.string(),
    icon_color: z.string(),
    content: z.string()
  }))
});

// Full Schedule Schema
export const fullScheduleSchema = z.object({
  trip_title: z.string(),
  print_button_text: z.string().default("打印行程"),
  header_title: z.string(),
  header_subtitle: z.string(),
  itinerary_title: z.string(),
  schedule_section_title: z.string().default("详细行程"),
  days: z.array(z.object({
    day_title: z.string(),
    activities: z.array(z.object({
      time: z.string(),
      icon: z.string(),
      title: z.string(),
      description: z.string(),
      price: z.string(),
      buttons: z.array(z.object({
        class: z.string(),
        text: z.string()
      })).optional()
    }))
  })),
  cost_summary: z.object({
    title: z.string(),
    breakdown: z.array(z.object({
      label: z.string(),
      value: z.string()
    })),
    total_label: z.string(),
    total_value: z.string()
  }).optional(),
  footer_text: z.string()
});

// Export all schemas as a map for easy access
export const templateSchemas = {
  'gas-station': gasStationSchema,
  'restaurant': restaurantSchema,
  'attraction': attractionSchema,
  'departure': departureReminderSchema,
  'schedule-change': scheduleChangeSchema,
  'full-schedule': fullScheduleSchema
};

// Type definitions for better TypeScript support
export type GasStationData = z.infer<typeof gasStationSchema>;
export type RestaurantData = z.infer<typeof restaurantSchema>;
export type AttractionData = z.infer<typeof attractionSchema>;
export type DepartureReminderData = z.infer<typeof departureReminderSchema>;
export type ScheduleChangeData = z.infer<typeof scheduleChangeSchema>;
export type FullScheduleData = z.infer<typeof fullScheduleSchema>;
