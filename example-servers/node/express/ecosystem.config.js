module.exports = {
  apps: [
    {
      name: 'mcp-server-prod',
      script: 'dist/src/mcp-server/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: 'logs/mcp-server-error.log',
      out_file: 'logs/mcp-server-out.log',
      log_file: 'logs/mcp-server-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 4000,
      node_args: '--max-old-space-size=512',
      cwd: './',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};
