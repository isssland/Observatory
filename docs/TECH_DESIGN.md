# Observatory — 技术设计

## 技术栈
- 前端：React 19 + TypeScript + Vite
- 样式：Tailwind CSS v4（CRT 终端 + 白色档案纸）
- 状态管理：Zustand
- 数据存储：IndexedDB（Dexie.js）
- AI 接口：DeepSeek / Claude / OpenAI
- PWA：vite-plugin-pwa
- 部署：Vercel

## 项目结构

```
src/
  components/       # 通用组件
    StatusCard.tsx        # 状态卡片（SAN / Focus / Drive + SVG 图标）
    SkillList.tsx         # 技能列表（可编辑/新增/删除）
    ReportModal.tsx       # 周报月报弹窗
    Terminal.tsx          # CRT 终端输入
    SettingsModal.tsx     # API Key 配置
  pages/
    CharacterSheet.tsx    # 角色档案纸
    NewEntry.tsx          # 日志输入
    Analysis.tsx          # AI 结算弹窗
  store/
    characterStore.ts     # Zustand 数据中心
  services/
    aiAnalysis.ts         # LLM API + Prompt + validateAnalysis 校验
  hooks/
    useEntrySubmission.ts # 日志提交公共 Hook
  db/
    index.ts              # Dexie schema
  utils/
    xp.ts                 # 经验/等级计算
    report.ts             # 周报月报计算
    id.ts                 # UUID
  types/
    index.ts
```

## 数据模型

### StatusAttributes（状态 — 短期波动）
- san: number (0–100)
- focus: number (0–100)
- drive: number (0–100)

### Skill（技能）
- id, name, level, currentXp, xpToNextLevel, isDynamic, createdAt

### JournalEntry（日志条目）
- id, text, timestamp, analysis: AiAnalysis

### AiAnalysis（AI 分析结果）
- statusChanges: { san, focus, drive }
- skillXpChanges: { skillName, xpGain, isNewSkill }[]

### AppSettings
- apiKey: string
- apiProvider: 'claude' | 'openai' | 'deepseek'

## 等级公式
`xpToNextLevel = level × 100`

## 关键点

1. IndexedDB 本地存储，数据全在客户端
2. Zustand store 集中管理状态，每次变更自动 saveCharacter()
3. AI 返回经 validateAnalysis() 严格校验后写入
4. 技能支持用户自定义，AI 动态识别新技能并与已有合并去重
5. PWA Service Worker 缓存静态资源，离线可查看
6. API Key 存 localStorage，仅发送到对应厂商
