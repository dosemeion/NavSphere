// components/SearchBar/SearchBar.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  GraduationCap,
  Globe,
  ShieldCheck,
  Chrome,
  Github,
  SearchIcon
} from 'lucide-react'

interface SearchEngine {
  id: string
  name: string
  url: string
  // icon 字段可选（当前未使用）
}

interface SearchBarProps {
  engines: SearchEngine[] // ✅ 从外部传入
}

export default function SearchBar({ engines }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [selectedEngines, setSelectedEngines] = useState<string[]>([])

  // 初始化默认选中：优先选 enabledByDefault，否则选第一个
  useEffect(() => {
    if (engines.length === 0) return

    const defaults = engines
      .filter(e => (e as any).enabledByDefault) // 兼容 JSON 中的字段
      .map(e => e.id)

    setSelectedEngines(defaults.length > 0 ? defaults : [engines[0].id])
  }, [engines])

  const toggleEngine = (id: string) => {
    setSelectedEngines(prev =>
      prev.includes(id)
        ? prev.filter(e => e !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || engines.length === 0) return

    const selected = engines.filter(se => selectedEngines.includes(se.id))
    selected.forEach(engine => {
      // ✅ 修复：移除多余空格（关键！）
      const cleanUrl = engine.url.trim().replace(/\s*\{query\}\s*/, '{query}')
      const url = cleanUrl.replace('{query}', encodeURIComponent(query.trim()))
      window.open(url, '_blank', 'noopener,noreferrer')
    })
  }

  const getIcon = (id: string) => {
    const iconClass = "w-4 h-4"
    switch (id) {
      case 'googlescholar': return <GraduationCap className={iconClass} />
      case 'google': return <Globe className={iconClass} />
      case 'bing': return <ShieldCheck className={iconClass} />
      case 'baidu': return <Chrome className={iconClass} />
      case 'github': return <Github className={iconClass} />
      case 'duckduckgo': return <SearchIcon className={iconClass} />
      default: return <Search className={iconClass} />
    }
  }

  // 如果 engines 为空（例如 search.json 未配置），可显示默认提示
  if (engines.length === 0) {
    return null // 或显示“未配置搜索引擎”提示
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="输入关键词搜索..."
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-1"
            >
              <Search className="w-4 h-4" /> 搜索
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {engines.map(engine => (
              <button
                key={engine.id}
                type="button"
                onClick={() => toggleEngine(engine.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  selectedEngines.includes(engine.id)
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
                }`}
              >
                {getIcon(engine.id)}
                <span>{engine.name}</span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  )
}