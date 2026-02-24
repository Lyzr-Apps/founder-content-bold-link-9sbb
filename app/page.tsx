'use client'

import React, { useState, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import {
  FiHome, FiEdit3, FiHash, FiCalendar, FiBarChart2, FiUser,
  FiZap, FiCopy, FiClock, FiTrendingUp, FiTarget,
  FiChevronDown, FiChevronUp, FiMenu, FiCheck,
  FiAlertCircle, FiLoader, FiStar, FiActivity, FiFileText,
  FiArrowRight, FiSave, FiInfo, FiExternalLink
} from 'react-icons/fi'

// ---- Agent IDs ----
const AGENT_CONTENT_CREATOR = '699c8e86948869a40a159e90'
const AGENT_HASHTAG_GENERATOR = '699c8e86dec8777541dad1da'
const AGENT_POST_SCHEDULER = '699c8e875e640bb8aab129db'
const AGENT_ANALYTICS_ADVISOR = '699c8e8790171ae9b4817d03'

// ---- TypeScript Interfaces ----
interface ContentResponse {
  post_content?: string
  platform?: string
  content_format?: string
  hook_line?: string
  call_to_action?: string
  suggested_posting_time?: string
  carousel_slides?: string[]
  tone_notes?: string
  content_tips?: string
}

interface HashtagItem {
  tag?: string
  category?: string
  estimated_reach?: string
}

interface HashtagGroup {
  group_name?: string
  tags?: string[]
}

interface HashtagResponse {
  platform?: string
  hashtags?: HashtagItem[]
  hashtag_groups?: HashtagGroup[]
  strategy_notes?: string
  trending_tags?: string[]
}

interface ScheduleItem {
  day?: string
  time?: string
  platform?: string
  content_type?: string
  priority?: string
  reasoning?: string
}

interface PostingWindow {
  platform?: string
  day?: string
  time_window?: string
  engagement_level?: string
}

interface ScheduleResponse {
  schedule?: ScheduleItem[]
  weekly_summary?: string
  platform_frequency?: { instagram?: number | string; linkedin?: number | string }
  optimization_tips?: string
  best_posting_windows?: PostingWindow[]
}

interface TopContent {
  content_type?: string
  platform?: string
  engagement_rate?: string
  key_factors?: string
}

interface Recommendation {
  area?: string
  recommendation?: string
  expected_impact?: string
  priority?: string
}

interface AnalyticsResponse {
  performance_summary?: string
  top_performing_content?: TopContent[]
  recommendations?: Recommendation[]
  trend_analysis?: string
  growth_opportunities?: string[]
  metrics_breakdown?: { instagram?: Record<string, unknown>; linkedin?: Record<string, unknown> }
}

type NavView = 'dashboard' | 'create' | 'hashtags' | 'schedule' | 'analytics' | 'brand'

// ---- Sample Data ----
const SAMPLE_CONTENT: ContentResponse = {
  post_content: "Building a startup is like running a marathon in the dark -- you can't see the finish line, but every step forward counts.\n\nHere are 3 lessons I learned scaling from 0 to 10k users:\n\n1. Ship fast, iterate faster. Your first version will be embarrassing, and that's okay.\n2. Talk to users daily. The best product insights come from real conversations.\n3. Focus on retention before growth. A leaky bucket never fills up.\n\nThe founder journey isn't glamorous, but it's the most rewarding thing I've ever done.",
  platform: 'LinkedIn',
  content_format: 'Short Post',
  hook_line: "Building a startup is like running a marathon in the dark",
  call_to_action: "What's the biggest lesson you've learned as a founder? Drop it in the comments below.",
  suggested_posting_time: 'Tuesday 8:30 AM EST',
  carousel_slides: [],
  tone_notes: 'Conversational, authentic, slightly vulnerable. Balances personal experience with actionable advice.',
  content_tips: 'Consider adding a personal photo or behind-the-scenes image to increase engagement. LinkedIn posts with images get 2x more engagement.'
}

const SAMPLE_HASHTAGS: HashtagResponse = {
  platform: 'LinkedIn',
  hashtags: [
    { tag: '#StartupLife', category: 'High Volume', estimated_reach: '2.4M' },
    { tag: '#FounderJourney', category: 'Medium', estimated_reach: '890K' },
    { tag: '#BuildInPublic', category: 'Trending', estimated_reach: '1.2M' },
    { tag: '#SaaS', category: 'High Volume', estimated_reach: '3.1M' },
    { tag: '#Entrepreneurship', category: 'High Volume', estimated_reach: '5.6M' },
    { tag: '#StartupGrowth', category: 'Niche', estimated_reach: '340K' },
    { tag: '#ProductLed', category: 'Niche', estimated_reach: '180K' },
    { tag: '#TechFounder', category: 'Medium', estimated_reach: '520K' },
  ],
  hashtag_groups: [
    { group_name: 'Growth & Scaling', tags: ['#StartupGrowth', '#ScaleUp', '#GrowthHacking'] },
    { group_name: 'Founder Community', tags: ['#FounderJourney', '#BuildInPublic', '#IndieHacker'] },
    { group_name: 'Industry', tags: ['#SaaS', '#TechStartup', '#B2B'] },
  ],
  strategy_notes: 'For LinkedIn, use 3-5 hashtags maximum. Place them at the end of your post, not inline. Mix high-volume tags with niche ones for optimal reach without getting lost in the noise.',
  trending_tags: ['#BuildInPublic', '#AIStartup', '#FounderMindset']
}

const SAMPLE_SCHEDULE: ScheduleResponse = {
  schedule: [
    { day: 'Monday', time: '8:30 AM', platform: 'LinkedIn', content_type: 'Thought Leadership', priority: 'High', reasoning: 'Monday mornings have peak professional engagement' },
    { day: 'Tuesday', time: '12:00 PM', platform: 'Instagram', content_type: 'Behind-the-Scenes', priority: 'Medium', reasoning: 'Lunch break scrolling peaks on Tuesdays' },
    { day: 'Wednesday', time: '9:00 AM', platform: 'LinkedIn', content_type: 'Case Study', priority: 'High', reasoning: 'Mid-week is ideal for detailed content' },
    { day: 'Thursday', time: '5:00 PM', platform: 'Instagram', content_type: 'Carousel', priority: 'High', reasoning: 'Evening engagement spike for visual content' },
    { day: 'Friday', time: '10:00 AM', platform: 'LinkedIn', content_type: 'Personal Story', priority: 'Medium', reasoning: 'Friday personal posts get high engagement' },
  ],
  weekly_summary: 'This schedule targets 5 posts per week across both platforms, with LinkedIn focused on professional thought leadership and Instagram on visual storytelling. The timing is optimized for maximum engagement based on platform-specific peak hours.',
  platform_frequency: { instagram: 2, linkedin: 3 },
  optimization_tips: 'Consistency is more important than frequency. Start with this 5-post schedule and adjust based on engagement data after 2-3 weeks. Always batch-create content on weekends to maintain the schedule.',
  best_posting_windows: [
    { platform: 'LinkedIn', day: 'Weekdays', time_window: '7:30-9:30 AM', engagement_level: 'Peak' },
    { platform: 'LinkedIn', day: 'Weekdays', time_window: '12:00-1:00 PM', engagement_level: 'High' },
    { platform: 'Instagram', day: 'Tue-Thu', time_window: '11:00 AM-1:00 PM', engagement_level: 'Peak' },
    { platform: 'Instagram', day: 'Daily', time_window: '7:00-9:00 PM', engagement_level: 'High' },
  ]
}

const SAMPLE_ANALYTICS: AnalyticsResponse = {
  performance_summary: 'Your content performance over the past 30 days shows strong growth on LinkedIn (+23% engagement) with room for improvement on Instagram. Carousel posts are your top-performing format, while personal stories drive the most comments. Consider increasing posting frequency on Instagram from 2 to 3 times per week.',
  top_performing_content: [
    { content_type: 'Carousel', platform: 'Instagram', engagement_rate: '8.4%', key_factors: 'Educational content, swipe-worthy design, strong CTA on last slide' },
    { content_type: 'Personal Story', platform: 'LinkedIn', engagement_rate: '6.2%', key_factors: 'Authenticity, vulnerability, relatable founder experience' },
    { content_type: 'Thought Leadership', platform: 'LinkedIn', engagement_rate: '5.1%', key_factors: 'Industry insights, data-driven claims, contrarian viewpoint' },
  ],
  recommendations: [
    { area: 'Content Mix', recommendation: 'Increase carousel posts on Instagram to 2x per week. They consistently outperform single images by 3x.', expected_impact: '+35% engagement', priority: 'High' },
    { area: 'Posting Time', recommendation: 'Shift LinkedIn posts 30 minutes earlier. Your audience is most active at 7:30-8:00 AM, not 8:30 AM.', expected_impact: '+15% reach', priority: 'Medium' },
    { area: 'Hashtag Strategy', recommendation: 'Reduce hashtag count on LinkedIn from 8 to 3-4. Over-hashtagging reduces perceived professionalism.', expected_impact: '+10% engagement', priority: 'Low' },
  ],
  trend_analysis: 'Short-form video content is gaining traction on both platforms. Founders sharing raw, unpolished behind-the-scenes content are seeing 2-3x higher engagement than polished corporate content. Consider adding Instagram Reels to your content mix.',
  growth_opportunities: [
    'Start a weekly "Founder Friday" series sharing personal lessons',
    'Collaborate with 2-3 other founders for cross-promotion',
    'Repurpose top LinkedIn posts into Instagram carousels',
    'Add Instagram Reels for behind-the-scenes content',
    'Build an email list from your most engaged followers'
  ],
  metrics_breakdown: {
    instagram: { followers: '2,340', engagement_rate: '4.2%', avg_likes: 156, avg_comments: 23, reach_growth: '+12%' },
    linkedin: { followers: '8,920', engagement_rate: '5.8%', avg_likes: 312, avg_comments: 47, reach_growth: '+23%' }
  }
}

// ---- Error Boundary ----
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8 max-w-md">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-slate-900">Something went wrong</h2>
            <p className="text-slate-500 mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ---- Markdown Renderer ----
function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

// ---- Platform Badge Component ----
function PlatformBadge({ platform }: { platform?: string }) {
  const p = (platform ?? '').toLowerCase()
  if (p.includes('instagram')) {
    return <Badge className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white border-0 text-xs">Instagram</Badge>
  }
  if (p.includes('linkedin')) {
    return <Badge className="bg-[#0077b5] text-white border-0 text-xs">LinkedIn</Badge>
  }
  return <Badge variant="outline" className="text-xs">{platform ?? 'All'}</Badge>
}

// ---- Priority Badge Component ----
function PriorityBadge({ priority }: { priority?: string }) {
  const p = (priority ?? '').toLowerCase()
  if (p === 'high') return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">High</Badge>
  if (p === 'medium') return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Medium</Badge>
  if (p === 'low') return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Low</Badge>
  return <Badge variant="outline" className="text-xs">{priority ?? 'Normal'}</Badge>
}

// ---- Loading Spinner Inline ----
function InlineSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-violet-600">
      <FiLoader className="w-4 h-4 animate-spin" />
      <span className="text-sm">{text ?? 'Processing...'}</span>
    </div>
  )
}

