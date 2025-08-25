copy 到服务器

```
dist
package.json
package-lock.json
```

部署启动

```
npm install
npm install -g pm2
pm2 start dist/src/mcp-server/index.js --name "mcp-server"
pm2 startup # 开机自启
pm2 save # 保存配置

```

pm2 start - 启动服务
pm2 restart - 重启服务
pm2 stop - 停止服务
pm2 logs - 查看日志
