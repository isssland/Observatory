# RPG 角色属性记录应用 — 技术设计

## 技术栈
- 前端：React + TypeScript + Vite
- 样式：Tailwind CSS
- 状态管理：Zustand
- 数据存储：IndexedDB（Dexie.js）
- AI 接口：Claude API / OpenAI API（用户自行配置 Key）
- PWA：vite-plugin-pwa
- 部署：Vercel

## 项目结构

```
src/
  components/       # 通用组件
    StatusCard.tsx        # 状态属性展示卡片
    SkillList.tsx         # 技能列表
    ChangeDisplay.tsx     # AI 结算变化展示
  pages/            # 页面
    CharacterSheet.tsx    # 角色档案（默认首页）
    NewEntry.tsx          # 日志输入
    Analysis.tsx          # AI 结算
  store/            # Zustand 状态
    characterStore.ts     # 角色数据 store
    settingsStore.ts      # 设置 store（API Key 等）
  services/         # 外部服务
    aiAnalysis.ts         # LLM API 调用 + Prompt 构造
  db/               # 数据库
    index.ts              # Dexie schema 定义
  hooks/            # 自定义 Hooks
    useCharacter.ts       # 角色数据读写
    useAiAnalysis.ts      # AI 分析请求封装
  utils/            # 工具函数
    xp.ts                 # 经验值 / 等级计算
    format.ts             # 格式化工具
  types/            # 类型定义
    index.ts
```

## 数据模型

### CharacterState（角色状态 — Zustand store 顶层）
- status: StatusAttributes
- skills: Skill[]
- entries: JournalEntry[]

### StatusAttributes（状态属性 — 短期波动）
- san: number        // 理智，范围 0–100
- focus: number      // 专注，范围 0–100
- energy: number     // 精力，范围 0–100

### Skill（技能 — 长期成长）
- id: string
- name: string             // 技能名
- level: number            // 当前等级
- currentXp: number        // 当前等级经验值
- xpToNextLevel: number    // 升级所需经验
- isDynamic: boolean       // 固定技能 / AI 动态生成
- createdAt: string        // 创建时间

### JournalEntry（日志条目）
- id: string
- text: string             // 原始输入文本
- timestamp: string        // ISO 日期
- analysis: AiAnalysis     // AI 分析结果

### AiAnalysis（AI 分析结果）
- statusChanges: {
    san: number
    focus: number
    energy: number
  }
- skillXpChanges: {
    skillName: string
    xpGain: number
    isNewSkill: boolean
  }[]

### AppSettings（应用设置 — 单独存储）
- apiKey: string           // LLM API Key
- apiProvider: 'claude' | 'openai'  // API 提供商

## 等级经验公式

```
xpToNextLevel = level * 100
升级时：currentXp 归零，超出部分滚入下级
```

## 关键技术点

1. 使用 Dexie.js 操作 IndexedDB，数据完全本地存储
2. 使用 Zustand 管理角色状态，persist 中间件自动同步到 IndexedDB
3. AI 分析使用结构化 JSON 输出，前端解析后展示给用户确认
4. 用户可在 Analysis 页面修改 AI 建议值，拥有最终解释权
5. PWA 配置 Service Worker 缓存静态资源，离线可查看历史数据
6. API Key 单独存储，调用时从本地读取，不上传任何服务器