// ---- Stat Card ----
function StatCard({ icon, label, value, trend, trendUp }: { icon: React.ReactNode; label: string; value: string; trend?: string; trendUp?: boolean }) {
  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-violet-50 text-violet-600">{icon}</div>
          {trend && (
            <span className={cn('text-xs font-medium flex items-center gap-1', trendUp ? 'text-emerald-600' : 'text-red-500')}>
              <FiTrendingUp className={cn('w-3 h-3', !trendUp && 'rotate-180')} />
              {trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}

// ---- Agent Status Bar ----
function AgentStatusBar({ activeAgentId }: { activeAgentId: string | null }) {
  const agents = [
    { id: AGENT_CONTENT_CREATOR, name: 'Content Creator', icon: <FiEdit3 className="w-3.5 h-3.5" /> },
    { id: AGENT_HASHTAG_GENERATOR, name: 'Hashtag Generator', icon: <FiHash className="w-3.5 h-3.5" /> },
    { id: AGENT_POST_SCHEDULER, name: 'Post Scheduler', icon: <FiCalendar className="w-3.5 h-3.5" /> },
    { id: AGENT_ANALYTICS_ADVISOR, name: 'Analytics Advisor', icon: <FiBarChart2 className="w-3.5 h-3.5" /> },
  ]
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AI Agents</p>
        <div className="space-y-2">
          {agents.map((a) => (
            <div key={a.id} className="flex items-center gap-2.5">
              <div className={cn('w-2 h-2 rounded-full', activeAgentId === a.id ? 'bg-violet-500 animate-pulse' : 'bg-emerald-400')} />
              <span className="text-slate-600">{a.icon}</span>
              <span className={cn('text-xs', activeAgentId === a.id ? 'text-violet-700 font-medium' : 'text-slate-600')}>{a.name}</span>
              {activeAgentId === a.id && <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px] ml-auto">Active</Badge>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---- Sidebar Navigation ----
function SidebarNav({ view, setView, mobileOpen, setMobileOpen }: { view: NavView; setView: (v: NavView) => void; mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const items: { key: NavView; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { key: 'create', label: 'Create Content', icon: <FiEdit3 className="w-5 h-5" /> },
    { key: 'hashtags', label: 'Hashtags', icon: <FiHash className="w-5 h-5" /> },
    { key: 'schedule', label: 'Schedule', icon: <FiCalendar className="w-5 h-5" /> },
    { key: 'analytics', label: 'Analytics', icon: <FiBarChart2 className="w-5 h-5" /> },
    { key: 'brand', label: 'Brand Voice', icon: <FiUser className="w-5 h-5" /> },
  ]

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
          <FiZap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">FounderPost</h1>
          <p className="text-xs text-slate-400">AI Content Studio</p>
        </div>
      </div>
      <Separator className="bg-slate-700/50" />
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => { setView(item.key); setMobileOpen(false) }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              view === item.key ? 'bg-violet-600/90 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4">
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Pro Tip</p>
          <p className="text-xs text-slate-300">Use the Brand Voice page to save your unique writing style for consistent content.</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col border-r border-slate-800 fixed inset-y-0 left-0 z-30">
        {navContent}
      </aside>
      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-800">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {navContent}
        </SheetContent>
      </Sheet>
    </>
  )
}

// ======== VIEW COMPONENTS ========

// ---- Dashboard View ----
function DashboardView({ setView, sampleData }: { setView: (v: NavView) => void; sampleData: boolean }) {
  const [greeting, setGreeting] = useState('Good morning')
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{greeting}, Founder</h2>
        <p className="text-slate-500 mt-1">Here is your content overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<FiFileText className="w-5 h-5" />} label="Posts Created" value={sampleData ? '24' : '0'} trend={sampleData ? '+12%' : undefined} trendUp />
        <StatCard icon={<FiClock className="w-5 h-5" />} label="Scheduled Posts" value={sampleData ? '8' : '0'} trend={sampleData ? '+3' : undefined} trendUp />
        <StatCard icon={<FiActivity className="w-5 h-5" />} label="Avg Engagement" value={sampleData ? '5.4%' : '--'} trend={sampleData ? '+0.8%' : undefined} trendUp />
        <StatCard icon={<FiStar className="w-5 h-5" />} label="Total Followers" value={sampleData ? '11.2K' : '--'} trend={sampleData ? '+340' : undefined} trendUp />
      </div>

      {/* Quick Actions */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setView('create')} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <FiEdit3 className="w-4 h-4" /> Create Post
            </Button>
            <Button onClick={() => setView('schedule')} variant="outline" className="gap-2 border-slate-300">
              <FiCalendar className="w-4 h-4" /> View Schedule
            </Button>
            <Button onClick={() => setView('analytics')} variant="outline" className="gap-2 border-slate-300">
              <FiBarChart2 className="w-4 h-4" /> Get Analytics
            </Button>
            <Button onClick={() => setView('hashtags')} variant="outline" className="gap-2 border-slate-300">
              <FiHash className="w-4 h-4" /> Find Hashtags
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Status */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Connected Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center">
                <FiExternalLink className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">Instagram</p>
                <p className="text-xs text-slate-500">{sampleData ? '2,340 followers' : 'Ready to use'}</p>
              </div>
              <div className="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100 flex-1">
              <div className="w-10 h-10 rounded-lg bg-[#0077b5] flex items-center justify-center">
                <FiExternalLink className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">LinkedIn</p>
                <p className="text-xs text-slate-500">{sampleData ? '8,920 followers' : 'Ready to use'}</p>
              </div>
              <div className="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {sampleData ? (
            <div className="space-y-3">
              {[
                { action: 'Created LinkedIn post about startup lessons', time: '2 hours ago', icon: <FiEdit3 className="w-4 h-4" /> },
                { action: 'Scheduled Instagram carousel for Thursday', time: '5 hours ago', icon: <FiCalendar className="w-4 h-4" /> },
                { action: 'Generated hashtags for product launch post', time: '1 day ago', icon: <FiHash className="w-4 h-4" /> },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="p-1.5 rounded-md bg-violet-50 text-violet-600">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{item.action}</p>
                    <p className="text-xs text-slate-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiActivity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No recent activity yet.</p>
              <p className="text-xs text-slate-400 mt-1">Create your first post to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Create Content View ----
function CreateContentView({ sampleData, brandVoice, setView, setActiveAgentId }: { sampleData: boolean; brandVoice: string; setView: (v: NavView) => void; setActiveAgentId: (id: string | null) => void }) {
  const [formData, setFormData] = useState({ topic: '', platform: 'linkedin', format: 'short_post', voice: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ContentResponse | null>(null)
  const [copyMsg, setCopyMsg] = useState<string | null>(null)
  const [toneOpen, setToneOpen] = useState(false)
  const [tipsOpen, setTipsOpen] = useState(false)

  useEffect(() => {
    if (brandVoice && !formData.voice) {
      setFormData(prev => ({ ...prev, voice: brandVoice }))
    }
  }, [brandVoice, formData.voice])

  useEffect(() => {
    if (sampleData && !result) {
      setResult(SAMPLE_CONTENT)
      setFormData(prev => ({ ...prev, topic: 'Lessons learned scaling a startup from 0 to 10k users', platform: 'linkedin', format: 'short_post' }))
    }
    if (!sampleData && result === SAMPLE_CONTENT) {
      setResult(null)
      setFormData({ topic: '', platform: 'linkedin', format: 'short_post', voice: brandVoice })
    }
  }, [sampleData, result, brandVoice])

  const handleGenerate = async () => {
    if (!formData.topic.trim()) { setError('Please enter a topic or theme.'); return }
    setLoading(true); setError(null); setResult(null)
    setActiveAgentId(AGENT_CONTENT_CREATOR)
    const platformLabel = formData.platform === 'both' ? 'Instagram and LinkedIn' : formData.platform === 'instagram' ? 'Instagram' : 'LinkedIn'
    const formatLabel = formData.format.replace('_', ' ')
    const msg = `Create a ${formatLabel} for ${platformLabel} about: ${formData.topic}${formData.voice ? `. Brand voice: ${formData.voice}` : ''}`
    try {
      const res = await callAIAgent(msg, AGENT_CONTENT_CREATOR)
      if (res.success) {
        const data = res?.response?.result ?? {}
        setResult(data as ContentResponse)
      } else {
        setError(res?.error ?? 'Failed to generate content. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    }
    setLoading(false); setActiveAgentId(null)
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg(`${label} copied!`)
      setTimeout(() => setCopyMsg(null), 2000)
    })
  }

  const slides = Array.isArray(result?.carousel_slides) ? result.carousel_slides : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Create Content</h2>
        <p className="text-slate-500 mt-1">Generate engaging posts for Instagram and LinkedIn.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><FiEdit3 className="w-4 h-4 text-violet-600" /> Post Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Topic / Theme *</Label>
              <Textarea
                placeholder="e.g., Lessons learned from launching our MVP, Tips for first-time founders..."
                className="mt-1.5 min-h-[100px] border-slate-300 focus:border-violet-500"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Platform</Label>
              <div className="flex gap-2 mt-1.5">
                {[
                  { key: 'linkedin', label: 'LinkedIn' },
                  { key: 'instagram', label: 'Instagram' },
                  { key: 'both', label: 'Both' },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setFormData(prev => ({ ...prev, platform: p.key }))}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                      formData.platform === p.key ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-300 hover:border-violet-300'
                    )}
                  >{p.label}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Content Format</Label>
              <Select value={formData.format} onValueChange={(v) => setFormData(prev => ({ ...prev, format: v }))}>
                <SelectTrigger className="mt-1.5 border-slate-300">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_post">Short Post</SelectItem>
                  <SelectItem value="long_article">Long Article</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="image_caption">Image Caption</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Brand Voice (optional)</Label>
              <Textarea
                placeholder="e.g., Conversational, witty, data-driven. Speak like a friend who happens to be an expert..."
                className="mt-1.5 min-h-[60px] border-slate-300"
                value={formData.voice}
                onChange={(e) => setFormData(prev => ({ ...prev, voice: e.target.value }))}
              />
              {brandVoice && !formData.voice && (
                <p className="text-xs text-slate-400 mt-1">Your saved brand voice will be used automatically.</p>
              )}
            </div>
            <Button onClick={handleGenerate} disabled={loading || !formData.topic.trim()} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
              {loading ? <><FiLoader className="w-4 h-4 animate-spin" /> Generating...</> : <><FiZap className="w-4 h-4" /> Generate Content</>}
            </Button>
            {error && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg"><FiAlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
          </CardContent>
        </Card>

        {/* Output */}
        <div className="space-y-4">
          {loading && (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          )}

          {result && !loading && (
            <>
              {copyMsg && <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-2.5 rounded-lg"><FiCheck className="w-4 h-4" />{copyMsg}</div>}

              {/* Post Preview */}
              <Card className="border border-slate-200 shadow-sm overflow-hidden">
                <div className={cn('h-1.5', result.platform?.toLowerCase().includes('instagram') ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400' : 'bg-[#0077b5]')} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Post Preview</CardTitle>
                    <div className="flex items-center gap-2">
                      <PlatformBadge platform={result.platform} />
                      {result.content_format && <Badge variant="outline" className="text-xs">{result.content_format}</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hook Line */}
                  {result.hook_line && (
                    <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                      <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-1">Hook</p>
                      <p className="text-sm font-medium text-violet-900">{result.hook_line}</p>
                    </div>
                  )}

                  {/* Main Content */}
                  {result.post_content && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      {renderMarkdown(result.post_content)}
                    </div>
                  )}

                  {/* Carousel Slides */}
                  {slides.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Carousel Slides</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {slides.map((slide, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                              <span className="text-xs text-slate-400">Slide {idx + 1}</span>
                            </div>
                            <p className="text-sm text-slate-700">{slide}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  {result.call_to_action && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Call to Action</p>
                      <p className="text-sm text-emerald-800">{result.call_to_action}</p>
                    </div>
                  )}

                  {/* Posting Time */}
                  {result.suggested_posting_time && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiClock className="w-4 h-4 text-violet-500" />
                      <span>Best time to post: </span>
                      <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">{result.suggested_posting_time}</Badge>
                    </div>
                  )}
                </CardContent>

                {/* Collapsibles */}
                <CardContent className="pt-0 space-y-2">
                  {result.tone_notes && (
                    <Collapsible open={toneOpen} onOpenChange={setToneOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                        <span className="flex items-center gap-2"><FiInfo className="w-4 h-4 text-slate-400" /> Tone Notes</span>
                        {toneOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-2.5 pb-2">
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{result.tone_notes}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  {result.content_tips && (
                    <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                        <span className="flex items-center gap-2"><FiStar className="w-4 h-4 text-amber-500" /> Content Tips</span>
                        {tipsOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-2.5 pb-2">
                        <p className="text-sm text-slate-600 bg-amber-50 p-3 rounded-lg">{result.content_tips}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CardContent>

                <CardFooter className="border-t border-slate-100 pt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 border-slate-300" onClick={() => handleCopy(result.post_content ?? '', 'Content')}>
                    <FiCopy className="w-3.5 h-3.5" /> Copy Content
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 border-slate-300" onClick={() => setView('hashtags')}>
                    <FiHash className="w-3.5 h-3.5" /> Generate Hashtags
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 border-slate-300" onClick={() => setView('schedule')}>
                    <FiCalendar className="w-3.5 h-3.5" /> Schedule Post
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}

          {!result && !loading && (
            <Card className="border border-dashed border-slate-300 shadow-none">
              <CardContent className="p-12 text-center">
                <FiEdit3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Your generated content will appear here</p>
                <p className="text-xs text-slate-400 mt-1">Fill in the form and click Generate Content.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Hashtags View ----
function HashtagsView({ sampleData, setActiveAgentId }: { sampleData: boolean; setActiveAgentId: (id: string | null) => void }) {
  const [formData, setFormData] = useState({ content: '', platform: 'linkedin' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<HashtagResponse | null>(null)
  const [copyMsg, setCopyMsg] = useState<string | null>(null)

  useEffect(() => {
    if (sampleData && !result) {
      setResult(SAMPLE_HASHTAGS)
      setFormData(prev => ({ ...prev, content: 'Building a startup is like running a marathon in the dark...' }))
    }
    if (!sampleData && result === SAMPLE_HASHTAGS) {
      setResult(null)
      setFormData({ content: '', platform: 'linkedin' })
    }
  }, [sampleData, result])

  const handleGenerate = async () => {
    if (!formData.content.trim()) { setError('Please enter content text.'); return }
    setLoading(true); setError(null); setResult(null)
    setActiveAgentId(AGENT_HASHTAG_GENERATOR)
    const platformLabel = formData.platform === 'instagram' ? 'Instagram' : 'LinkedIn'
    const msg = `Generate hashtags for this ${platformLabel} post: ${formData.content}`
    try {
      const res = await callAIAgent(msg, AGENT_HASHTAG_GENERATOR)
      if (res.success) {
        setResult((res?.response?.result ?? {}) as HashtagResponse)
      } else {
        setError(res?.error ?? 'Failed to generate hashtags.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false); setActiveAgentId(null)
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg(`${label} copied!`)
      setTimeout(() => setCopyMsg(null), 2000)
    })
  }

  const hashtags = Array.isArray(result?.hashtags) ? result.hashtags : []
  const groups = Array.isArray(result?.hashtag_groups) ? result.hashtag_groups : []
  const trending = Array.isArray(result?.trending_tags) ? result.trending_tags : []
  const allTags = hashtags.map(h => h?.tag ?? '').filter(Boolean).join(' ')

  const getCategoryColor = (cat?: string) => {
    const c = (cat ?? '').toLowerCase()
    if (c.includes('high')) return 'bg-violet-100 text-violet-700 border-violet-200'
    if (c.includes('medium')) return 'bg-blue-100 text-blue-700 border-blue-200'
    if (c.includes('niche')) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (c.includes('trending')) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Hashtag Generator</h2>
        <p className="text-slate-500 mt-1">Find the perfect hashtags to maximize your reach.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><FiHash className="w-4 h-4 text-violet-600" /> Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Post Content *</Label>
              <Textarea
                placeholder="Paste your post content here to generate relevant hashtags..."
                className="mt-1.5 min-h-[120px] border-slate-300"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Platform</Label>
              <div className="flex gap-2 mt-1.5">
                {['linkedin', 'instagram'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFormData(prev => ({ ...prev, platform: p }))}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize',
                      formData.platform === p ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-300 hover:border-violet-300'
                    )}
                  >{p}</button>
                ))}
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={loading || !formData.content.trim()} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
              {loading ? <><FiLoader className="w-4 h-4 animate-spin" /> Generating...</> : <><FiHash className="w-4 h-4" /> Generate Hashtags</>}
            </Button>
            {error && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg"><FiAlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
          </CardContent>
        </Card>

        {/* Output */}
        <div className="space-y-4">
          {loading && (
            <Card className="border border-slate-200"><CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-40" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-8 w-full" />
            </CardContent></Card>
          )}

          {result && !loading && (
            <>
              {copyMsg && <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-2.5 rounded-lg"><FiCheck className="w-4 h-4" />{copyMsg}</div>}

              {/* All Hashtags */}
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Hashtags ({hashtags.length})</CardTitle>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs border-slate-300" onClick={() => handleCopy(allTags, 'All hashtags')}>
                      <FiCopy className="w-3.5 h-3.5" /> Copy All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((h, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleCopy(h?.tag ?? '', h?.tag ?? '')}
                              className={cn('px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer hover:opacity-80 transition-opacity', getCategoryColor(h?.category))}
                            >
                              {h?.tag ?? ''}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Reach: {h?.estimated_reach ?? 'N/A'} | {h?.category ?? 'General'}</p>
                            <p className="text-xs text-slate-400">Click to copy</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-200" /> High Volume</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-200" /> Medium</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-200" /> Niche</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-200" /> Trending</span>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Tags */}
              {trending.length > 0 && (
                <Card className="border border-amber-200 bg-amber-50/30 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><FiTrendingUp className="w-4 h-4 text-amber-600" /> Trending Now</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {trending.map((t, idx) => (
                        <button key={idx} onClick={() => handleCopy(t, t)} className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors cursor-pointer">
                          {t}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hashtag Groups */}
              {groups.length > 0 && (
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Hashtag Groups</CardTitle>
                    <CardDescription className="text-xs">Organized sets you can save and reuse</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {groups.map((g, idx) => {
                      const tags = Array.isArray(g?.tags) ? g.tags : []
                      return (
                        <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-700">{g?.group_name ?? `Group ${idx + 1}`}</p>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-slate-500" onClick={() => handleCopy(tags.join(' '), g?.group_name ?? 'Group')}>
                              <FiCopy className="w-3 h-3" /> Copy
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag, ti) => (
                              <Badge key={ti} variant="outline" className="text-xs bg-white">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Strategy Notes */}
              {result.strategy_notes && (
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><FiTarget className="w-4 h-4 text-violet-600" /> Strategy Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-600 leading-relaxed">{renderMarkdown(result.strategy_notes)}</div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!result && !loading && (
            <Card className="border border-dashed border-slate-300 shadow-none">
              <CardContent className="p-12 text-center">
                <FiHash className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Hashtag suggestions will appear here</p>
                <p className="text-xs text-slate-400 mt-1">Paste your content and generate hashtags.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Schedule View ----
function ScheduleView({ sampleData, setActiveAgentId }: { sampleData: boolean; setActiveAgentId: (id: string | null) => void }) {
  const [formData, setFormData] = useState({ description: '', platform: 'both', timezone: 'EST', contentTypes: { thought_leadership: true, carousel: true, personal_story: true, behind_scenes: false } })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScheduleResponse | null>(null)

  useEffect(() => {
    if (sampleData && !result) {
      setResult(SAMPLE_SCHEDULE)
      setFormData(prev => ({ ...prev, description: 'B2B SaaS startup, targeting founders and early-stage investors' }))
    }
    if (!sampleData && result === SAMPLE_SCHEDULE) {
      setResult(null)
      setFormData(prev => ({ ...prev, description: '' }))
    }
  }, [sampleData, result])

  const handleGenerate = async () => {
    if (!formData.description.trim()) { setError('Please describe your content needs.'); return }
    setLoading(true); setError(null); setResult(null)
    setActiveAgentId(AGENT_POST_SCHEDULER)
    const selectedTypes = Object.entries(formData.contentTypes).filter(([, v]) => v).map(([k]) => k.replace('_', ' ')).join(', ')
    const platformLabel = formData.platform === 'both' ? 'Instagram and LinkedIn' : formData.platform === 'instagram' ? 'Instagram' : 'LinkedIn'
    const msg = `Create a weekly posting schedule for ${platformLabel}. Content types: ${selectedTypes}. Timezone: ${formData.timezone}. Context: ${formData.description}`
    try {
      const res = await callAIAgent(msg, AGENT_POST_SCHEDULER)
      if (res.success) {
        setResult((res?.response?.result ?? {}) as ScheduleResponse)
      } else {
        setError(res?.error ?? 'Failed to generate schedule.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false); setActiveAgentId(null)
  }

  const schedule = Array.isArray(result?.schedule) ? result.schedule : []
  const windows = Array.isArray(result?.best_posting_windows) ? result.best_posting_windows : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Post Scheduler</h2>
        <p className="text-slate-500 mt-1">Get an optimized weekly posting schedule.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><FiCalendar className="w-4 h-4 text-violet-600" /> Schedule Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Content Description *</Label>
              <Textarea
                placeholder="Describe your business, audience, and content goals..."
                className="mt-1.5 min-h-[80px] border-slate-300"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Platform</Label>
              <div className="flex gap-2 mt-1.5">
                {['linkedin', 'instagram', 'both'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFormData(prev => ({ ...prev, platform: p }))}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize',
                      formData.platform === p ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-300 hover:border-violet-300'
                    )}
                  >{p}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Content Types</Label>
              <div className="mt-1.5 space-y-2">
                {[
                  { key: 'thought_leadership', label: 'Thought Leadership' },
                  { key: 'carousel', label: 'Carousel Posts' },
                  { key: 'personal_story', label: 'Personal Stories' },
                  { key: 'behind_scenes', label: 'Behind the Scenes' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.contentTypes[key as keyof typeof formData.contentTypes]}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contentTypes: { ...prev.contentTypes, [key]: !!checked } }))}
                    />
                    <label className="text-sm text-slate-600">{label}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Time Zone</Label>
              <Select value={formData.timezone} onValueChange={(v) => setFormData(prev => ({ ...prev, timezone: v }))}>
                <SelectTrigger className="mt-1.5 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EST">Eastern (EST)</SelectItem>
                  <SelectItem value="CST">Central (CST)</SelectItem>
                  <SelectItem value="MST">Mountain (MST)</SelectItem>
                  <SelectItem value="PST">Pacific (PST)</SelectItem>
                  <SelectItem value="GMT">GMT</SelectItem>
                  <SelectItem value="CET">CET</SelectItem>
                  <SelectItem value="IST">IST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={loading || !formData.description.trim()} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
              {loading ? <><FiLoader className="w-4 h-4 animate-spin" /> Generating...</> : <><FiCalendar className="w-4 h-4" /> Generate Schedule</>}
            </Button>
            {error && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg"><FiAlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
          </CardContent>
        </Card>

        {/* Output */}
        <div className="space-y-4">
          {loading && (
            <Card className="border border-slate-200"><CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-40" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" />
            </CardContent></Card>
          )}

          {result && !loading && (
            <>
              {/* Weekly Summary */}
              {result.weekly_summary && (
                <Card className="border border-violet-200 bg-violet-50/30 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><FiInfo className="w-4 h-4 text-violet-600" /> Weekly Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-700 leading-relaxed">{renderMarkdown(result.weekly_summary)}</div>
                  </CardContent>
                </Card>
              )}

              {/* Platform Frequency */}
              {result.platform_frequency && (
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border border-pink-100 bg-gradient-to-br from-pink-50 to-purple-50 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-pink-700">{result.platform_frequency?.instagram ?? 0}</p>
                      <p className="text-xs text-pink-600 mt-1">Instagram / week</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-blue-100 bg-blue-50 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700">{result.platform_frequency?.linkedin ?? 0}</p>
                      <p className="text-xs text-blue-600 mt-1">LinkedIn / week</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Schedule Table */}
              {schedule.length > 0 && (
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Weekly Calendar</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="w-full">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="text-xs font-semibold">Day</TableHead>
                            <TableHead className="text-xs font-semibold">Time</TableHead>
                            <TableHead className="text-xs font-semibold">Platform</TableHead>
                            <TableHead className="text-xs font-semibold">Content</TableHead>
                            <TableHead className="text-xs font-semibold">Priority</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedule.map((item, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-50">
                              <TableCell className="text-sm font-medium">{item?.day ?? ''}</TableCell>
                              <TableCell className="text-sm"><Badge variant="outline" className="font-mono text-xs">{item?.time ?? ''}</Badge></TableCell>
                              <TableCell><PlatformBadge platform={item?.platform} /></TableCell>
                              <TableCell className="text-sm">{item?.content_type ?? ''}</TableCell>
                              <TableCell><PriorityBadge priority={item?.priority} /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Best Posting Windows */}
              {windows.length > 0 && (
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><FiClock className="w-4 h-4 text-violet-600" /> Best Posting Windows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {windows.map((w, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <PlatformBadge platform={w?.platform} />
                          <span className="text-sm text-slate-600">{w?.day ?? ''}</span>
                          <Badge className="bg-violet-100 text-violet-700 border-0 text-xs font-mono">{w?.time_window ?? ''}</Badge>
                          <Badge className={cn('text-xs border-0 ml-auto', w?.engagement_level?.toLowerCase() === 'peak' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700')}>
                            {w?.engagement_level ?? ''}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Optimization Tips */}
              {result.optimization_tips && (
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><FiStar className="w-4 h-4 text-amber-500" /> Optimization Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-600 leading-relaxed">{renderMarkdown(result.optimization_tips)}</div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!result && !loading && (
            <Card className="border border-dashed border-slate-300 shadow-none">
              <CardContent className="p-12 text-center">
                <FiCalendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Your weekly schedule will appear here</p>
                <p className="text-xs text-slate-400 mt-1">Describe your content goals to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Analytics View ----
function AnalyticsView({ sampleData, setActiveAgentId }: { sampleData: boolean; setActiveAgentId: (id: string | null) => void }) {
  const [formData, setFormData] = useState({ metrics: '', platform: 'both' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyticsResponse | null>(null)

  useEffect(() => {
    if (sampleData && !result) {
      setResult(SAMPLE_ANALYTICS)
      setFormData(prev => ({ ...prev, metrics: 'Instagram: 2340 followers, 4.2% engagement rate, avg 156 likes, 23 comments. LinkedIn: 8920 followers, 5.8% engagement, avg 312 likes, 47 comments. Posting 5x/week.' }))
    }
    if (!sampleData && result === SAMPLE_ANALYTICS) {
      setResult(null)
      setFormData({ metrics: '', platform: 'both' })
    }
  }, [sampleData, result])

  const handleAnalyze = async () => {
    if (!formData.metrics.trim()) { setError('Please enter your engagement metrics.'); return }
    setLoading(true); setError(null); setResult(null)
    setActiveAgentId(AGENT_ANALYTICS_ADVISOR)
    const platformLabel = formData.platform === 'both' ? 'Instagram and LinkedIn' : formData.platform === 'instagram' ? 'Instagram' : 'LinkedIn'
    const msg = `Analyze my social media performance on ${platformLabel}. Here are my metrics: ${formData.metrics}`
    try {
      const res = await callAIAgent(msg, AGENT_ANALYTICS_ADVISOR)
      if (res.success) {
        setResult((res?.response?.result ?? {}) as AnalyticsResponse)
      } else {
        setError(res?.error ?? 'Failed to analyze performance.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false); setActiveAgentId(null)
  }

  const topContent = Array.isArray(result?.top_performing_content) ? result.top_performing_content : []
  const recommendations = Array.isArray(result?.recommendations) ? result.recommendations : []
  const growthOps = Array.isArray(result?.growth_opportunities) ? result.growth_opportunities : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Analytics Advisor</h2>
        <p className="text-slate-500 mt-1">Get AI-powered insights and recommendations for your content strategy.</p>
      </div>

      {/* Input */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><FiBarChart2 className="w-4 h-4 text-violet-600" /> Your Metrics</CardTitle>
          <CardDescription className="text-xs">Share your engagement data: likes, comments, shares, reach, impressions, follower count, and growth.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., Instagram: 2,500 followers, 4.5% engagement, avg 180 likes per post. LinkedIn: 6,000 followers, 3.2% engagement, avg 45 comments. Top post last week: carousel about startup fundraising with 12k impressions..."
            className="min-h-[100px] border-slate-300"
            value={formData.metrics}
            onChange={(e) => setFormData(prev => ({ ...prev, metrics: e.target.value }))}
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {['both', 'linkedin', 'instagram'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFormData(prev => ({ ...prev, platform: p }))}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize',
                    formData.platform === p ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-300 hover:border-violet-300'
                  )}
                >{p}</button>
              ))}
            </div>
            <Button onClick={handleAnalyze} disabled={loading || !formData.metrics.trim()} className="bg-violet-600 hover:bg-violet-700 text-white gap-2 ml-auto">
              {loading ? <><FiLoader className="w-4 h-4 animate-spin" /> Analyzing...</> : <><FiBarChart2 className="w-4 h-4" /> Analyze Performance</>}
            </Button>
          </div>
          {error && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg"><FiAlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
        </CardContent>
      </Card>

      {/* Output */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border border-slate-200"><CardContent className="p-6 space-y-3"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
          ))}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Performance Summary */}
          {result.performance_summary && (
            <Card className="border border-violet-200 bg-violet-50/30 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2"><FiActivity className="w-4 h-4 text-violet-600" /> Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-700 leading-relaxed">{renderMarkdown(result.performance_summary)}</div>
              </CardContent>
            </Card>
          )}

          {/* Platform Metrics Breakdown */}
          {result.metrics_breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.metrics_breakdown?.instagram && (
                <Card className="border border-pink-100 shadow-sm overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-pink-700">Instagram</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(result.metrics_breakdown.instagram).map(([key, val]) => (
                        <div key={key} className="p-2 rounded-lg bg-pink-50/50">
                          <p className="text-xs text-pink-600 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-semibold text-slate-900">{String(val ?? '')}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {result.metrics_breakdown?.linkedin && (
                <Card className="border border-blue-100 shadow-sm overflow-hidden">
                  <div className="h-1.5 bg-[#0077b5]" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-blue-700">LinkedIn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(result.metrics_breakdown.linkedin).map(([key, val]) => (
                        <div key={key} className="p-2 rounded-lg bg-blue-50/50">
                          <p className="text-xs text-blue-600 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-semibold text-slate-900">{String(val ?? '')}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Top Performing Content */}
          {topContent.length > 0 && (
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2"><FiStar className="w-4 h-4 text-amber-500" /> Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="text-xs font-semibold">Content Type</TableHead>
                        <TableHead className="text-xs font-semibold">Platform</TableHead>
                        <TableHead className="text-xs font-semibold">Engagement</TableHead>
                        <TableHead className="text-xs font-semibold">Key Factors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topContent.map((item, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-50">
                          <TableCell className="text-sm font-medium">{item?.content_type ?? ''}</TableCell>
                          <TableCell><PlatformBadge platform={item?.platform} /></TableCell>
                          <TableCell><Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">{item?.engagement_rate ?? ''}</Badge></TableCell>
                          <TableCell className="text-sm text-slate-600 max-w-xs">{item?.key_factors ?? ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2"><FiTarget className="w-4 h-4 text-violet-600" /> Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{rec?.area ?? ''}</Badge>
                      <div className="flex items-center gap-2">
                        {rec?.expected_impact && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">{rec.expected_impact}</Badge>}
                        <PriorityBadge priority={rec?.priority} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{rec?.recommendation ?? ''}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Trend Analysis */}
          {result.trend_analysis && (
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2"><FiTrendingUp className="w-4 h-4 text-violet-600" /> Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-700 leading-relaxed">{renderMarkdown(result.trend_analysis)}</div>
              </CardContent>
            </Card>
          )}

          {/* Growth Opportunities */}
          {growthOps.length > 0 && (
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2"><FiArrowRight className="w-4 h-4 text-emerald-600" /> Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {growthOps.map((opp, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-sm text-slate-700">{opp}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!result && !loading && (
        <Card className="border border-dashed border-slate-300 shadow-none">
          <CardContent className="p-12 text-center">
            <FiBarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Analytics insights will appear here</p>
            <p className="text-xs text-slate-400 mt-1">Enter your metrics and click Analyze Performance.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ---- Brand Voice View ----
function BrandVoiceView({ brandVoice, setBrandVoice }: { brandVoice: string; setBrandVoice: (v: string) => void }) {
  const [localVoice, setLocalVoice] = useState(brandVoice)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalVoice(brandVoice)
  }, [brandVoice])

  const handleSave = () => {
    setBrandVoice(localVoice)
    try {
      localStorage.setItem('founderpost_brand_voice', localVoice)
    } catch {
      // localStorage might be unavailable
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Brand Voice</h2>
        <p className="text-slate-500 mt-1">Define your unique writing style so every generated post sounds authentically you.</p>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><FiUser className="w-4 h-4 text-violet-600" /> Your Brand Voice Guide</CardTitle>
          <CardDescription className="text-xs">This will be automatically used when generating content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your brand voice in detail. For example:

- Tone: Conversational, confident but not arrogant, slightly humorous
- Vocabulary: Simple, jargon-free, use founder/startup language
- Perspective: First person, personal experiences, data-backed claims
- Values: Transparency, building in public, helping other founders
- Avoid: Corporate speak, buzzwords, overly salesy language
- Examples: 'I share the unfiltered truth about startup life, including the failures'"
            className="min-h-[240px] border-slate-300 text-sm"
            value={localVoice}
            onChange={(e) => setLocalVoice(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <FiSave className="w-4 h-4" /> Save Brand Voice
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <FiCheck className="w-4 h-4" /> Saved successfully
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><FiInfo className="w-4 h-4 text-slate-400" /> Tips for a Great Brand Voice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: 'Be Specific', desc: 'Instead of "professional", say "like explaining to a smart friend over coffee".' },
              { title: 'Include Examples', desc: 'Add phrases or sentences that represent your ideal tone.' },
              { title: 'Define Boundaries', desc: 'List things you want to avoid (e.g., no buzzwords, no aggressive CTAs).' },
              { title: 'Show Your Values', desc: 'What do you stand for? Transparency? Innovation? Community?' },
              { title: 'Reference Others', desc: 'Mention creators whose style inspires you (e.g., "similar to how Paul Graham writes").' },
            ].map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">{idx + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{tip.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ======== MAIN PAGE COMPONENT ========
export default function Page() {
  const [view, setView] = useState<NavView>('dashboard')
  const [sampleData, setSampleData] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [brandVoice, setBrandVoice] = useState('')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Load brand voice from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('founderpost_brand_voice')
      if (saved) setBrandVoice(saved)
    } catch {
      // localStorage might be unavailable
    }
  }, [])

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50 font-sans">
          <SidebarNav view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

          {/* Main Content Area */}
          <div className="lg:pl-64">
            {/* Top Bar */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
              <div className="flex items-center justify-between px-4 sm:px-6 h-14">
                <div className="flex items-center gap-3">
                  <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <FiMenu className="w-5 h-5 text-slate-600" />
                  </button>
                  <h2 className="text-sm font-semibold text-slate-700 capitalize hidden sm:block">
                    {view === 'brand' ? 'Brand Voice' : view === 'create' ? 'Create Content' : view}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="sample-toggle" className="text-xs text-slate-500 cursor-pointer">Sample Data</Label>
                  <Switch id="sample-toggle" checked={sampleData} onCheckedChange={setSampleData} className="data-[state=checked]:bg-violet-600" />
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-6xl mx-auto">
                {view === 'dashboard' && <DashboardView setView={setView} sampleData={sampleData} />}
                {view === 'create' && <CreateContentView sampleData={sampleData} brandVoice={brandVoice} setView={setView} setActiveAgentId={setActiveAgentId} />}
                {view === 'hashtags' && <HashtagsView sampleData={sampleData} setActiveAgentId={setActiveAgentId} />}
                {view === 'schedule' && <ScheduleView sampleData={sampleData} setActiveAgentId={setActiveAgentId} />}
                {view === 'analytics' && <AnalyticsView sampleData={sampleData} setActiveAgentId={setActiveAgentId} />}
                {view === 'brand' && <BrandVoiceView brandVoice={brandVoice} setBrandVoice={setBrandVoice} />}

                {/* Agent Status Footer */}
                <div className="mt-8">
                  <AgentStatusBar activeAgentId={activeAgentId} />
                </div>
              </div>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  )
}
