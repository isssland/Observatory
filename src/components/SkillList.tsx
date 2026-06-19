import { useState } from 'react'
import { useCharacterStore } from '../store/characterStore'

export default function SkillList() {
  const skills = useCharacterStore((s) => s.skills)
  const addSkill = useCharacterStore((s) => s.addSkill)
  const removeSkill = useCharacterStore((s) => s.removeSkill)
  const renameSkill = useCharacterStore((s) => s.renameSkill)

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    addSkill(name)
    setNewName('')
    setAdding(false)
  }

  const handleRename = (id: string) => {
    const name = editName.trim()
    if (!name) { setEditingId(null); return }
    renameSkill(id, name)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    removeSkill(id)
    setDeleteConfirm(null)
  }

  if (skills.length === 0 && !adding) {
    return (
      <div className="text-center py-8">
        <p className="text-stone-400 text-xs font-typewriter mb-3">No skills on file.</p>
        <AddButton onClick={() => setAdding(true)} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {skills.map((skill) => (
        <div
          key={skill.id}
          className="group pb-3 border-b border-dashed border-stone-300 last:border-b-0 last:pb-0"
        >
          {/* 第一行：名称 + 等级 */}
          {editingId === skill.id ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(skill.id); if (e.key === 'Escape') setEditingId(null) }}
                className="flex-1 bg-transparent border-b border-stone-400 px-1 py-0.5 text-sm text-stone-700 font-typewriter outline-none"
                autoFocus
              />
              <button onClick={() => handleRename(skill.id)} className="text-xs text-stone-500 hover:text-stone-700 font-typewriter">OK</button>
              <button onClick={() => setEditingId(null)} className="text-xs text-stone-400 hover:text-stone-600 font-typewriter">X</button>
            </div>
          ) : (
            <div className="flex justify-between items-baseline">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-stone-700 font-typewriter">{skill.name}</span>
                {skill.isDynamic && (
                  <span className="text-[8px] text-red-700 border border-red-700/40 px-1.5 py-0 uppercase tracking-widest font-typewriter opacity-80">DISCOVERED</span>
                )}
              </div>
              <span className="text-sm text-stone-600 tabular-nums font-typewriter">
                Lv.{String(skill.level).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* 第二行：XP 线 + 数字 + 编辑/删除 */}
          <div className="mt-2 flex items-baseline">
            <span className="text-xs text-stone-500 select-none tracking-tighter flex-1">
              {(() => {
                const filled = Math.round((skill.currentXp / skill.xpToNextLevel) * 14)
                const empty = 14 - filled
                return (
                  <>
                    <span>{'|'.repeat(filled)}</span>
                    <span className="text-stone-300">{':'.repeat(Math.max(0, empty))}</span>
                  </>
                )
              })()}
              <span className="text-[9px] text-stone-400 tabular-nums font-typewriter ml-1">
                {skill.currentXp}/{skill.xpToNextLevel}
              </span>
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => { setEditingId(skill.id); setEditName(skill.name) }}
                className="opacity-0 group-hover:opacity-100 text-xs text-stone-400 hover:text-stone-600 font-typewriter"
              >
                EDIT
              </button>
              <button
                onClick={() => setDeleteConfirm(skill.id)}
                className="opacity-0 group-hover:opacity-100 text-xs text-stone-400 hover:text-red-600 font-typewriter"
              >
                DEL
              </button>
            </div>
          </div>

          {/* 删除确认 */}
          {deleteConfirm === skill.id && (
            <div className="mt-2 flex items-center gap-2 ml-auto w-fit">
              <span className="text-[10px] text-stone-500 font-typewriter">Delete?</span>
              <button onClick={() => handleDelete(skill.id)} className="text-[10px] text-red-600 hover:text-red-500 font-typewriter">YES</button>
              <button onClick={() => setDeleteConfirm(null)} className="text-[10px] text-stone-400 hover:text-stone-600 font-typewriter">NO</button>
            </div>
          )}
        </div>
      ))}

      {/* 新增 */}
      {adding ? (
        <div className="flex items-center gap-2 pt-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="skill name"
            className="flex-1 bg-transparent border-b border-stone-400 px-1 py-0.5 text-sm text-stone-700 placeholder-stone-400 font-typewriter outline-none"
            autoFocus
          />
          <button onClick={handleAdd} className="text-xs text-stone-500 hover:text-stone-700 font-typewriter">OK</button>
          <button onClick={() => setAdding(false)} className="text-xs text-stone-400 hover:text-stone-600 font-typewriter">X</button>
        </div>
      ) : (
        <AddButton onClick={() => setAdding(true)} />
      )}
    </div>
  )
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-[10px] text-stone-400 hover:text-stone-600 font-typewriter tracking-wider">
      [+ ADD SKILL]
    </button>
  )
}
