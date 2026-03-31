# LAMP 管理システム

Web 棚卸システム、仮設リース Web 入出庫、オクト Web 入出庫＆工事指示を統合した管理システムです。

## 🚀 快速开始（部署者指南）

### ⭐ 方式零：Vercel 一键部署（对部署者最友好，推荐！）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**只需 3 步，1 分钟完成部署：**

1. **Fork 本项目** 到你的 GitHub 账号
2. **登录 [Vercel](https://vercel.com)**（可用 GitHub 账号直接登录）
3. **点击 "New Project"** → 选择 fork 的项目 → 点击 **Deploy**

✅ 完成！你将获得一个 `https://your-project.vercel.app` 的在线链接，可以直接分享给任何人访问。

**优点：**
- 🆓 完全免费
- 🌍 全球 CDN 加速
- 🔒 自动 HTTPS
- 🚀 每次 git push 自动更新
- 📱 访问者无需任何配置，打开即用

---

### 方式一：Docker 部署（适合自有服务器）

#### 前置要求
- Docker >= 20.10
- Docker Compose >= 1.29

#### 一键启动
```bash
# 克隆项目后，在项目根目录执行
docker-compose up -d

# 访问 http://localhost:8080
```

#### 常用命令
```bash
# 构建并启动
docker-compose up -d --build

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart
```

---

### 方式二：本地开发环境

#### 前置要求
- Node.js >= 18.0.0
- npm >= 9.0.0

#### 安装步骤
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 浏览器访问 http://localhost:3000
```

#### 生产构建
```bash
# 构建生产版本
npm run build

# 本地预览生产版本
npm run preview
```

---

### 方式三：静态文件部署

如果你有自己的 Web 服务器（Nginx/Apache），可以只部署构建后的静态文件：

```bash
# 1. 构建项目
npm install
npm run build

# 2. 将 dist/ 目录下的所有文件复制到你的 Web 服务器根目录
```

#### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📁 项目结构

```
lamp-management-system/
├── src/
│   ├── components/      # Vue 组件
│   │   ├── inventory/   # Web 棚卸システム
│   │   ├── kasetsu/     # 仮設リース Web 入出庫
│   │   └── octo/        # オクト Web 入出庫
│   ├── views/           # 页面视图
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── public/              # 静态资源
├── dist/                # 构建输出（自动生成）
├── Dockerfile           # Docker 配置
├── docker-compose.yml   # Docker Compose 配置
├── nginx.conf           # Nginx 配置
├── vite.config.js       # Vite 配置
└── package.json         # 项目依赖
```

---

## 🔧 技术栈

- **前端框架**: Vue 3 + Vue Router
- **构建工具**: Vite 5
- **样式**: Tailwind CSS
- **图表**: Chart.js + vue-chartjs
- **状态管理**: Pinia
- **图标**: Font Awesome

---

## 📝 默认账号

系统默认无需后端，使用前端模拟数据：
- 用户名: 任意输入
- 密码: 任意输入（长度 >= 4）

---

## 🐳 Docker 镜像构建（手动）

如果你想手动构建 Docker 镜像：

```bash
# 构建镜像
docker build -t lamp-management-system:latest .

# 运行容器
docker run -d -p 8080:80 --name lamp-system lamp-management-system:latest

# 访问 http://localhost:8080
```

---

## 🔍 故障排除

### 端口冲突
如果 8080 端口被占用，修改 `docker-compose.yml`：
```yaml
ports:
  - "8081:80"  # 改为其他端口
```

### 权限问题（Linux/Mac）
```bash
# 如果 npm install 权限不足，使用 sudo
sudo npm install

# 或者更改 npm 默认目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Node 版本不匹配
使用 nvm 切换 Node 版本：
```bash
nvm install 18
nvm use 18
```

---

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
