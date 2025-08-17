"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  FileText,
  Loader2,
  BarChart3,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import useSWR from 'swr';

interface Lead {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  workType: string;
  deadline: string;
  budget: string;
  status: 'new' | 'read' | 'in_progress' | 'closed' | 'archived';
  source: string;
  description: string;
}

interface LeadsResponse {
  ok: boolean;
  leads: Lead[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const statusConfig = {
  new: { label: 'Новая', color: 'bg-blue-500' },
  read: { label: 'Прочитана', color: 'bg-yellow-500' },
  in_progress: { label: 'В работе', color: 'bg-purple-500' },
  closed: { label: 'Закрыта', color: 'bg-green-500' },
  archived: { label: 'Архив', color: 'bg-gray-500' }
};

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

export default function LeadsManagementPage() {
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    sort: sortBy,
    order: sortOrder,
    ...(search && { search }),
    ...(status && status !== 'all' && { status }),
  });

  const { data, error, isLoading, mutate } = useSWR<LeadsResponse>(
    `/api/admin/leads?${queryParams.toString()}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true
    }
  );

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleSelectAll = () => {
    if (!data?.leads) return;
    
    if (selectedLeads.length === data.leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(data.leads.map(lead => lead.id));
    }
  };

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleUpdateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        mutate();
        toast.success('Статус обновлен');
      } else {
        toast.error('Ошибка обновления статуса');
      }
    } catch (error) {
      console.error('Failed to update lead status:', error);
      toast.error('Ошибка сети');
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setShowDeleteConfirm(null);
        mutate();
        toast.success('Lead удален');
      } else {
        toast.error('Ошибка удаления');
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error('Ошибка сети');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          action: 'bulk_delete',
          ids: selectedLeads 
        })
      });
      
      if (response.ok) {
        setSelectedLeads([]);
        setShowBulkDelete(false);
        mutate();
        toast.success('Leads удалены');
      } else {
        toast.error('Ошибка удаления');
      }
    } catch (error) {
      console.error('Failed to bulk delete leads:', error);
      toast.error('Ошибка сети');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'export_csv' })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Данные экспортированы');
      } else {
        toast.error('Ошибка экспорта');
      }
    } catch (error) {
      console.error('Failed to export leads:', error);
      toast.error('Ошибка сети');
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

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSidebar = () => (
    <div className="w-64 bg-[#0A0A0A] border-r border-[#303030] h-screen flex flex-col">
      <div className="p-6 border-b border-[#303030]">
        <h2 className="text-xl font-bold text-[#FC4B08]">NSLNV Admin</h2>
        <p className="text-sm text-[#A0A0A0] mt-1">Панель управления</p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-[#A0A0A0] hover:text-white hover:bg-[#303030]"
            onClick={() => window.location.href = '/admin/dashboard'}
          >
            <BarChart3 className="mr-3 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant="default"
            className="w-full justify-start bg-[#FC4B08] text-white"
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

  if (error) {
    return (
      <div className="flex h-screen bg-[#1A1A1A]">
        {renderSidebar()}
        <div className="flex-1 p-6">
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="pt-6">
              <div className="text-red-400 text-center">
                <p>Ошибка загрузки данных</p>
                <Button 
                  onClick={() => mutate()} 
                  variant="outline" 
                  className="mt-4 border-red-700 text-red-400 hover:bg-red-900/30"
                >
                  Повторить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1A1A1A] text-white">
      {renderSidebar()}
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Управление Leads</h1>
              <p className="text-[#A0A0A0]">
                {data ? `${data.pagination.total} всего leads` : 'Загрузка...'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="border-[#303030] text-[#A0A0A0] hover:bg-[#303030] hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Экспорт CSV
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="bg-[#0A0A0A] border-[#303030]">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
                    <Input
                      placeholder="Поиск leads..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10 bg-[#1A1A1A] border-[#303030] text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select
                    value={status}
                    onValueChange={(value) => {
                      setStatus(value === 'all' ? '' : value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[180px] bg-[#1A1A1A] border-[#303030] text-white">
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#303030]">
                      <SelectItem value="all" className="text-white hover:bg-[#303030]">Все статусы</SelectItem>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key} className="text-white hover:bg-[#303030]">
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setStatus('all');
                      setPage(1);
                    }}
                    className="border-[#303030] text-[#A0A0A0] hover:bg-[#303030] hover:text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Очистить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <Card className="bg-blue-900/20 border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300">
                    {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} выбрано
                  </span>
                  
                  <Button
                    variant="destructive"
                    onClick={() => setShowBulkDelete(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить выбранные
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Table */}
          <Card className="bg-[#0A0A0A] border-[#303030]">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FC4B08]" />
                </div>
              ) : (
                <>
                  <div className="rounded-md border border-[#303030] overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#303030] hover:bg-[#1A1A1A]">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedLeads.length === data?.leads?.length && data?.leads?.length > 0}
                              onCheckedChange={handleSelectAll}
                              className="border-[#606060] data-[state=checked]:bg-[#FC4B08] data-[state=checked]:border-[#FC4B08]"
                            />
                          </TableHead>
                          
                          <TableHead 
                            className="cursor-pointer hover:bg-[#1A1A1A] text-[#A0A0A0]"
                            onClick={() => handleSort('id')}
                          >
                            <div className="flex items-center gap-2">
                              ID
                              {getSortIcon('id')}
                            </div>
                          </TableHead>
                          
                          <TableHead 
                            className="cursor-pointer hover:bg-[#1A1A1A] text-[#A0A0A0]"
                            onClick={() => handleSort('createdAt')}
                          >
                            <div className="flex items-center gap-2">
                              Дата
                              {getSortIcon('createdAt')}
                            </div>
                          </TableHead>
                          
                          <TableHead 
                            className="cursor-pointer hover:bg-[#1A1A1A] text-[#A0A0A0]"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center gap-2">
                              Имя
                              {getSortIcon('name')}
                            </div>
                          </TableHead>
                          
                          <TableHead className="text-[#A0A0A0]">Email</TableHead>
                          <TableHead className="text-[#A0A0A0]">Телефон</TableHead>
                          <TableHead className="text-[#A0A0A0]">Тип работы</TableHead>
                          <TableHead className="text-[#A0A0A0]">Бюджет</TableHead>
                          <TableHead className="text-[#A0A0A0]">Статус</TableHead>
                          <TableHead className="text-[#A0A0A0]">Источник</TableHead>
                          <TableHead className="text-[#A0A0A0] w-12">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      
                      <TableBody>
                        {data?.leads?.map((lead) => (
                          <TableRow 
                            key={lead.id} 
                            className="border-[#303030] hover:bg-[#1A1A1A]"
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedLeads.includes(lead.id)}
                                onCheckedChange={() => handleSelectLead(lead.id)}
                                className="border-[#606060] data-[state=checked]:bg-[#FC4B08] data-[state=checked]:border-[#FC4B08]"
                              />
                            </TableCell>
                            
                            <TableCell className="font-mono text-[#A0A0A0]">
                              #{lead.id}
                            </TableCell>
                            
                            <TableCell className="text-[#A0A0A0]">
                              {formatDate(lead.createdAt)}
                            </TableCell>
                            
                            <TableCell className="font-medium text-white">
                              {lead.name}
                            </TableCell>
                            
                            <TableCell className="text-[#A0A0A0]">
                              {lead.email}
                            </TableCell>
                            
                            <TableCell className="text-[#A0A0A0]">
                              {lead.phone || '-'}
                            </TableCell>
                            
                            <TableCell className="text-[#A0A0A0]">
                              {lead.workType}
                            </TableCell>
                            
                            <TableCell className="text-[#A0A0A0]">
                              {lead.budget || '-'}
                            </TableCell>
                            
                            <TableCell>
                              <Select
                                value={lead.status}
                                onValueChange={(value) => handleUpdateLeadStatus(lead.id, value)}
                              >
                                <SelectTrigger className="w-32 bg-transparent border-none p-0 h-auto">
                                  <Badge 
                                    className={`${statusConfig[lead.status].color} text-white border-none cursor-pointer`}
                                  >
                                    {statusConfig[lead.status].label}
                                  </Badge>
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#303030]">
                                  {Object.entries(statusConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key} className="text-white hover:bg-[#303030]">
                                      <Badge className={`${config.color} text-white border-none`}>
                                        {config.label}
                                      </Badge>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            
                            <TableCell className="text-[#A0A0A0]">
                              {lead.source || '-'}
                            </TableCell>
                            
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-white hover:bg-[#303030]"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[#1A1A1A] border-[#303030]">
                                  <DropdownMenuSeparator className="bg-[#303030]" />
                                  <DropdownMenuItem 
                                    onClick={() => setShowDeleteConfirm(lead.id)}
                                    className="text-red-400 hover:bg-red-900/30"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Удалить
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {data && data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2 text-[#A0A0A0]">
                        <span>Строк на странице:</span>
                        <Select
                          value={pageSize.toString()}
                          onValueChange={(value) => {
                            setPageSize(parseInt(value));
                            setPage(1);
                          }}
                        >
                          <SelectTrigger className="w-20 bg-[#1A1A1A] border-[#303030] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1A] border-[#303030]">
                            <SelectItem value="20" className="text-white hover:bg-[#303030]">20</SelectItem>
                            <SelectItem value="50" className="text-white hover:bg-[#303030]">50</SelectItem>
                            <SelectItem value="100" className="text-white hover:bg-[#303030]">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-[#A0A0A0]">
                          Страница {data.pagination.page} из {data.pagination.totalPages} ({data.pagination.total} всего)
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={!data.pagination.hasPrev}
                            className="border-[#303030] text-[#A0A0A0] hover:bg-[#303030] hover:text-white"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={!data.pagination.hasNext}
                            className="border-[#303030] text-[#A0A0A0] hover:bg-[#303030] hover:text-white"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
            <DialogContent className="bg-[#1A1A1A] border-[#303030] text-white">
              <DialogHeader>
                <DialogTitle>Удалить Lead</DialogTitle>
                <DialogDescription className="text-[#A0A0A0]">
                  Вы уверены, что хотите удалить этот lead? Это действие нельзя отменить.
                </DialogDescription>
              </DialogHeader>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="border-[#303030] text-[#A0A0A0] hover:bg-[#303030] hover:text-white"
                >
                  Отмена
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => showDeleteConfirm && handleDeleteLead(showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Удалить Lead
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk Delete Confirmation Dialog */}
          <Dialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
            <DialogContent className="bg-[#1A1A1A] border-[#303030] text-white">
              <DialogHeader>
                <DialogTitle>Удалить выбранные Leads</DialogTitle>
                <DialogDescription className="text-[#A0A0A0]">
                  Вы уверены, что хотите удалить {selectedLeads.length} выбранных leads? Это действие нельзя отменить.
                </DialogDescription>
              </DialogHeader>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkDelete(false)}
                  className="border-[#303030] text-[#A0A0A0] hover:bg-[#303030] hover:text-white"
                >
                  Отмена
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Удалить {selectedLeads.length} Leads
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}