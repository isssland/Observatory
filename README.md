# Observatory

> 用 RPG 角色面板追踪你的日常成长。输入日志，AI 自动分析并更新你的属性与技能。

**[observatory-omega.vercel.app](https://observatory-omega.vercel.app/)**

## 是什么

Observatory 是一个类 RPG 个人角色档案系统。你写日志，AI 分析日志内容，把每一天的努力变成角色属性变化和技能经验增长。

**不做：** 打卡、待办清单、每日签到、AI 长篇分析、社交、排行榜。

## 怎么用

1. 打开 [observatory-omega.vercel.app](https://observatory-omega.vercel.app/)
2. 点齿轮 → Settings → 填入你的 API Key（支持 DeepSeek / Claude / OpenAI）
3. 在日志区写一段文本 → PROCESS ENTRY
4. AI 弹出结算窗 → 确认 [WRITE TO FILE]
5. 档案纸更新，点 REPORT 查看周报月报
6. 手机浏览器打开 → 添加到主屏幕（PWA）

所有人的数据都存储在自己浏览器本地（IndexedDB），互不影响。

## 功能

- **角色档案** — 纸质档案风格展示 Status（SAN / Focus / Drive）和 Skills
- **CRT 终端** — 锈湖风格打字机终端输入日志
- **AI 分析** — DeepSeek / Claude / OpenAI，分析结果可手动编辑
- **技能自定义** — 预设 3 个技能，可新增、重命名、删除
- **周报 / 月报** — Status 趋势柱状图 + Skill 增长统计
- **PWA** — 可添加到手机主屏幕，离线可用

## 技术栈

React 19 + TypeScript + Vite · Tailwind CSS v4 · Zustand · Dexie.js · PWA

## 本地运行

```bash
npm install
npm run dev
```
