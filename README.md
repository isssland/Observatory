# Observatory

> 用 RPG 角色面板追踪你的日常成长。输入日志，AI 自动分析并更新你的属性与技能。

## 这是什么

Observatory 是一个类 RPG 个人角色档案系统。你写日志，AI 分析日志内容，把每一天的努力变成角色属性变化和技能经验增长。

**不做的事：** 打卡、待办清单、每日签到、AI 长篇分析、社交、排行榜。

## 怎么用

1. 配置 API Key（设置面板，支持 DeepSeek / Claude / OpenAI）
2. 在 LOG 页面写一段日志
3. AI 分析并弹出结算窗口
4. 确认 → 打印动画 → 角色卡数值更新

## 技术栈

React + TypeScript + Vite · Tailwind CSS · Zustand · Dexie.js · PWA

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build   # → dist/
```

## 许可

MIT
