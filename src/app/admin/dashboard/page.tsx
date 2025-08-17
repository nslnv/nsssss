"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle, 
  Archive, 
  Plus,
  Settings,
  LogOut,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
  });
  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/admin";
      return;
    }
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

const STATUS_COLORS = {
  new: "#FC4B08",
  read: "#FF8C42", 
  in_progress: "#7B8F60",
  closed: "#28a745",
  archived: "#6E645B"
};

export default function AdminDashboard() {
  const [dateFilter, setDateFilter] = useState("7d");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("dashboard");

  const { data: leadsData, error, mutate } = useSWR(
    `/api/admin/leads?pageSize=10&sort=createdAt&order=desc`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true
    }
  );

  const isLoading = !leadsData && !error;

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      mutate();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/admin';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/admin';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      new: "bg-[#FC4B08] text-white",
      read: "bg-[#FF8C42] text-white",
      in_progress: "bg-[#7B8F60] text-white", 
      closed: "bg-green-600 text-white",
      archived: "bg-[#6E645B] text-white"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Calculate metrics from leads data
  const metrics = useMemo(() => {
    if (!leadsData?.leads) return { newToday: 0, inProgress: 0, closed: 0, archived: 0 };
    
    const today = new Date().toDateString();
    const leads = leadsData.leads;
    
    return {
      newToday: leads.filter((lead: any) => 
        lead.status === 'new' && new Date(lead.createdAt).toDateString() === today
      ).length,
      inProgress: leads.filter((lead: any) => lead.status === 'in_progress').length,
      closed: leads.filter((lead: any) => lead.status === 'closed').length,
      archived: leads.filter((lead: any) => lead.status === 'archived').length,
    };
  }, [leadsData]);

  // Mock chart data
  const chartData = [
    { date: '22.12', count: 4 },
    { date: '23.12', count: 7 },
    { date: '24.12', count: 3 },
    { date: '25.12', count: 8 },
    { date: '26.12', count: 5 },
    { date: '27.12', count: 6 },
    { date: '28.12', count: 9 },
  ];

  const statusData = [
    { name: 'Новые', value: metrics.newToday, color: '#FC4B08' },
    { name: 'В работе', value: metrics.inProgress, color: '#7B8F60' },
    { name: 'Закрыто', value: metrics.closed, color: '#28a745' },
    { name: 'Архив', value: metrics.archived, color: '#6E645B' },
  ];

  const renderSidebar = () => (
    <div className="w-64 bg-[#0A0A0A] border-r border-[#303030] h-screen flex flex-col">
      <div className="p-6 border-b border-[#303030]">
        <h2 className="text-xl font-bold text-[#FC4B08]">NSLNV Admin</h2>
        <p className="text-sm text-[#A0A0A0] mt-1">Панель управления</p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Button
            variant={activeSection === "dashboard" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeSection === "dashboard" 
                ? "bg-[#FC4B08] text-white" 
                : "text-[#A0A0A0] hover:text-white hover:bg-[#303030]"
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            <BarChart3 className="mr-3 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-[#A0A0A0] hover:text-white hover:bg-[#303030]"
            onClick={() => window.location.href = '/admin/leads'}
          >
            <Users className="mr-3 h-4 w-4" />
            Leads
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-[#A0A0A0] hover:text-white hover:bg-[#303030]"
            disabled
          >
            <Settings className="mr-3 h-4 w-4" />
            Настройки
          </Button>
        </div>
      </nav>

      <div className="p-4 border-t border-[#303030]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#FC4B08] rounded-full flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div>
            <p className="text-white text-sm font-medium">Admin</p>
            <p className="text-[#A0A0A0] text-xs">Администратор</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-[#A0A0A0] hover:text-white hover:bg-[#303030]"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Выход
        </Button>
      </div>
    </div>
  );

  const renderMetricCards = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-[#0A0A0A] border-[#303030]">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2 bg-[#303030]" />
                <Skeleton className="h-8 w-16 bg-[#303030]" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#0A0A0A] border-[#303030] col-span-full">
            <CardContent className="p-6 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-[#FC4B08] mx-auto mb-2" />
                <p className="text-[#A0A0A0]">Ошибка загрузки данных</p>
                <Button
                  onClick={() => mutate()}
                  className="mt-2 bg-[#FC4B08] hover:bg-[#E03E06]"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Повторить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const metricCards = [
      {
        title: "Новые сегодня",
        value: metrics.newToday,
        icon: Plus,
        color: "#FC4B08",
        trend: "+12%"
      },
      {
        title: "В работе", 
        value: metrics.inProgress,
        icon: Clock,
        color: "#FF8C42",
        trend: "+5%"
      },
      {
        title: "Закрыто",
        value: metrics.closed,
        icon: CheckCircle,
        color: "#28a745",
        trend: "+8%"
      },
      {
        title: "Архив",
        value: metrics.archived,
        icon: Archive,
        color: "#6E645B",
        trend: "0%"
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card 
              key={index} 
              className="bg-[#0A0A0A] border-[#303030] hover:border-[#FC4B08] transition-all duration-200 cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#A0A0A0] text-sm font-medium">{metric.title}</p>
                    <p className="text-2xl font-bold text-white mt-2">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-3 w-3 text-[#7B8F60] mr-1" />
                      <span className="text-xs text-[#7B8F60]">{metric.trend}</span>
                    </div>
                  </div>
                  <div 
                    className="p-3 rounded-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${metric.color}20` }}
                  >
                    <IconComponent 
                      className="h-6 w-6" 
                      style={{ color: metric.color }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 mb-6">
      <Select value={dateFilter} onValueChange={setDateFilter}>
        <SelectTrigger className="w-[180px] bg-[#0A0A0A] border-[#303030] text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#0A0A0A] border-[#303030]">
          <SelectItem value="1d" className="text-white hover:bg-[#303030]">Сегодня</SelectItem>
          <SelectItem value="7d" className="text-white hover:bg-[#303030]">7 дней</SelectItem>
          <SelectItem value="30d" className="text-white hover:bg-[#303030]">30 дней</SelectItem>
          <SelectItem value="90d" className="text-white hover:bg-[#303030]">90 дней</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px] bg-[#0A0A0A] border-[#303030] text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#0A0A0A] border-[#303030]">
          <SelectItem value="all" className="text-white hover:bg-[#303030]">Все статусы</SelectItem>
          <SelectItem value="new" className="text-white hover:bg-[#303030]">Новые</SelectItem>
          <SelectItem value="in_progress" className="text-white hover:bg-[#303030]">В работе</SelectItem>
          <SelectItem value="closed" className="text-white hover:bg-[#303030]">Закрыто</SelectItem>
          <SelectItem value="archived" className="text-white hover:bg-[#303030]">Архив</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={() => mutate()}
        className="bg-[#303030] hover:bg-[#404040] text-white border-[#303030]"
        size="sm"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Обновить
      </Button>
    </div>
  );

  const renderCharts = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#0A0A0A] border-[#303030]">
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-[#303030]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full bg-[#303030]" />
            </CardContent>
          </Card>
          <Card className="bg-[#0A0A0A] border-[#303030]">
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-[#303030]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full bg-[#303030]" />
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-[#0A0A0A] border-[#303030]">
          <CardHeader>
            <CardTitle className="text-white">Leads за период</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303030" />
                <XAxis dataKey="date" stroke="#A0A0A0" />
                <YAxis stroke="#A0A0A0" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0A0A0A", 
                    border: "1px solid #303030",
                    color: "#E0E0E0"
                  }} 
                />
                <Bar dataKey="count" fill="#FC4B08" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#0A0A0A] border-[#303030]">
          <CardHeader>
            <CardTitle className="text-white">Распределение по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0A0A0A", 
                    border: "1px solid #303030",
                    color: "#E0E0E0"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRecentLeads = () => {
    if (isLoading) {
      return (
        <Card className="bg-[#0A0A0A] border-[#303030]">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-[#303030]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32 bg-[#303030]" />
                  <Skeleton className="h-6 w-20 bg-[#303030]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    const recentLeads = leadsData?.leads?.slice(0, 10) || [];

    return (
      <Card className="bg-[#0A0A0A] border-[#303030]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Последние обращения</CardTitle>
          <Button 
            size="sm" 
            className="bg-[#FC4B08] hover:bg-[#E03E06] text-white"
            onClick={() => window.location.href = '/admin/leads'}
          >
            <Eye className="h-4 w-4 mr-2" />
            Все leads
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#303030]">
                <TableHead className="text-[#A0A0A0]">Имя</TableHead>
                <TableHead className="text-[#A0A0A0]">Email</TableHead>
                <TableHead className="text-[#A0A0A0]">Услуга</TableHead>
                <TableHead className="text-[#A0A0A0]">Статус</TableHead>
                <TableHead className="text-[#A0A0A0]">Дата</TableHead>
                <TableHead className="text-[#A0A0A0]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLeads.map((lead: any) => (
                <TableRow key={lead.id} className="border-[#303030] hover:bg-[#1A1A1A]">
                  <TableCell className="text-white font-medium">{lead.name}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{lead.email}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{lead.workType}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(lead.status)}>
                      {lead.status === "new" ? "Новый" :
                       lead.status === "in_progress" ? "В работе" :
                       lead.status === "closed" ? "Закрыт" : 
                       lead.status === "read" ? "Прочитан" : "Архив"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#A0A0A0]">{formatDate(lead.createdAt)}</TableCell>
                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(value) => handleStatusChange(lead.id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8 bg-[#303030] border-[#404040] text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-[#303030]">
                        <SelectItem value="new" className="text-white hover:bg-[#303030]">Новый</SelectItem>
                        <SelectItem value="read" className="text-white hover:bg-[#303030]">Прочитан</SelectItem>
                        <SelectItem value="in_progress" className="text-white hover:bg-[#303030]">В работе</SelectItem>
                        <SelectItem value="closed" className="text-white hover:bg-[#303030]">Закрыт</SelectItem>
                        <SelectItem value="archived" className="text-white hover:bg-[#303030]">Архив</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {recentLeads.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[#A0A0A0]">Нет данных для отображения</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderQuickActions = () => (
    <Card className="bg-[#0A0A0A] border-[#303030]">
      <CardHeader>
        <CardTitle className="text-white">Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button 
            className="w-full bg-[#FC4B08] hover:bg-[#E03E06] text-white justify-start"
            size="sm"
            disabled
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить lead вручную
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-[#303030] text-[#A0A0A0] hover:bg-[#303030] hover:text-white justify-start"
            size="sm"
            onClick={() => window.location.href = '/admin/leads'}
          >
            <Eye className="h-4 w-4 mr-2" />
            Просмотр всех leads
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-[#303030] text-[#A0A0A0] hover:bg-[#303030] hover:text-white justify-start"
            size="sm"
            disabled
          >
            <Settings className="h-4 w-4 mr-2" />
            Настройки уведомлений
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen bg-[#1A1A1A]">
      {renderSidebar()}
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-[#A0A0A0]">Обзор активности и статистики</p>
          </div>

          {renderFilters()}
          {renderMetricCards()}
          {renderCharts()}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {renderRecentLeads()}
            </div>
            <div>
              {renderQuickActions()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}