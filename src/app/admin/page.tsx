"use client";

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { 
  Bell, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Filter, 
  Search, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Settings,
  MessageSquare,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Plus,
  Download,
  RefreshCw,
  LogOut,
  Home,
  PersonStanding
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Lead {
  id: number
  name: string
  email: string
  phone?: string
  workType: string
  deadline?: string
  budget?: string
  description: string
  source?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface AdminStats {
  totalLeads: number
  activeLeads: number
  closedLeads: number
  totalRevenue: number
  monthlyRevenue: number
  averageRevenue: number
  completionRate: number
  growthRate: number
}

const statusColors = {
  "new": "bg-blue-100 text-blue-700 border-blue-200",
  "read": "bg-purple-100 text-purple-700 border-purple-200",
  "in_progress": "bg-yellow-100 text-yellow-700 border-yellow-200", 
  "closed": "bg-green-100 text-green-700 border-green-200",
  "archived": "bg-red-100 text-red-700 border-red-200"
}

const statusNames = {
  "new": "Новый",
  "read": "Прочитан",
  "in_progress": "В работе",
  "closed": "Завершен",
  "archived": "Архив"
}

const statusIcons = {
  "new": AlertCircle,
  "read": Eye,
  "in_progress": Clock,
  "closed": CheckCircle,
  "archived": XCircle
}

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [leadFilter, setLeadFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalLeads: 0,
    activeLeads: 0,
    closedLeads: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageRevenue: 0,
    completionRate: 0,
    growthRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [notificationSettings, setNotificationSettings] = useState({
    newLeads: true,
    statusUpdates: false,
    deadlineReminders: true,
    paymentAlerts: true
  })

  // Load leads and stats
  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load leads
      const leadsResponse = await fetch('/api/admin/leads')
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json()
        setLeads(leadsData.leads || [])
        
        // Calculate stats from leads
        const totalLeads = leadsData.leads?.length || 0
        const activeLeads = leadsData.leads?.filter((l: Lead) => 
          l.status === 'new' || l.status === 'read' || l.status === 'in_progress'
        ).length || 0
        const closedLeads = leadsData.leads?.filter((l: Lead) => l.status === 'closed').length || 0
        
        // Calculate revenue (estimate based on work type)
        const revenueMap: {[key: string]: number} = {
          'coursework': 15000,
          'thesis': 35000,
          'essay': 8000,
          'report': 5000,
          'other': 10000
        }
        
        const totalRevenue = leadsData.leads?.reduce((sum: number, lead: Lead) => {
          if (lead.status === 'closed') {
            return sum + (revenueMap[lead.workType] || 10000)
          }
          return sum
        }, 0) || 0

        const currentMonth = new Date().getMonth()
        const monthlyRevenue = leadsData.leads?.reduce((sum: number, lead: Lead) => {
          const leadMonth = new Date(lead.createdAt).getMonth()
          if (lead.status === 'closed' && leadMonth === currentMonth) {
            return sum + (revenueMap[lead.workType] || 10000)
          }
          return sum
        }, 0) || 0

        setStats({
          totalLeads,
          activeLeads,
          closedLeads,
          totalRevenue,
          monthlyRevenue,
          averageRevenue: closedLeads > 0 ? Math.round(totalRevenue / closedLeads) : 0,
          completionRate: totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0,
          growthRate: 12 // Mock growth rate
        })
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesFilter = leadFilter === "all" || lead.status === leadFilter
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.workType.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Статус обновлен')
        loadData() // Reload data
      } else {
        toast.error('Ошибка обновления статуса')
      }
    } catch (error) {
      toast.error('Ошибка обновления статуса')
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value }
    setNotificationSettings(newSettings)
    toast.success('Настройки сохранены')
  }

  const handleLeadClick = (leadId: number) => {
    window.open(`/admin/leads?id=${leadId}`, '_blank')
  }

  const handleRefresh = () => {
    loadData()
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <PersonStanding className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">NSLNV Admin</h1>
              <p className="text-sm text-stone-600">Панель управления заказами</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                На главную
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="bg-white border-b border-stone-200">
          <div className="px-6">
            <TabsList className="bg-transparent border-none p-0 h-auto">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent px-6 py-4"
              >
                Обзор
              </TabsTrigger>
              <TabsTrigger 
                value="leads" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent px-6 py-4"
              >
                Заказы
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent px-6 py-4"
              >
                Статистика
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent px-6 py-4"
              >
                Настройки
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="p-6 space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white border-stone-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600">Всего заказов</p>
                    <p className="text-2xl font-bold text-stone-900">{stats.totalLeads}</p>
                    <p className="text-xs text-stone-500">+0.0% к прошлому месяцу</p>
                  </div>
                  <FileText className="w-8 h-8 text-stone-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-stone-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600">Активные заказы</p>
                    <p className="text-2xl font-bold text-stone-900">{stats.activeLeads}</p>
                    <p className="text-xs text-stone-500">0.0% коэффициент завершения</p>
                  </div>
                  <Clock className="w-8 h-8 text-stone-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-stone-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600">Общая выручка</p>
                    <p className="text-2xl font-bold text-stone-900">₽{stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-stone-500">+0.0% к прошлому месяцу</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-stone-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-stone-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600">Уникальные клиенты</p>
                    <p className="text-2xl font-bold text-stone-900">{leads.length > 0 ? new Set(leads.map(l => l.email)).size : 0}</p>
                    <p className="text-xs text-stone-500">{leads.length > 0 ? (leads.length / new Set(leads.map(l => l.email)).size).toFixed(1) : '0.0'} заказа на клиента</p>
                  </div>
                  <Users className="w-8 h-8 text-stone-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Effectiveness */}
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-stone-900">Эффективность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-stone-600">Среднее время выполнения</span>
                  <span className="font-medium">0.0 дней</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">В срок</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Средний чек</span>
                  <span className="font-medium">₽{stats.averageRevenue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Client Base */}
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-stone-900">Клиентская база</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-stone-600">Высокодоходные</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Среднедоходные</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Низкодоходные</span>
                  <span className="font-medium">0</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Work Types */}
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-stone-900">Топ типы работ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    leads.reduce((acc, lead) => {
                      acc[lead.workType] = (acc[lead.workType] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-stone-600 capitalize">{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="bg-white border-stone-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-stone-900">Последние заказы</CardTitle>
              <CardDescription className="text-stone-600">
                Недавно поступившие и обновленные заказы
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  Заказы не найдены
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.slice(0, 5).map((lead) => {
                    const StatusIcon = statusIcons[lead.status as keyof typeof statusIcons]
                    return (
                      <div 
                        key={lead.id} 
                        className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer"
                        onClick={() => handleLeadClick(lead.id)}
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon className="w-4 h-4 text-stone-400" />
                          <div>
                            <p className="font-medium text-stone-900">{lead.name}</p>
                            <p className="text-sm text-stone-600">{lead.workType}</p>
                          </div>
                        </div>
                        <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                          {statusNames[lead.status as keyof typeof statusNames]}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Management Tab */}
        <TabsContent value="leads" className="p-6 space-y-6">
          <Card className="bg-white border-stone-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-stone-900">Управление заказами</CardTitle>
                  <CardDescription className="text-stone-600">
                    Всего найдено: {filteredLeads.length} заказов
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-stone-200">
                    <Download className="w-4 h-4 mr-2" />
                    Экспорт
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск заказов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-stone-50 border-stone-200"
                  />
                </div>
                <Select value={leadFilter} onValueChange={setLeadFilter}>
                  <SelectTrigger className="w-48 bg-stone-50 border-stone-200">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-stone-200">
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="new">Новые</SelectItem>
                    <SelectItem value="read">Прочитанные</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="closed">Завершенные</SelectItem>
                    <SelectItem value="archived">Архивные</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orders Table */}
              <div className="rounded-lg border border-stone-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-stone-50">
                      <TableHead className="text-stone-900 font-medium">Клиент</TableHead>
                      <TableHead className="text-stone-900 font-medium">Email</TableHead>
                      <TableHead className="text-stone-900 font-medium">Тип работы</TableHead>
                      <TableHead className="text-stone-900 font-medium">Статус</TableHead>
                      <TableHead className="text-stone-900 font-medium">Дата создания</TableHead>
                      <TableHead className="text-stone-900 font-medium">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Загрузка...
                        </TableCell>
                      </TableRow>
                    ) : filteredLeads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-stone-500">
                          Заказы не найдены
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLeads.map((lead) => {
                        const StatusIcon = statusIcons[lead.status as keyof typeof statusIcons]
                        return (
                          <TableRow 
                            key={lead.id} 
                            className="hover:bg-stone-50 cursor-pointer"
                            onClick={() => handleLeadClick(lead.id)}
                          >
                            <TableCell className="text-stone-900 font-medium">
                              {lead.name}
                            </TableCell>
                            <TableCell className="text-stone-600">
                              {lead.email}
                            </TableCell>
                            <TableCell className="text-stone-600 capitalize">
                              {lead.workType}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusNames[lead.status as keyof typeof statusNames]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-stone-600">
                              {new Date(lead.createdAt).toLocaleDateString('ru-RU')}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white border-stone-200">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    handleLeadClick(lead.id)
                                  }}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Просмотр
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(lead.id, "in_progress")
                                  }}>
                                    <Clock className="w-4 h-4 mr-2" />
                                    В работе
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(lead.id, "closed")
                                  }}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Завершить
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue and Orders */}
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Выручка и заказы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-stone-600">Общая выручка</p>
                    <p className="text-2xl font-bold text-stone-900">₽{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600">Всего заказов</p>
                    <p className="text-xl font-bold text-stone-900">{stats.totalLeads}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600">Средний чек</p>
                    <p className="text-xl font-bold text-stone-900">₽{stats.averageRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Indicators */}
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Рост показателей
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Рост выручки</span>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">+0.0%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Рост заказов</span>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">+0.0%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Коэффициент завершения</span>
                    <span className="font-medium">{stats.completionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Clients */}
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Топ клиенты
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    leads.reduce((acc, lead) => {
                      acc[lead.email] = (acc[lead.email] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([email, count]) => (
                      <div key={email} className="flex justify-between items-center">
                        <span className="text-stone-600 text-sm truncate">{email}</span>
                        <span className="font-medium">{count} заказ{count > 1 ? 'а' : ''}</span>
                      </div>
                    ))
                  }
                  {leads.length === 0 && (
                    <p className="text-stone-500 text-sm">Нет данных</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-900 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Производительность
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Время выполнения</span>
                    <span className="font-medium">0.0 дн.</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Доставка в срок</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Заказов/месяц</span>
                    <span className="font-medium">{stats.monthlyRevenue > 0 ? Math.round(stats.monthlyRevenue / 10000) : 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-900">По статусам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    leads.reduce((acc, lead) => {
                      acc[lead.status] = (acc[lead.status] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          status === 'new' ? 'bg-blue-500' :
                          status === 'in_progress' ? 'bg-yellow-500' :
                          status === 'closed' ? 'bg-green-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-stone-600">{statusNames[status as keyof typeof statusNames]}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <p className="text-stone-500 text-sm">Нет данных</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-900">По типам работ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    leads.reduce((acc, lead) => {
                      acc[lead.workType] = (acc[lead.workType] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-stone-600 capitalize">{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))
                  }
                  {leads.length === 0 && (
                    <p className="text-stone-500 text-sm">Нет данных</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="p-6 space-y-6">
          <Card className="bg-white border-stone-200">
            <CardHeader>
              <CardTitle className="text-stone-900 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Настройки уведомлений
              </CardTitle>
              <CardDescription className="text-stone-600">
                Настройте, какие уведомления получать
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-stone-900 font-medium">Новые заказы</Label>
                  <p className="text-sm text-stone-600">
                    Уведомления о новых поступивших заказах
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.newLeads}
                  onCheckedChange={(checked) => handleNotificationChange('newLeads', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-stone-900 font-medium">Изменения статуса</Label>
                  <p className="text-sm text-stone-600">
                    Уведомления при изменении статуса заказа
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.statusUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('statusUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-stone-900 font-medium">Напоминания о дедлайнах</Label>
                  <p className="text-sm text-stone-600">
                    Напоминания за 24 часа до дедлайна
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.deadlineReminders}
                  onCheckedChange={(checked) => handleNotificationChange('deadlineReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-stone-900 font-medium">Уведомления о платежах</Label>
                  <p className="text-sm text-stone-600">
                    Уведомления о поступивших платежах
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.paymentAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('paymentAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}