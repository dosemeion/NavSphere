import { NavigationContent } from '@/components/navigation-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
import type { SiteConfig } from '@/types/site'
import navigationData from '@/navsphere/content/navigation.json'
import siteDataRaw from '@/navsphere/content/site.json'
import searchEnginesData from '@/navsphere/content/search.json' // ✅ 新增导入
import SearchBar from '@/components/SearchBar/SearchBar'

function getData() {
  // 处理 site.json（不含 search）
  const siteData: SiteConfig = {
    ...siteDataRaw,
    appearance: {
      ...siteDataRaw.appearance,
      theme: (siteDataRaw.appearance?.theme === 'light' ||
        siteDataRaw.appearance?.theme === 'dark' ||
        siteDataRaw.appearance?.theme === 'system')
        ? siteDataRaw.appearance.theme
        : 'system'
    },
    navigation: {
      linkTarget: (siteDataRaw.navigation?.linkTarget === '_blank' ||
        siteDataRaw.navigation?.linkTarget === '_self')
        ? siteDataRaw.navigation.linkTarget
        : '_blank'
    }
    // ⚠️ 注意：这里不再添加 search 字段
  }

  // ✅ 从 search.json 获取引擎列表
  const engines = Array.isArray(searchEnginesData?.engines)
    ? searchEnginesData.engines
    : [] // 如果文件为空或格式错误，返回空数组（SearchBar 会兜底）

  // 过滤导航数据（保持不变）
  const isEnabled = (item: any): boolean => item?.enabled !== false

  // 过滤只显示启用的分类和网站
  const filteredNavigationData = {
    navigationItems: navigationData.navigationItems
      .filter(category => (category as any).enabled !== false) // 过滤启用的分类
      .map(category => {
        const filteredSubCategories = category.subCategories
          ? (category.subCategories as any[])
              .filter(sub => sub.enabled !== false) // 过滤启用的子分类
              .map(sub => ({
                ...sub,
                items: sub.items?.filter((item: any) => item.enabled !== false) // 过滤启用的网站
              }))
          : undefined
        
        return {
          ...category,
          items: category.items?.filter(item => item.enabled !== false), // 过滤启用的网站
          subCategories: filteredSubCategories
        }
      })
  }

  return {
    navigationData: filteredNavigationData,
    siteData,
    engines // ✅ 单独返回 engines
  }
}

export function generateMetadata(): Metadata {
  const { siteData } = getData()
  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon || undefined,
    },
  }
}

export default function HomePage() {
  const { navigationData, siteData, engines } = getData()

  return (
    <Container>
      {/* ✅ 传入 engines */}
      <SearchBar engines={engines} />
      <NavigationContent navigationData={navigationData} siteData={siteData} />
      <ScrollToTop />
    </Container>
  )
}