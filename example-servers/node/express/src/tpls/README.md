## 使用模板

```javascript
// 选择模板
const templatePath = 'tpls/recommendation/gas-station.html';

// 准备数据
const data = {
  message_icon: '⛽',
  message_title: '加油提醒',
  message_content: '前方800m有家中石油加油站...',
  station_name: '中石油加油站',
  navigate_alert_text: '正在为您导航到中石油加油站...',
  // ... 其他变量
};

// 渲染模板
const html = renderTemplate(templatePath, data);
```

## 事件处理

事件处理通过 htmlClassUtilities 中的 events 配置：

```javascript
"nav-button": {
  events: {
    click: (event) => {
      const button = event.target;
      const alertText = button.getAttribute('data-alert-text') || '正在导航...';
      alert(alertText);
    }
  }
}
```

模板中通过 `data-*` 属性传递事件参数：

```html
<button class="nav-button" data-alert-text="{{navigate_alert_text}}">导航前往</button>
```

## 样式系统

所有样式都已经在 htmlClassUtilities 中定义了，支持不同状态：

```javascript
"nav-button": {
  styles: {
    default: {
      backgroundColor: "rgb(59 130 246)",
      color: "rgb(255 255 255)",
      // ... 其他样式
    },
    hover: {
      backgroundColor: "rgb(37 99 235)"
    }
  }
}
```

## 模板语法

使用的是**Handlebars**语法：

- 变量替换: `{{variable_name}}`
- 条件渲染: `{{#if condition}}...{{/if}}`
- 循环渲染: `{{#each items}}...{{/each}}`
