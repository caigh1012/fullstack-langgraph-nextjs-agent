这是一个使用 [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) 引导创建的 [Next.js](https://nextjs.org) 项目。

## 安装项目依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
# 或
bun install
```

## 配置 .env 文件（示例文件：.env.example）

请根据实际情况配置 .env 文件中的环境变量。例如，数据库连接字符串、API 密钥、JWT 密钥等。

- 数据库连接字符串：DATABASE_URL
- Deepseek API Key：DEEPSEEK_API_KEY
- ZAI API Key：ZAI_API_KEY
- JWT Secret：JWT_SECRET
- MinIO credentials：MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY_ID, MINIO_SECRET_ACCESS_KEY, MINIO_CHAT_BUCKET_NAME, MINIO_AVATAR_BUCKET_NAME, MINIO_PUBLIC_URL, NEXT_PUBLIC_APP_URL

## 快速开始

首先，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看效果。

你可以通过修改 `app/page.tsx` 来开始编辑页面。文件保存后页面会自动更新。

本项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 来自动优化和加载 [Geist](https://vercel.com/font)，这是 Vercel 提供的一个新字体家族。

## 本地效果展示

![效果演示](./docs/README/Recording_2026_8_22_18_04_38.gif)

[观看视频 1](./docs/README/Recording_2026_8_22_18_19_27.mp4)

[观看视频 2](./docs/README/Recording_2026_8_22_18_25_48.mp4)

[观看视频 3](./docs/README/Recording_2026_8_22_18_39_10.mp4)

## 了解更多

要了解有关 Next.js 的更多信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的功能和 API。
- [学习 Next.js](https://nextjs.org/learn) - 一个交互式 Next.js 教程。

你还可以查看 [Next.js 的 GitHub 仓库](https://github.com/vercel/next.js) - 欢迎你的反馈和贡献！

## 部署到 Vercel

部署 Next.js 应用最简单的方式是使用 Next.js 创建者提供的 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

有关更多详细信息，请查看我们的 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。
