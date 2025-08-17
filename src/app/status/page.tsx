"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  RefreshCw, 
  Database, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  Activity,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface EndpointStatus {
  name: string;
  url: string;
  status: 'checking' | 'success' | 'error';
  responseTime?: number;
  error?: string;
  description: string;
}

interface SystemStatus {
  database: {
    status: 'checking' | 'connected' | 'error';
    responseTime?: number;
    error?: string;
  };
  endpoints: EndpointStatus[];
  lastChecked?: Date;
}

export default function StatusPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: { status: 'checking' },
    endpoints: [
      {
        name: 'Admin Dashboard',
        url: '/admin',
        status: 'checking',
        description: 'Main admin interface for managing content and users'
      },
      {
        name: 'Database Studio',
        url: '/admin/database',
        status: 'checking',
        description: 'Direct database management interface'
      },
      {
        name: 'API Health',
        url: '/api/health',
        status: 'checking',
        description: 'Basic API health check endpoint'
      },
      {
        name: 'User Management API',
        url: '/api/admin/users',
        status: 'checking',
        description: 'User management operations'
      },
      {
        name: 'Content API',
        url: '/api/admin/content',
        status: 'checking',
        description: 'Content management operations'
      },
      {
        name: 'Analytics API',
        url: '/api/admin/analytics',
        status: 'checking',
        description: 'Site analytics and metrics'
      }
    ]
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkEndpoint = async (endpoint: EndpointStatus): Promise<EndpointStatus> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache'
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          ...endpoint,
          status: 'success',
          responseTime,
          error: undefined
        };
      } else {
        return {
          ...endpoint,
          status: 'error',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        ...endpoint,
        status: 'error',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkDatabase = async () => {
    const startTime = Date.now();
    
    try {
      // Simulate database check - in real app this would be an API call
      const response = await fetch('/api/db/status', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          status: 'connected' as const,
          responseTime,
          error: undefined
        };
      } else {
        return {
          status: 'error' as const,
          responseTime,
          error: `Database connection failed: HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'error' as const,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  };

  const runSystemCheck = async () => {
    setIsRefreshing(true);
    
    // Reset all statuses to checking
    setSystemStatus(prev => ({
      ...prev,
      database: { status: 'checking' },
      endpoints: prev.endpoints.map(endpoint => ({
        ...endpoint,
        status: 'checking' as const,
        responseTime: undefined,
        error: undefined
      }))
    }));

    // Check database
    const dbStatus = await checkDatabase();
    setSystemStatus(prev => ({
      ...prev,
      database: dbStatus
    }));

    // Check all endpoints
    const endpointPromises = systemStatus.endpoints.map(checkEndpoint);
    const endpointResults = await Promise.all(endpointPromises);
    
    setSystemStatus(prev => ({
      ...prev,
      endpoints: endpointResults,
      lastChecked: new Date()
    }));

    setIsRefreshing(false);
  };

  useEffect(() => {
    runSystemCheck();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'success':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'success':
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>;
      case 'error':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const workingEndpoints = systemStatus.endpoints.filter(e => e.status === 'success');
  const failingEndpoints = systemStatus.endpoints.filter(e => e.status === 'error');
  const overallHealth = systemStatus.database.status === 'connected' && failingEndpoints.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">System Status</h1>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Monitor the health and availability of admin dashboard components
          </p>
          
          <Button 
            onClick={runSystemCheck} 
            disabled={isRefreshing}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking...' : 'Refresh Status'}
          </Button>
          
          {systemStatus.lastChecked && (
            <p className="text-sm text-gray-500 mt-2">
              Last checked: {systemStatus.lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Overall Health Alert */}
        <Alert className={`mb-8 ${overallHealth ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-2">
            {overallHealth ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <AlertDescription className={overallHealth ? 'text-green-800' : 'text-red-800'}>
              {overallHealth 
                ? 'All systems operational - Admin dashboard is fully functional'
                : `${failingEndpoints.length} service(s) experiencing issues`
              }
            </AlertDescription>
          </div>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Database Status */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.database.status)}
                    <span className="font-medium">Connection Status</span>
                  </div>
                  {getStatusBadge(systemStatus.database.status)}
                </div>
                
                {systemStatus.database.responseTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Zap className="h-4 w-4" />
                    Response time: {systemStatus.database.responseTime}ms
                  </div>
                )}
                
                {systemStatus.database.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">Error:</p>
                    <p className="text-sm text-red-700">{systemStatus.database.error}</p>
                  </div>
                )}
                
                {systemStatus.database.status === 'connected' && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Database is connected and responsive
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* API Endpoints */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemStatus.endpoints.map((endpoint, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(endpoint.status)}
                          <span className="font-medium">{endpoint.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {endpoint.responseTime && (
                            <span className="text-sm text-gray-500">
                              {endpoint.responseTime}ms
                            </span>
                          )}
                          {getStatusBadge(endpoint.status)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {endpoint.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <code className="bg-gray-100 px-2 py-1 rounded">{endpoint.url}</code>
                        {endpoint.status === 'success' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-6 px-2"
                          >
                            <a href={endpoint.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      {endpoint.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {endpoint.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Working Services */}
        {workingEndpoints.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Working Services ({workingEndpoints.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {workingEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <span className="font-medium text-green-800">{endpoint.name}</span>
                      <div className="text-sm text-green-600">
                        Response: {endpoint.responseTime}ms
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-green-700 hover:text-green-800"
                    >
                      <a href={endpoint.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting */}
        {failingEndpoints.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Troubleshooting Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Quick Fixes:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Check if the development server is running</li>
                    <li>• Verify database connection settings</li>
                    <li>• Clear browser cache and cookies</li>
                    <li>• Check for recent code changes that might affect routing</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Alternative Access:</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    If some services are down, try accessing working components directly:
                  </p>
                  <div className="space-y-2">
                    {workingEndpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8"
                        >
                          <a href={endpoint.url} target="_blank" rel="noopener noreferrer">
                            Access {endpoint.name}
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}