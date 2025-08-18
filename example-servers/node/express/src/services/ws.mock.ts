import { TemplateRenderer } from '../tpls/templateRenderer';

// 模板数据
export const templateData = {
  // 加油站推荐数据
  gasStation: {
    type: 'gas-station',
    template: 'recommendation/gas-station',
    data: {
      message_icon: "⛽",
      message_title: "加油提醒",
      message_content: "前方800m有家中石油加油站，92#汽油优惠0.3元/升，现在去正好不用排队！",
      station_icon: "⛽",
      station_name: "中石油加油站",
      station_image: "https://picsum.photos/seed/gasstation/200/200",
      fuel_types: "92#/95#/98#汽油",
      distance: "800m",
      address: "朝阳区东四环中路78号",
      operating_hours: "24小时营业",
      services: "提供洗车服务",
      navigate_button_text: "导航前往",
      navigate_alert_text: "正在为您导航到中石油加油站..."
    }
  },

  // 景点推荐数据
  attraction: {
    type: 'attraction',
    template: 'recommendation/attraction',
    data: {
      message_icon: "🏞️",
      message_title: "景点推荐",
      message_content: "今天天气晴朗，适合户外活动！距离您15km有处【野长城遗址】，4.9⭐评分，现在去正好人少景美！",
      attraction_icon: "🏰",
      attraction_name: "野长城遗址",
      attraction_image: "https://picsum.photos/seed/greatwall/200/200",
      rating: "4.9",
      review_count: "328",
      distance: "15km",
      address: "怀柔区渤海镇",
      operating_hours: "全天开放",
      ticket_info: "无需门票",
      navigate_button_text: "导航前往",
      navigate_alert_text: "正在为您导航到野长城遗址..."
    }
  },

  // 餐厅推荐数据
  restaurant: {
    type: 'restaurant',
    template: 'recommendation/restaurant',
    data: {
      message_icon: "🍽️",
      message_title: "用餐时间提醒",
      message_content: "距离午餐时间还有30分钟，我发现前方5km有家【承德驴打滚】，4.9⭐评分，现在去正好不用排队！",
      restaurant_icon: "🥮",
      restaurant_name: "承德驴打滚",
      restaurant_image: "https://picsum.photos/seed/chengdelvg/200/200",
      rating: "4.9",
      review_count: "328",
      distance: "5km",
      address: "双桥区避暑山庄路1号",
      operating_hours: "10:00-20:00",
      phone: "0314-88886666",
      navigate_button_text: "导航前往",
      navigate_alert_text: "正在为您导航到承德驴打滚..."
    }
  },

  // 出发提醒数据
  departure: {
    type: 'departure',
    template: 'reminder/departure',
    data: {
      header_icon: "mdi:traffic-light",
      header_icon_color: "text-yellow-500",
      message_title: "出发提醒",
      message_content: "我注意到您计划14:30出发去承德。根据实时路况分析，现在出发正好！京承高速畅通，预计18:05到达。如果再晚10分钟可能遇到小堵车哦。",
      current_time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      confirm_button_text: "知道了"
    }
  },

  // 行程调整数据
  scheduleChange: {
    type: 'schedule-change',
    template: 'itinerary/schedule-change',
    data: {
      alert_icon: "⚠️",
      alert_title: "天气预警 + 行程调整建议",
      alert_color: "text-yellow-600",
      alert_message: "承德17:30后可能有阵雨，我建议调整您的行程安排，确保室内外活动的最佳体验。",
      service_icon: "mdi:weather-pouring",
      service_title: "智能行程调整",
      action_button_text: "一键调整",
      action_alert_text: "正在为您智能调整行程...",
      schedule_items: [
        {
          label: "原计划",
          icon: "mdi:clock-outline",
          icon_color: "text-indigo-500",
          content: "18:00酒店入住 → 19:00避暑山庄夜游"
        },
        {
          label: "调整建议",
          icon: "mdi:clock-check-outline",
          icon_color: "text-green-500",
          content: "17:00提前入住 → 18:00室内温泉"
        },
        {
          label: "雨后安排",
          icon: "mdi:weather-night",
          icon_color: "text-blue-500",
          content: "20:00雨停后山庄夜景更美"
        },
        {
          label: "备选方案",
          icon: "mdi:museum",
          icon_color: "text-purple-500",
          content: "承德博物馆(室内) + 特色火锅"
        }
      ]
    }
  }
}

// 获取随机模板数据
export function getRandomTemplate() {
  const templates = Object.values(templateData)
  const randomIndex = Math.floor(Math.random() * templates.length)
  return templates[randomIndex]
}

// 根据类型获取模板数据
export function getTemplateByType(type: string) {
  return templateData[type as keyof typeof templateData] || null
}

// 渲染模板为HTML的函数
export function renderTemplateToHtml(templateType: string, data: any): string {
  const templatePath = TemplateRenderer.getTemplatePath(templateType);
  console.log('renderTemplateToHtml templatePath=', templatePath);
  return TemplateRenderer.renderTemplate(templatePath, data);
}

// 处理消息并返回HTML格式的函数
export function handleTemplateMessageAsHtml(message: any): { html: string } | null {
  console.log('handleTemplateMessageAsHtml', message);
  // 处理数字消息 (1-5) 推送对应模板
  if (message.text && /^[1-5]$/.test(message.text.toString())) {
    const templateNumber = parseInt(message.text.toString())
    let selectedTemplate

    switch (templateNumber) {
      case 1:
        selectedTemplate = templateData.gasStation
        break
      case 2:
        selectedTemplate = templateData.attraction
        break
      case 3:
        selectedTemplate = templateData.restaurant
        break
      case 4:
        selectedTemplate = templateData.departure
        break
      case 5:
        selectedTemplate = templateData.scheduleChange
        break
      default:
        selectedTemplate = getRandomTemplate()
    }

    const html = renderTemplateToHtml(selectedTemplate.type, selectedTemplate.data);
    return { html };
  }
  return null;
}

