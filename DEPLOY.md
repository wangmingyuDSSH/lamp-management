# Vercel 一键部署完整指南

## 📋 部署前准备

### 1. 注册账号
- **GitHub**: https://github.com/signup (如果没有账号)
- **Vercel**: 可以用 GitHub 账号直接登录 https://vercel.com

---

## 🚀 详细部署步骤

### 步骤 1：将代码推送到 GitHub

#### 1.1 在 GitHub 创建新仓库
1. 登录 GitHub → 点击右上角 **+** → **New repository**
2. 填写信息：
   - Repository name: `lamp-management-system` (或任意名称)
   - Description: `LAMP 管理システム`
   - 选择 **Public** (公开) 或 **Private** (私有)
   - 勾选 **Add a README file**
3. 点击 **Create repository**

#### 1.2 上传本地代码到 GitHub

在本地项目根目录打开终端，执行：

```bash
# 1. 初始化 Git (如果还没初始化)
git init

# 2. 添加所有文件
git add .

# 3. 提交代码
git commit -m "Initial commit"

# 4. 关联远程仓库 (将下面 URL 换成你的仓库地址)
git remote add origin https://github.com/你的用户名/lamp-management-system.git

# 5. 推送到 GitHub
git branch -M main
git push -u origin main
```

✅ 完成！代码已在 GitHub 上。

---

### 步骤 2：在 Vercel 上部署

#### 2.1 登录 Vercel
1. 访问 https://vercel.com
2. 点击 **Sign Up** → 选择 **Continue with GitHub**
3. 授权 Vercel 访问你的 GitHub 账号

#### 2.2 导入项目
1. 登录后点击 **Add New...** → **Project**
2. 在 **Import Git Repository** 列表中找到 `lamp-management-system`
3. 点击 **Import**

#### 2.3 配置项目
在配置页面，保持默认设置即可：
- **Framework Preset**: Vite
- **Root Directory**: `./` (默认)
- **Build Command**: `npm run build` (默认)
- **Output Directory**: `dist` (默认)

点击 **Deploy**

#### 2.4 等待部署完成
- 等待约 1-2 分钟
- 看到 **Congratulations!** 表示部署成功
- 点击 **Continue to Dashboard** 查看详情

✅ 完成！你将获得一个类似 `https://lamp-management-system-xxx.vercel.app` 的网址。

---

### 步骤 3：访问你的应用

1. 点击 Vercel 提供的域名链接
2. 或者在浏览器直接输入你的项目网址
3. 看到登录页面即表示部署成功！

**默认账号** (前端模拟，无需后端)：
- 用户名: 任意输入
- 密码: 任意输入（4位以上）

---

## 🔧 后续更新

### 代码更新后如何同步到 Vercel？

非常简单！只需执行：

```bash
# 1. 修改代码后提交
git add .
git commit -m "更新内容描述"

# 2. 推送到 GitHub
git push
```

Vercel 会自动检测 GitHub 的更新并重新部署（约 30 秒 ~ 1 分钟）！

---

## 🌐 绑定自定义域名（可选）

如果你想使用自己的域名（如 `https://lamp.yourcompany.com`）：

### 步骤 1：在 Vercel 添加域名
1. 进入 Vercel 项目 Dashboard
2. 点击 **Settings** → **Domains**
3. 输入你的域名（如 `lamp.yourcompany.com`）
4. 点击 **Add**

### 步骤 2：域名解析配置
根据 Vercel 提供的记录，在你的域名服务商处添加 DNS 记录：

| 类型 | 主机记录 | 记录值 |
|-----|---------|--------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### 步骤 3：等待生效
- DNS 生效通常需要 5 分钟 ~ 24 小时
- Vercel 会自动配置 HTTPS 证书

---

## ⚙️ Vercel 环境变量配置（可选）

如果将来需要连接后端 API，可以设置环境变量：

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. 添加变量：
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-api-server.com/api`
3. 点击 **Save**
4. 重新部署（Redeploy）

---

## 🐛 常见问题

### Q1: 部署后页面空白或 404？
**原因**: Vue Router 的 History 模式需要配置重写规则

**解决**: 已配置 `vercel.json`，通常会自动生效。如果仍有问题：
1. Vercel Dashboard → **Settings** → **Build & Development Settings**
2. 确保 **Framework Preset** 是 `Vite`
3. 点击 **Redeploy**

### Q2: 如何查看部署日志？
1. Vercel Dashboard → 点击你的项目
2. 点击 **Deployments** 标签
3. 点击最新部署的 **Build Logs**

### Q3: 如何删除项目？
1. Vercel Dashboard → 进入项目
2. **Settings** → **General** → 底部 **Delete Project**

### Q4: 如何更换 GitHub 仓库？
1. 删除当前 Vercel 项目
2. 重新 Import 新的仓库

---

## 📱 分享给你的访问者

部署完成后，你可以这样告诉你的访问者：

```
🎉 LAMP 管理システム已上线！

访问地址：https://lamp-management-system-xxx.vercel.app

功能说明：
- Web 棚卸システム
- 仮設リース Web 入出庫
- オクト Web 入出庫＆工事指示

无需安装，浏览器打开即用！
支持电脑、平板、手机访问。
```

---

## 🎥 快速参考图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   本地代码       │ ──▶ │   GitHub 仓库    │ ──▶ │   Vercel 部署   │
│                 │     │                 │     │                 │
│ 1. git init     │     │ 创建新仓库       │     │ 1. 登录 Vercel  │
│ 2. git add .    │     │ git push        │     │ 2. Import 项目  │
│ 3. git commit   │     │                 │     │ 3. 点击 Deploy  │
│ 4. git push     │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  🌐 在线访问     │
                                               │                 │
                                               │ xxx.vercel.app  │
                                               └─────────────────┘
```

---

## ✅ 部署检查清单

- [ ] GitHub 仓库已创建
- [ ] 本地代码已推送到 GitHub
- [ ] Vercel 账号已注册（用 GitHub 登录）
- [ ] Vercel 项目已导入
- [ ] 部署成功，获得在线链接
- [ ] 测试登录功能正常
- [ ] 分享给访问者

---

**祝部署顺利！** 🎉
