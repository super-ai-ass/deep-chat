// 上传配置文件
export interface ServerConfig {
  host: string;
  port: number;
  username: string;
  // 认证方式：使用密钥文件或密码
  privateKey?: string; // 私钥文件路径
  password?: string;   // 密码（不推荐，建议使用密钥）
  // 服务器路径配置
  remotePath: string;  // 远程目标路径
  backupPath?: string; // 备份路径（可选）
  // 部署配置
  buildCommand: string; // 构建命令
  excludeFiles?: string[]; // 排除的文件/文件夹
}

export interface UploadConfig {
  // 多环境配置
  environments: {
    testing: ServerConfig;
    preview: ServerConfig;
    production: ServerConfig;
  };
  // 全局配置
  localDistPath: string; // 本地dist目录路径
  enableBackup: boolean; // 是否启用备份
  rsyncOptions: string[]; // rsync额外选项
}

// 默认配置模板
export const uploadConfig: UploadConfig = {
  // 本地构建目录
  localDistPath: './dist',

  // 是否启用服务器端备份
  enableBackup: true,

  // rsync同步选项
  rsyncOptions: [
    '--archive',      // 归档模式
    '--verbose',      // 详细输出
    '--compress',     // 压缩传输
    '--delete',       // 删除目标中多余的文件
    '--exclude=.DS_Store',
    '--exclude=*.log'
  ],

  // 多环境服务器配置
  environments: {
    // 测试环境
    testing: {
      host: '34.19.121.213',
      port: 22,
      username: 'fanhui',
      privateKey: '~/.ssh/id_gateway', // 或使用 password: 'your-password'
      remotePath: '/var/mcp-server/tpl-mpc-server',
      buildCommand: 'npm run build:mcp',
      excludeFiles: ['*.map', 'test-*']
    },

    // 预览环境
    preview: {
      host: 'your-preview-server.com',
      port: 22,
      username: 'deploy',
      privateKey: '~/.ssh/id_rsa',
      remotePath: '/var/www/deep-chat-demo-preview',
      backupPath: '/var/backups/deep-chat-demo-preview',
      buildCommand: 'npm run build:preview',
      excludeFiles: ['*.map']
    },

    // 生产环境
    production: {
      host: 'your-production-server.com',
      port: 22,
      username: 'deploy',
      privateKey: '~/.ssh/id_rsa',
      remotePath: '/var/www/deep-chat-demo',
      backupPath: '/var/backups/deep-chat-demo',
      buildCommand: 'npm run build:production',
      excludeFiles: ['*.map', '*.test.*']
    }
  }
};

// 环境变量支持
export function getConfigFromEnv(): Partial<UploadConfig> {
  return {
    environments: {
      production: {
        host: process.env.DEPLOY_HOST || uploadConfig.environments.production.host,
        port: parseInt(process.env.DEPLOY_PORT || '22'),
        username: process.env.DEPLOY_USER || uploadConfig.environments.production.username,
        privateKey: process.env.DEPLOY_KEY_PATH || uploadConfig.environments.production.privateKey,
        password: process.env.DEPLOY_PASSWORD,
        remotePath: process.env.DEPLOY_REMOTE_PATH || uploadConfig.environments.production.remotePath,
        backupPath: process.env.DEPLOY_BACKUP_PATH || uploadConfig.environments.production.backupPath,
        buildCommand: uploadConfig.environments.production.buildCommand,
        excludeFiles: uploadConfig.environments.production.excludeFiles
      },
      testing: uploadConfig.environments.testing,
      preview: uploadConfig.environments.preview
    }
  };
}
