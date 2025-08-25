#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra'
import * as path from 'path';
import { Client } from 'node-scp';
import chalk from 'chalk';
import ora from 'ora';
import { uploadConfig, getConfigFromEnv, type ServerConfig, type UploadConfig } from './upload.config.ts';

const execAsync = promisify(exec);

// 日志工具
class Logger {
  static info(message: string) {
    console.log(chalk.blue('ℹ'), message);
  }

  static success(message: string) {
    console.log(chalk.green('✓'), message);
  }

  static error(message: string) {
    console.log(chalk.red('✗'), message);
  }

  static warn(message: string) {
    console.log(chalk.yellow('⚠'), message);
  }
}

// 部署器类
class Deployer {
  private client: any;
  private config: UploadConfig;
  private environment: string;
  private serverConfig: ServerConfig;

  constructor(environment: string = 'production') {
    this.client = null;
    this.environment = environment;

    // 合并环境变量配置
    const envConfig = getConfigFromEnv();
    this.config = { ...uploadConfig, ...envConfig };

    if (!this.config.environments[environment as keyof typeof this.config.environments]) {
      throw new Error(`环境 "${environment}" 不存在，可用环境: ${Object.keys(this.config.environments).join(', ')}`);
    }

    this.serverConfig = this.config.environments[environment as keyof typeof this.config.environments];
  }


  // 构建项目
  async build(): Promise<void> {
    const spinner = ora('正在构建项目...').start();

    try {
      Logger.info(`执行构建命令: ${this.serverConfig.buildCommand}`);
      const { stdout, stderr } = await execAsync(this.serverConfig.buildCommand);

      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }

      spinner.succeed('项目构建完成');

      // 检查dist目录是否存在
      const distPath = path.resolve(this.config.localDistPath);
      if (!await fs.pathExists(distPath)) {
        throw new Error(`构建目录不存在: ${distPath}`);
      }

      Logger.success(`构建文件位于: ${distPath}`);
    } catch (error) {
      spinner.fail('项目构建失败');
      throw error;
    }
  }

  // 连接SSH
  async connect(): Promise<void> {
    const spinner = ora('正在连接服务器...').start();

    try {
      const connectionConfig: any = {
        host: this.serverConfig.host,
        port: this.serverConfig.port,
        username: this.serverConfig.username,
      };

      // 根据配置选择认证方式
      if (this.serverConfig.privateKey) {
        const keyPath = this.serverConfig.privateKey.startsWith('~')
          ? path.join(process.env.HOME || '', this.serverConfig.privateKey.slice(1))
          : this.serverConfig.privateKey;

        if (await fs.pathExists(keyPath)) {
          connectionConfig.privateKey = await fs.readFile(keyPath, 'utf8');
        } else {
          throw new Error(`私钥文件不存在: ${keyPath}`);
        }
      } else if (this.serverConfig.password) {
        connectionConfig.password = this.serverConfig.password;
      } else {
        throw new Error('必须配置私钥文件或密码');
      }

      this.client = await Client(connectionConfig);
      spinner.succeed(`已连接到服务器: ${this.serverConfig.host}`);
    } catch (error) {
      spinner.fail('服务器连接失败');
      throw error;
    }
  }


  // 删除文件
  async deleteFile(): Promise<void> {
    const spinner = ora('正在删除文件...').start();
    try {
      await this.client.rmdir(this.serverConfig.remotePath + "/src");
      spinner.succeed('文件删除完成');
    } catch (error) {
      spinner.fail('文件删除失败');
      throw error;
    }
  }

  // 上传文件
  async upload(): Promise<void> {
    const spinner = ora('正在上传文件...').start();

    try {
      const localPath = path.resolve(this.config.localDistPath);
      await this.client.uploadDir(localPath, this.serverConfig.remotePath + "/dist");
      await this.client.uploadFile('package.json', this.serverConfig.remotePath + '/package.json');
      await this.client.uploadFile('package-lock.json', this.serverConfig.remotePath + '/package-lock.json');
      await this.client.uploadFile('ecosystem.config.js', this.serverConfig.remotePath + '/ecosystem.config.js');

      spinner.succeed('文件上传完成');
    } catch (error) {
      spinner.fail('文件上传失败');
      throw error;
    }
  }


  // 清理连接
  async cleanup(): Promise<void> {
    if (this.client) {
      this.client.close();
      Logger.info('SSH连接已关闭');
    }
  }

  // 主部署流程
  async deploy(): Promise<void> {
    const startTime = Date.now();

    try {
      Logger.info(`开始部署到 ${chalk.cyan(this.environment)} 环境`);
      Logger.info(`目标服务器: ${chalk.cyan(this.serverConfig.host)}:${this.serverConfig.port}`);
      Logger.info(`目标路径: ${chalk.cyan(this.serverConfig.remotePath)}`);

      // 1. 构建项目
      await this.build();

      // 2. 连接服务器
      await this.connect();

      // 4. 上传文件
      await this.upload();


      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      Logger.success(`部署完成！耗时: ${duration}秒`);

    } catch (error) {
      Logger.error(`部署失败: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// 主函数
async function main() {
  try {
    // 解析命令行参数
    const args = process.argv.slice(2);
    const envIndex = args.findIndex(arg => arg === '--env' || arg === '-e');
    const environment = envIndex !== -1 && args[envIndex + 1] ? args[envIndex + 1] : 'production';

    // 显示帮助信息
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
${chalk.bold('Deep Chat Demo 部署工具')}

用法:
  npx ts-node upload.ts [选项]

选项:
  -e, --env <环境>    指定部署环境 (testing|preview|production)
  -h, --help         显示帮助信息

示例:
  npx ts-node upload.ts --env production
  npx ts-node upload.ts --env testing
      `);
      return;
    }

    // 创建部署器并执行部署
    const deployer = new Deployer(environment);
    await deployer.deploy();

  } catch (error) {
    Logger.error(`部署失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
main();
