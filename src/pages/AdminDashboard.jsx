import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useSystem } from '../contexts/SystemContext';
import { 
  Users, 
  Clock, 
  Calendar, 
  Settings, 
  LogOut, 
  Power,
  Plus,
  QrCode,
  BarChart3,
  FileText,
  Shield,
  Filter,
  Download,
  Trash2
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import AIChat from '../components/AIChat';

// Helper function for API URL
const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to calculate time ago
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const recordTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - recordTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ahora mismo';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `Hace ${diffInDays}d`;
};

const AdminDashboard = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { deactivateSystem, getSessionDuration } = useSystem();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const sessionDuration = getSessionDuration();

  // Doble verificación de seguridad
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'records', label: 'Registros', icon: Clock },
    { id: 'records-summary', label: 'Resumen Fichajes', icon: FileText },
    { id: 'schedules', label: 'Horarios', icon: Calendar },
    { id: 'vacations', label: 'Vacaciones', icon: Shield },
    { id: 'weekly', label: 'Vista Semanal', icon: FileText },
    { id: 'ai-insights', label: 'IA Insights', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  const handleLogout = () => {
    signOut();
  };

  const handleDeactivateSystem = () => {
    if (confirm('¿Estás seguro de que quieres desactivar el sistema? Los empleados no podrán fichar hasta que se reactive.')) {
      deactivateSystem();
    }
  };

  return (
    <div className="flex-1 bg-neutral-light">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-mid/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Title */}
            <div className="flex items-center">
              <img 
                src="/src/Images/logo_jarana.jpg" 
                alt="Jarana Logo" 
                className="h-10 w-10 rounded-full object-cover mr-3"
              />
              <div>
                <h1 className="text-xl font-bold text-neutral-dark font-serif">
                  Jarana Admin
                </h1>
                <p className="text-sm text-brand-medium">Panel de Administración</p>
              </div>
            </div>

            {/* System Status & Controls */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-dark">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-brand-medium">
                  Sesión activa: {sessionDuration?.total || '0h 0m'}
                </p>
              </div>
              <button
                onClick={handleDeactivateSystem}
                className="inline-flex items-center px-3 py-2 border border-red-200 text-sm leading-4 font-medium rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <Power className="h-4 w-4 mr-2" />
                Desactivar Sistema
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-brand-medium hover:text-neutral-dark hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="border-b border-neutral-mid/30 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-light text-brand-light'
                      : 'border-transparent text-brand-medium hover:text-neutral-dark hover:border-brand-accent'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && <DashboardContent />}
        {activeTab === 'employees' && <EmployeesContent />}
        {activeTab === 'records' && <RecordsContent />}
        {activeTab === 'records-summary' && <RecordsSummaryContent />}
        {activeTab === 'schedules' && <SchedulesContent setActiveTab={setActiveTab} />}
        {activeTab === 'vacations' && <VacationsContent />}
        {activeTab === 'weekly' && <WeeklyViewContent />}
        {activeTab === 'ai-insights' && <AIInsightsContent />}
        {activeTab === 'settings' && <SettingsContent />}
      </div>
      
      <Footer />
      
      {/* AI Chat Component */}
      <AIChat userId={user?.id} userRole="admin" />
    </div>
  );
};

// Dashboard Content
const DashboardContent = () => {
  const [stats, setStats] = useState([
    { label: 'Total Empleados', value: '0', change: '', icon: Users, color: 'bg-blue-500' },
    { label: 'Fichajes Hoy', value: '0', change: '', icon: Clock, color: 'bg-green-500' },
    { label: 'Horas Trabajadas', value: '0h', change: '', icon: BarChart3, color: 'bg-brand-light' },
    { label: 'Empleados Activos', value: '0', change: '', icon: Shield, color: 'bg-purple-500' }
  ]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch real dashboard data
  const fetchDashboardData = async () => {
    try {
      const [employeesResponse, recordsResponse] = await Promise.all([
        fetch(`${getApiUrl()}/employees`),
        fetch(`${getApiUrl()}/records/all`)
      ]);

      let totalEmployees = 0;
      let activeEmployees = 0;
      let todayRecords = 0;
      let totalHours = 0;

      // Process employees data
      if (employeesResponse.ok) {
        const employees = await employeesResponse.json();
        totalEmployees = employees.length;
        activeEmployees = employees.filter(emp => emp.isActive).length;
      }

      // Process records data
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        const records = recordsData.records || recordsData;
        
        // Filter today's records
        const today = new Date().toDateString();
        const todayRecordsFiltered = records.filter(record => 
          new Date(record.timestamp).toDateString() === today
        );
        todayRecords = todayRecordsFiltered.length;

        // Calculate total hours (simplified calculation)
        const checkinRecords = records.filter(r => r.type === 'checkin');
        const checkoutRecords = records.filter(r => r.type === 'checkout');
        
        // Basic hours calculation (this is simplified)
        totalHours = Math.min(checkinRecords.length, checkoutRecords.length) * 8;

        // Get recent activity (last 5 records)
        const sortedRecords = records
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);
        
        setRecentActivity(sortedRecords);
      }

      // Update stats with real data
      setStats([
        { 
          label: 'Total Empleados', 
          value: totalEmployees.toString(), 
          change: totalEmployees > 0 ? `${totalEmployees} registrados` : '', 
          icon: Users, 
          color: 'bg-blue-500' 
        },
        { 
          label: 'Fichajes Hoy', 
          value: todayRecords.toString(), 
          change: todayRecords > 0 ? 'registros hoy' : 'sin registros', 
          icon: Clock, 
          color: 'bg-green-500' 
        },
        { 
          label: 'Horas Trabajadas', 
          value: `${totalHours}h`, 
          change: 'estimadas', 
          icon: BarChart3, 
          color: 'bg-brand-light' 
        },
        { 
          label: 'Empleados Activos', 
          value: activeEmployees.toString(), 
          change: `${activeEmployees}/${totalEmployees} activos`, 
          icon: Shield, 
          color: 'bg-purple-500' 
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-dark font-serif mb-6">
          Dashboard General
        </h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
                <div className="flex items-center">
                  <div className="bg-gray-200 rounded-lg p-3 animate-pulse">
                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
                  <div className="flex items-center">
                    <div className={`${stat.color} rounded-lg p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-brand-medium">{stat.label}</p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-neutral-dark">{stat.value}</p>
                        {stat.change && (
                          <p className="ml-2 text-sm font-medium text-brand-medium">{stat.change}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {loading ? (
              // Loading skeleton for activity
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-4 text-brand-medium">
                No hay actividad reciente
              </div>
            ) : (
              recentActivity.map((record, i) => {
                const timeAgo = getTimeAgo(record.timestamp);
                const employeeName = record.employee ? record.employee.name : 'Empleado desconocido';
                const actionText = record.type === 'checkin' ? 'fichó entrada' : 'fichó salida';
                const dotColor = record.type === 'checkin' ? 'bg-green-500' : 'bg-red-500';
                
                return (
                  <div key={record.id || i} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 ${dotColor} rounded-full mr-3`}></div>
                      <span className="text-sm text-neutral-dark">{employeeName} {actionText}</span>
                    </div>
                    <span className="text-xs text-brand-medium">{timeAgo}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Employees Content
const EmployeesContent = () => {
  const [employees, setEmployees] = useState([]);
  const [employeesWithRecords, setEmployeesWithRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [qrCodeData, setQRCodeData] = useState(null);

  // Cargar empleados con sus últimos registros
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/employees`);
      
      if (response.ok) {
        const employeesData = await response.json();
        setEmployees(employeesData);
        
        // Obtener último registro para cada empleado
        const employeesWithLastRecord = await Promise.all(
          employeesData.map(async (employee) => {
            try {
              const recordsResponse = await fetch(`${getApiUrl()}/records/employee/${employee.id}?limit=1`);
              if (recordsResponse.ok) {
                const records = await recordsResponse.json();
                const lastRecord = records.length > 0 ? records[0] : null;
                return {
                  ...employee,
                  lastRecord
                };
              }
              return {
                ...employee,
                lastRecord: null
              };
            } catch (error) {
              console.error(`Error fetching records for employee ${employee.id}:`, error);
              return {
                ...employee,
                lastRecord: null
              };
            }
          })
        );
        
        setEmployeesWithRecords(employeesWithLastRecord);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-dark font-serif">
          Gestión de Empleados
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Empleado
        </button>
      </div>

      {/* Create Employee Modal */}
      {showCreateForm && (
        <CreateEmployeeModal 
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchEmployees();
          }}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedEmployee && (
        <QRCodeModal
          employee={selectedEmployee}
          qrCodeData={qrCodeData}
          onClose={() => {
            setShowQRModal(false);
            setSelectedEmployee(null);
            setQRCodeData(null);
          }}
          onRegenerate={async () => {
            try {
              const response = await fetch(`${getApiUrl()}/employees/${selectedEmployee.id}/regenerate-totp`, {
                method: 'POST'
              });
              
              if (response.ok) {
                const data = await response.json();
                setQRCodeData(data);
              }
            } catch (error) {
              console.error('Error regenerating QR:', error);
            }
          }}
        />
      )}

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-mid/20">
          <thead className="bg-neutral-light">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Último Fichaje
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-mid/20">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : employeesWithRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-brand-medium">
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              employeesWithRecords.map((employee) => (
                <tr key={employee.id} className="hover:bg-neutral-light/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center">
                        <span className="text-brand-cream font-medium">
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-dark">{employee.name}</div>
                        <div className="text-sm text-brand-medium">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {employee.employeeCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-medium">
                    {employee.lastRecord ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            employee.lastRecord.type === 'checkin' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.lastRecord.type === 'checkin' ? 'Entrada' : 'Salida'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(employee.lastRecord.timestamp).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Sin registros</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setQRCodeData({ qrCode: employee.qrCodeUrl });
                        setShowQRModal(true);
                      }}
                      className="text-brand-light hover:text-brand-medium"
                      title="Ver QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">Editar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Records Content
const RecordsContent = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeName: '',
    recordType: 'all'
  });

  // Cargar registros
  const fetchRecords = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/records/all`);
      
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
        setFilteredRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = [...records];

    // Filtro por fecha de inicio
    if (filters.startDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
        return recordDate >= filters.startDate;
      });
    }

    // Filtro por fecha de fin
    if (filters.endDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
        return recordDate <= filters.endDate;
      });
    }

    // Filtro por nombre de empleado
    if (filters.employeeName) {
      filtered = filtered.filter(record => 
        record.employee?.name?.toLowerCase().includes(filters.employeeName.toLowerCase())
      );
    }

    // Filtro por tipo de registro
    if (filters.recordType !== 'all') {
      filtered = filtered.filter(record => record.type === filters.recordType);
    }

    setFilteredRecords(filtered);
  };

  React.useEffect(() => {
    fetchRecords();
  }, []);

  React.useEffect(() => {
    applyFilters();
  }, [filters, records]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-dark font-serif">
          Registros de Fichajes
        </h2>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border border-neutral-mid/30 text-neutral-dark rounded-lg hover:bg-neutral-light transition-colors ${showFilters ? 'bg-neutral-light' : ''}`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Empleado
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={filters.employeeName}
                onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Tipo de Registro
              </label>
              <select
                value={filters.recordType}
                onChange={(e) => setFilters({ ...filters, recordType: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="check_in">Entrada</option>
                <option value="check_out">Salida</option>
                <option value="break_start">Inicio Pausa</option>
                <option value="break_end">Fin Pausa</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setFilters({ startDate: '', endDate: '', employeeName: '', recordType: 'all' })}
              className="px-4 py-2 border border-neutral-mid/30 text-neutral-dark rounded-lg hover:bg-neutral-light"
            >
              Limpiar Filtros
            </button>
            <div className="text-sm text-neutral-medium flex items-center">
              Mostrando {filteredRecords.length} de {records.length} registros
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-mid/20">
          <thead className="bg-neutral-light">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Fecha y Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Duración
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Notas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-mid/20">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-brand-medium">
                  {records.length === 0 ? 'No hay registros de fichajes' : 'No hay registros que coincidan con los filtros'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-neutral-light/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {record.employee ? `${record.employee.name} (${record.employee.employeeCode})` : 'Empleado desconocido'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.type === 'checkin' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {record.type === 'checkin' ? 'Entrada' : 'Salida'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {formatDate(record.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-medium">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-dark">
                    {record.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Schedules Content
const SchedulesContent = ({ setActiveTab }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar empleados
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/employees`);
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-dark font-serif">
          Gestión de Horarios
        </h2>
        <button
          onClick={() => setShowTemplatesModal(true)}
          className="px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium transition-colors"
        >
          Gestionar Plantillas
        </button>
      </div>

      {/* Employees List for Schedule Management */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-mid/20">
          <h3 className="text-lg font-semibold text-neutral-dark">
            Empleados - Asignar Horarios
          </h3>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-brand-medium">
              No hay empleados registrados
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <div key={employee.id} className="border border-neutral-mid/20 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-neutral-dark">{employee.name}</h4>
                      <p className="text-sm text-brand-medium">{employee.employeeCode}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowScheduleModal(true);
                        }}
                        className="px-3 py-1 bg-brand-light text-brand-cream text-sm rounded hover:bg-brand-medium transition-colors"
                      >
                        Horarios
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedEmployee && (
        <ScheduleModal
          employee={selectedEmployee}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <TemplatesModal
          onClose={() => setShowTemplatesModal(false)}
        />
      )}
    </div>
  );
};

// Vacations Content
const VacationsContent = () => {
  const [vacations, setVacations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Cargar vacaciones y empleados
  const fetchData = async () => {
    try {
      const [vacationsResponse, employeesResponse] = await Promise.all([
        fetch(`${getApiUrl()}/vacations`),
        fetch(`${getApiUrl()}/employees`)
      ]);
      
      if (vacationsResponse.ok) {
        const vacationsData = await vacationsResponse.json();
        setVacations(vacationsData);
      }
      
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      vacation: 'Vacaciones',
      sick_leave: 'Baja médica',
      personal: 'Asunto personal',
      maternity: 'Baja maternal',
      paternity: 'Baja paternal',
      other: 'Otro'
    };
    return types[type] || type;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    };
    return statuses[status] || status;
  };

  const handleStatusChange = async (vacationId, newStatus) => {
    try {
      const response = await fetch(`${getApiUrl()}/vacations/${vacationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchData(); // Reload data
      }
    } catch (error) {
      console.error('Error updating vacation status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-dark font-serif">
          Gestión de Vacaciones
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </button>
      </div>

      {/* Vacations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-mid/20">
          <thead className="bg-neutral-light">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Fechas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Días
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-mid/20">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : vacations.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-brand-medium">
                  No hay solicitudes de vacaciones
                </td>
              </tr>
            ) : (
              vacations.map((vacation) => (
                <tr key={vacation.id} className="hover:bg-neutral-light/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {vacation.employee ? `${vacation.employee.name} (${vacation.employee.employeeCode})` : 'Empleado desconocido'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {getTypeLabel(vacation.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {new Date(vacation.startDate).toLocaleDateString('es-ES')} - {new Date(vacation.endDate).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {Math.ceil((new Date(vacation.endDate) - new Date(vacation.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vacation.status)}`}>
                      {getStatusLabel(vacation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {vacation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(vacation.id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleStatusChange(vacation.id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Vacation Modal */}
      {showCreateModal && (
        <CreateVacationModal
          employees={employees}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

// Weekly View Content (Excel-like table)
const WeeklyViewContent = () => {
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Get week dates
  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  // Fetch employees and their schedules
  const fetchData = async () => {
    try {
      const employeesResponse = await fetch(`${getApiUrl()}/employees`);
      
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);

        // Fetch schedules for each employee
        const schedulesData = {};
        for (const employee of employeesData) {
          try {
            const scheduleResponse = await fetch(`${getApiUrl()}/schedules/employee/${employee.id}`);
            if (scheduleResponse.ok) {
              const employeeSchedules = await scheduleResponse.json();
              schedulesData[employee.id] = employeeSchedules.reduce((acc, schedule) => {
                acc[schedule.dayOfWeek] = schedule;
                return acc;
              }, {});
            }
          } catch (error) {
            console.error(`Error fetching schedules for employee ${employee.id}:`, error);
          }
        }
        setSchedules(schedulesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const getScheduleForDay = (employeeId, dayOfWeek) => {
    return schedules[employeeId]?.[dayOfWeek] || null;
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return time.substring(0, 5); // Remove seconds
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const getWeekLabel = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-dark font-serif">
          Vista Semanal - Horarios
        </h2>
        
        {/* Week Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="px-3 py-1 border border-neutral-mid/30 rounded hover:bg-neutral-light"
          >
            ← Anterior
          </button>
          <span className="font-medium text-neutral-dark">
            Semana del {getWeekLabel()}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            className="px-3 py-1 border border-neutral-mid/30 rounded hover:bg-neutral-light"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Excel-like Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-neutral-light">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider border-r border-neutral-mid/20 sticky left-0 bg-neutral-light">
                Empleado
              </th>
              {weekDates.map((date, index) => (
                <th key={index} className="px-3 py-3 text-center text-xs font-medium text-neutral-dark uppercase tracking-wider border-r border-neutral-mid/20 min-w-[120px]">
                  <div>{daysOfWeek[index]}</div>
                  <div className="text-brand-medium font-normal">
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-mid/20">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-brand-medium">
                  No hay empleados registrados
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-neutral-light/30">
                  <td className="px-4 py-4 whitespace-nowrap border-r border-neutral-mid/20 sticky left-0 bg-white">
                    <div className="text-sm font-medium text-neutral-dark">{employee.name}</div>
                    <div className="text-xs text-brand-medium">{employee.employeeCode}</div>
                  </td>
                  {weekDates.map((date, dayIndex) => {
                    const dayOfWeek = date.getDay() === 0 ? 0 : date.getDay(); // Sunday = 0
                    const schedule = getScheduleForDay(employee.id, dayOfWeek);
                    
                    return (
                      <td key={dayIndex} className="px-3 py-4 text-center border-r border-neutral-mid/20 min-w-[120px]">
                        {schedule && schedule.isWorkingDay ? (
                          <div className="text-xs">
                            <div className="font-medium text-neutral-dark">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </div>
                            {schedule.breakStartTime && schedule.breakEndTime && (
                              <div className="text-brand-medium mt-1">
                                Descanso: {formatTime(schedule.breakStartTime)} - {formatTime(schedule.breakEndTime)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            No laboral
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-4">
        <h3 className="text-sm font-medium text-neutral-dark mb-2">Leyenda:</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-neutral-dark rounded mr-2"></div>
            <span>Horario de trabajo</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-brand-medium rounded mr-2"></div>
            <span>Horario de descanso</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
            <span>Día no laboral</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Insights Content
const AIInsightsContent = () => {
  const [analysis, setAnalysis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const [analysisResponse, alertsResponse] = await Promise.all([
        fetch(`${getApiUrl()}/ai/anomalies-summary?days=${selectedPeriod}`),
        fetch(`${getApiUrl()}/ai/smart-alerts`)
      ]);

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAIInsights();
  }, [selectedPeriod]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'pattern': return '📊';
      case 'system': return '⚙️';
      case 'positive': return '✅';
      default: return '📋';
    }
  };

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-200 bg-green-50 text-green-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-dark font-serif">
          Análisis Inteligente con IA
        </h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            className="px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
          
          <button
            onClick={fetchAIInsights}
            disabled={loading}
            className="px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium disabled:opacity-50"
          >
            {loading ? 'Analizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Alertas Inteligentes */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
            <h3 className="text-lg font-semibold text-neutral-dark mb-4">🚨 Alertas Inteligentes</h3>
            
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-brand-medium">
                No hay alertas en este momento
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getAlertColor(alert.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm mt-1">{alert.message}</p>
                        {alert.count && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Cantidad: {alert.count}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs opacity-70">
                        {alert.priority.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen de Anomalías */}
          {analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estadísticas de Anomalías */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
                <h3 className="text-lg font-semibold text-neutral-dark mb-4">📊 Resumen de Anomalías</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-medium">Total de Anomalías</span>
                    <span className="text-2xl font-bold text-neutral-dark">{analysis.totalAnomalies}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor('high')}`}></div>
                        <span className="text-sm">Alta Severidad</span>
                      </div>
                      <span className="font-medium">{analysis.highSeverity}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor('medium')}`}></div>
                        <span className="text-sm">Media Severidad</span>
                      </div>
                      <span className="font-medium">{analysis.mediumSeverity}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor('low')}`}></div>
                        <span className="text-sm">Baja Severidad</span>
                      </div>
                      <span className="font-medium">{analysis.lowSeverity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipos de Anomalías */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
                <h3 className="text-lg font-semibold text-neutral-dark mb-4">🔍 Tipos de Anomalías</h3>
                
                <div className="space-y-3">
                  {Object.entries(analysis.byType || {}).map(([type, count]) => {
                    const typeLabels = {
                      'late_arrival': 'Llegadas Tarde',
                      'early_departure': 'Salidas Tempranas',
                      'missing_checkin': 'Entradas Faltantes',
                      'missing_checkout': 'Salidas Faltantes'
                    };
                    
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm">{typeLabels[type] || type}</span>
                        <span className="font-medium text-brand-dark">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Insights de IA */}
          {analysis?.aiInsights && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
              <h3 className="text-lg font-semibold text-neutral-dark mb-4">🤖 Insights de IA</h3>
              
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-neutral-dark">
                  {analysis.aiInsights.summary}
                </div>
              </div>
              
              <div className="mt-4 text-xs text-brand-medium">
                Generado por: {analysis.aiInsights.model} • {new Date(analysis.aiInsights.generatedAt).toLocaleString('es-ES')}
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {analysis?.recommendations && analysis.recommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
              <h3 className="text-lg font-semibold text-neutral-dark mb-4">💡 Recomendaciones</h3>
              
              <div className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-blue-900">{rec.description}</h4>
                        <p className="text-sm text-blue-700 mt-1">{rec.suggestedAction}</p>
                        {rec.employee && (
                          <p className="text-xs text-blue-600 mt-1">Empleado: {rec.employee}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Settings Content
const SettingsContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-dark font-serif">
        Configuración del Sistema
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">
            Configuración General
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                defaultValue="Jarana"
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Horario de Trabajo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  defaultValue="09:00"
                  className="px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
                />
                <input
                  type="time"
                  defaultValue="17:00"
                  className="px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-mid/20 p-6">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">
            Configuración de Seguridad
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-dark">Requerir Google Authenticator</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-dark">Verificación de ubicación</span>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-dark">Logout automático</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium transition-colors">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

// Create Employee Modal
const CreateEmployeeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${getApiUrl()}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creando empleado');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-neutral-dark mb-4">
          Crear Nuevo Empleado
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              PIN (4-8 dígitos)
            </label>
            <input
              type="password"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
              minLength="4"
              maxLength="8"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-brand-medium hover:text-neutral-dark"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// QR Code Modal
const QRCodeModal = ({ employee, qrCodeData, onClose, onRegenerate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-neutral-dark mb-4">
          Google Authenticator - {employee.name}
        </h3>

        <div className="text-center space-y-4">
          {qrCodeData?.qrCode && (
            <div className="flex justify-center">
              <img 
                src={qrCodeData.qrCode} 
                alt="QR Code" 
                className="w-48 h-48 border border-neutral-mid/30 rounded-lg"
              />
            </div>
          )}

          <div className="text-sm text-brand-medium">
            <p className="mb-2">Escanea este código QR con Google Authenticator</p>
            <p className="font-mono text-xs bg-neutral-light p-2 rounded">
              Código: {employee.employeeCode}
            </p>
          </div>

          <div className="flex justify-center space-x-3 pt-4">
            <button
              onClick={onRegenerate}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Regenerar QR
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Schedule Modal
const ScheduleModal = ({ employee, onClose }) => {
  const [schedules, setSchedules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [showApplyTemplate, setShowApplyTemplate] = useState(false);
  const [scheduleBreaks, setScheduleBreaks] = useState({});

  const daysOfWeek = [
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' },
    { id: 0, name: 'Domingo' }
  ];

  // Load breaks for schedules
  const loadBreaksForSchedules = async (schedules) => {
    const breaksMap = {};
    for (const schedule of schedules) {
      if (schedule.id) {
        try {
          const response = await fetch(`${getApiUrl()}/schedule-breaks/schedule/${schedule.id}`);
          if (response.ok) {
            const data = await response.json();
            breaksMap[schedule.dayOfWeek] = data.data || [];
          }
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error(`Error loading breaks for schedule ${schedule.id}:`, error);
        }
      }
    }
    setScheduleBreaks(breaksMap);
  };

  // Load existing schedules or initialize with defaults
  React.useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/schedules/employee/${employee.id}`);
        
        if (response.ok) {
          const existingSchedules = await response.json();
          
          // Create a map of existing schedules by day
          const scheduleMap = {};
          existingSchedules.forEach(schedule => {
            scheduleMap[schedule.dayOfWeek] = {
              dayOfWeek: schedule.dayOfWeek,
              dayName: daysOfWeek.find(d => d.id === schedule.dayOfWeek)?.name || '',
              isWorkingDay: schedule.isWorkingDay,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              breakStartTime: schedule.breakStartTime || '',
              breakEndTime: schedule.breakEndTime || '',
              notes: schedule.notes || ''
            };
          });
          
          // Fill in missing days with defaults
          const allSchedules = daysOfWeek.map(day => 
            scheduleMap[day.id] || {
              dayOfWeek: day.id,
              dayName: day.name,
              isWorkingDay: day.id >= 1 && day.id <= 5, // Monday to Friday by default
              startTime: '09:00',
              endTime: '17:00',
              breakStartTime: '13:00',
              breakEndTime: '14:00',
              notes: ''
            }
          );
          
          setSchedules(allSchedules);
          
          // Load breaks for each schedule
          await loadBreaksForSchedules(existingSchedules);
        } else {
          // If no schedules exist, use defaults
          const defaultSchedules = daysOfWeek.map(day => ({
            dayOfWeek: day.id,
            dayName: day.name,
            isWorkingDay: day.id >= 1 && day.id <= 5,
            startTime: '09:00',
            endTime: '17:00',
            breakStartTime: '13:00',
            breakEndTime: '14:00',
            notes: ''
          }));
          setSchedules(defaultSchedules);
        }
      } catch (error) {
        console.error('Error loading schedules:', error);
        // Use defaults on error
        const defaultSchedules = daysOfWeek.map(day => ({
          dayOfWeek: day.id,
          dayName: day.name,
          isWorkingDay: day.id >= 1 && day.id <= 5,
          startTime: '09:00',
          endTime: '17:00',
          breakStartTime: '13:00',
          breakEndTime: '14:00',
          notes: ''
        }));
        setSchedules(defaultSchedules);
      } finally {
        setLoadingSchedules(false);
      }
    };

    loadSchedules();
    loadTemplates();
  }, [employee.id]);

  // Load available templates
  const loadTemplates = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/schedule-templates/active`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Apply template to employee
  const handleApplyTemplate = async () => {
    if (!selectedTemplate) {
      alert('Selecciona una plantilla');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/schedules/apply-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          templateId: selectedTemplate
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Plantilla aplicada exitosamente a ${employee.name}`);
        setShowApplyTemplate(false);
        setSelectedTemplate('');
        // Reload schedules to show the applied template
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al aplicar plantilla');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (dayOfWeek, field, value) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.dayOfWeek === dayOfWeek 
        ? { ...schedule, [field]: value }
        : schedule
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/schedules/employee/${employee.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ schedules })
      });

      if (response.ok) {
        alert('Horarios guardados correctamente');
        onClose();
      } else {
        throw new Error('Error al guardar horarios');
      }
    } catch (error) {
      console.error('Error saving schedules:', error);
      alert('Error al guardar horarios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-dark">
            Horarios de {employee.name} ({employee.employeeCode})
          </h3>
          <button
            onClick={() => setShowApplyTemplate(true)}
            className="px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium text-sm"
          >
            Aplicar Plantilla
          </button>
        </div>

        {loadingSchedules ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
            <div key={schedule.dayOfWeek} className="border border-neutral-mid/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-neutral-dark">{schedule.dayName}</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={schedule.isWorkingDay}
                    onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'isWorkingDay', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-brand-medium">Día laboral</span>
                </label>
              </div>

              {schedule.isWorkingDay && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-dark mb-1">
                        Entrada
                      </label>
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'startTime', e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-mid/30 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-dark mb-1">
                        Salida
                      </label>
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'endTime', e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-mid/30 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-dark mb-1">
                        Inicio Descanso
                      </label>
                      <input
                        type="time"
                        value={schedule.breakStartTime}
                        onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'breakStartTime', e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-mid/30 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-dark mb-1">
                        Fin Descanso
                      </label>
                      <input
                        type="time"
                        value={schedule.breakEndTime}
                        onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'breakEndTime', e.target.value)}
                        className="w-full px-2 py-1 border border-neutral-mid/30 rounded text-sm"
                      />
                    </div>
                  </div>

                  {/* Mostrar pausas configuradas */}
                  {scheduleBreaks[schedule.dayOfWeek] && scheduleBreaks[schedule.dayOfWeek].length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-mid/20">
                      <h5 className="text-xs font-semibold text-neutral-dark mb-2">📋 Pausas Configuradas:</h5>
                      <div className="space-y-1">
                        {scheduleBreaks[schedule.dayOfWeek].map((breakItem, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs bg-blue-50 px-2 py-1 rounded">
                            <span className="font-medium text-blue-900">{breakItem.name}</span>
                            <span className="text-blue-700">{breakItem.startTime} - {breakItem.endTime}</span>
                            {breakItem.isPaid && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-[10px]">Pagada</span>
                            )}
                            {breakItem.isRequired && (
                              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-[10px]">Obligatoria</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-mid/20 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-brand-medium hover:text-neutral-dark"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Horarios'}
          </button>
        </div>
      </div>

      {/* Modal para aplicar plantillas */}
      {showApplyTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold text-neutral-dark mb-4">
              Aplicar Plantilla a {employee.name}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-2">
                  Seleccionar Plantilla
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent"
                >
                  <option value="">Selecciona una plantilla...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Esto aplicará la plantilla como horario base. 
                  Podrás hacer excepciones por semana específica más adelante.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowApplyTemplate(false);
                  setSelectedTemplate('');
                }}
                className="flex-1 px-4 py-2 border border-neutral-mid/30 text-neutral-dark rounded-lg hover:bg-neutral-light"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyTemplate}
                disabled={!selectedTemplate || loading}
                className="flex-1 px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium disabled:opacity-50"
              >
                {loading ? 'Aplicando...' : 'Aplicar Plantilla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Vacation Modal
const CreateVacationModal = ({ employees, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    type: 'vacation',
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const vacationTypes = [
    { value: 'vacation', label: 'Vacaciones' },
    { value: 'sick_leave', label: 'Baja médica' },
    { value: 'personal', label: 'Asunto personal' },
    { value: 'maternity', label: 'Baja maternal' },
    { value: 'paternity', label: 'Baja paternal' },
    { value: 'other', label: 'Otro' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${getApiUrl()}/vacations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creando solicitud de vacaciones');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-neutral-dark mb-4">
          Nueva Solicitud de Vacaciones
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              Empleado
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
              required
            >
              <option value="">Seleccionar empleado</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              Tipo de solicitud
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
            >
              {vacationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Fecha inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Fecha fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
                required
              />
            </div>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="text-sm text-brand-medium">
              Duración: {calculateDays()} días
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              Motivo
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
              rows="3"
              placeholder="Motivo de la solicitud..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">
              Notas adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:border-brand-light focus:ring-0 focus:outline-none"
              rows="2"
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-brand-medium hover:text-neutral-dark"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Templates Modal - Complete modal for managing templates with schedule days
const TemplatesModal = ({ onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTemplateForApply, setSelectedTemplateForApply] = useState(null);
  const [showBreaksModal, setShowBreaksModal] = useState(false);
  const [selectedTemplateForBreaks, setSelectedTemplateForBreaks] = useState(null);
  const [selectedDayForBreaks, setSelectedDayForBreaks] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    days: [
      { dayOfWeek: 1, dayName: 'Lunes', isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 2, dayName: 'Martes', isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 3, dayName: 'Miércoles', isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 4, dayName: 'Jueves', isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 5, dayName: 'Viernes', isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 6, dayName: 'Sábado', isWorkingDay: false, startTime: '', endTime: '' },
      { dayOfWeek: 0, dayName: 'Domingo', isWorkingDay: false, startTime: '', endTime: '' }
    ]
  });

  React.useEffect(() => {
    fetchTemplates();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/employees`);
      if (response.ok) {
        const data = await response.json();
        
        // Obtener todas las plantillas primero (1 sola petición)
        const templatesResponse = await fetch(`${getApiUrl()}/schedule-templates`);
        const templatesData = templatesResponse.ok ? await templatesResponse.json() : { data: [] };
        const templatesMap = {};
        (templatesData.data || []).forEach(template => {
          templatesMap[template.id] = template.name;
        });
        
        // Obtener horarios de cada empleado con delay para evitar rate limit
        const employeesWithTemplates = [];
        for (const employee of data) {
          try {
            const scheduleResponse = await fetch(`${getApiUrl()}/schedules/employee/${employee.id}`);
            if (scheduleResponse.ok) {
              const scheduleData = await scheduleResponse.json();
              const templateId = scheduleData.schedules?.[0]?.templateId;
              
              employeesWithTemplates.push({
                ...employee,
                currentTemplate: templateId ? templatesMap[templateId] : null
              });
            } else {
              employeesWithTemplates.push({ ...employee, currentTemplate: null });
            }
            
            // Pequeño delay para evitar rate limiting (50ms entre peticiones)
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            employeesWithTemplates.push({ ...employee, currentTemplate: null });
          }
        }
        
        setEmployees(employeesWithTemplates);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/schedule-templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      // Primero necesitamos obtener un empleado válido para createdBy
      const employeesResponse = await fetch(`${getApiUrl()}/employees`);
      const employeesData = await employeesResponse.json();
      const firstEmployee = employeesData[0] || employeesData.data?.[0];
      
      if (!firstEmployee) {
        alert('Error: No hay empleados en el sistema. Crea un empleado primero.');
        return;
      }

      const templateData = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        createdBy: firstEmployee.id, // ID de empleado válido
        templateDays: formData.days.map(day => ({
          dayOfWeek: day.dayOfWeek,
          isWorkingDay: day.isWorkingDay,
          startTime: day.isWorkingDay ? day.startTime : null,
          endTime: day.isWorkingDay ? day.endTime : null
        }))
      };

      const response = await fetch(`${getApiUrl()}/schedule-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        await fetchTemplates();
        setShowCreateForm(false);
        resetForm();
        alert('Plantilla creada exitosamente');
      } else {
        const error = await response.json();
        alert('Error al crear plantilla: ' + (error.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error al crear plantilla: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
      days: [
        { dayOfWeek: 1, dayName: 'Lunes', isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 2, dayName: 'Martes', isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 3, dayName: 'Miércoles', isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 4, dayName: 'Jueves', isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 5, dayName: 'Viernes', isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 6, dayName: 'Sábado', isWorkingDay: false, startTime: '', endTime: '' },
        { dayOfWeek: 0, dayName: 'Domingo', isWorkingDay: false, startTime: '', endTime: '' }
      ]
    });
  };

  const handleDayChange = (dayOfWeek, field, value) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, [field]: value }
          : day
      )
    }));
  };

  const handleEditTemplate = (template) => {
    // Cargar datos de la plantilla en el formulario
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    const templateDaysMap = {};
    template.templateDays?.forEach(day => {
      templateDaysMap[day.dayOfWeek] = day;
    });

    const days = [1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
      const existingDay = templateDaysMap[dayOfWeek];
      return {
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        isWorkingDay: existingDay?.isWorkingDay || false,
        startTime: existingDay?.startTime || '09:00',
        endTime: existingDay?.endTime || '18:00'
      };
    });

    setFormData({
      name: template.name,
      description: template.description || '',
      isActive: template.isActive,
      days
    });
    setEditingTemplate(template);
    setShowCreateForm(true);
  };

  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        templateDays: formData.days.map(day => ({
          dayOfWeek: day.dayOfWeek,
          isWorkingDay: day.isWorkingDay,
          startTime: day.isWorkingDay ? day.startTime : null,
          endTime: day.isWorkingDay ? day.endTime : null
        }))
      };

      const response = await fetch(`${getApiUrl()}/schedule-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        await fetchTemplates();
        setShowCreateForm(false);
        setEditingTemplate(null);
        resetForm();
        alert('Plantilla actualizada exitosamente. Los empleados con esta plantilla tendrán los nuevos horarios.');
      } else {
        const error = await response.json();
        alert('Error al actualizar plantilla: ' + (error.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error al actualizar plantilla: ' + error.message);
    }
  };

  const handleApplyToEmployees = (template) => {
    setSelectedTemplateForApply(template);
    setSelectedEmployees([]);
    setShowApplyModal(true);
  };

  const handleApplyTemplate = async () => {
    if (selectedEmployees.length === 0) {
      alert('Selecciona al menos un empleado');
      return;
    }

    try {
      // Aplicar plantilla a cada empleado seleccionado
      const promises = selectedEmployees.map(employeeId =>
        fetch(`${getApiUrl()}/schedules/apply-template`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            templateId: selectedTemplateForApply.id
          })
        })
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every(r => r.ok);

      if (allSuccess) {
        alert(`Plantilla "${selectedTemplateForApply.name}" aplicada a ${selectedEmployees.length} empleado(s) exitosamente`);
        setShowApplyModal(false);
        setSelectedEmployees([]);
        setSelectedTemplateForApply(null);
        // Recargar empleados para actualizar las plantillas asignadas
        await fetchEmployees();
      } else {
        alert('Algunos empleados no pudieron ser actualizados');
      }
    } catch (error) {
      alert('Error al aplicar plantilla: ' + error.message);
    }
  };

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    
    try {
      const response = await fetch(`${getApiUrl()}/schedule-templates/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchTemplates();
        alert('Plantilla eliminada');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'No se puede eliminar la plantilla'));
      }
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-neutral-dark">
            Gestión de Plantillas de Horarios
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-medium hover:text-neutral-dark"
          >
            ✕
          </button>
        </div>

        {!showCreateForm ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-neutral-medium">
                {templates.length} plantillas disponibles
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Plantilla
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 bg-neutral-light rounded-lg">
                <p className="text-neutral-medium mb-4">No hay plantillas creadas</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium"
                >
                  Crear Primera Plantilla
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-neutral-mid/20 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-neutral-dark">{template.name}</h4>
                        <p className="text-sm text-neutral-medium">{template.description}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          template.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {template.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => handleApplyToEmployees(template)}
                        className="px-3 py-1 text-sm bg-brand-light text-brand-cream rounded hover:bg-brand-medium transition-colors"
                      >
                        Aplicar a Empleados
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTemplateForBreaks(template);
                          setShowBreaksModal(true);
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Gestionar Pausas
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="px-3 py-1 text-sm border border-brand-light text-brand-light rounded hover:bg-brand-light hover:text-brand-cream transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Nombre de la Plantilla
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent"
                placeholder="Ej: Horario Oficina"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent"
                rows="3"
                placeholder="Descripción de la plantilla..."
              />
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm text-neutral-dark">Plantilla activa</label>
            </div>

            {/* Configuración de días */}
            <div className="border-t border-neutral-mid/20 pt-4">
              <h4 className="font-semibold text-neutral-dark mb-3">Configuración de Horarios por Día</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {formData.days.map((day) => (
                  <div key={day.dayOfWeek} className="border border-neutral-mid/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-neutral-dark">{day.dayName}</span>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={day.isWorkingDay}
                          onChange={(e) => handleDayChange(day.dayOfWeek, 'isWorkingDay', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-neutral-medium">Día laboral</span>
                      </label>
                    </div>
                    
                    {day.isWorkingDay && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-medium mb-1">Entrada</label>
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => handleDayChange(day.dayOfWeek, 'startTime', e.target.value)}
                            className="w-full px-2 py-1 border border-neutral-mid/30 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-medium mb-1">Salida</label>
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => handleDayChange(day.dayOfWeek, 'endTime', e.target.value)}
                            className="w-full px-2 py-1 border border-neutral-mid/30 rounded text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-medium mt-2">
                💡 Tip: Las pausas/descansos se configuran después de crear la plantilla
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-neutral-mid/30 text-neutral-dark rounded-lg hover:bg-neutral-light"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium"
              >
                {editingTemplate ? 'Actualizar Plantilla' : 'Crear Plantilla'}
              </button>
            </div>
          </form>
        )}

        {/* Modal de Aplicar Plantilla a Empleados */}
        {showApplyModal && selectedTemplateForApply && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-neutral-dark">
                  Aplicar Plantilla: {selectedTemplateForApply.name}
                </h4>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedEmployees([]);
                    setSelectedTemplateForApply(null);
                  }}
                  className="text-neutral-medium hover:text-neutral-dark"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-neutral-medium mb-4">
                Selecciona los empleados a los que quieres aplicar esta plantilla de horario
              </p>

              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {employees.length === 0 ? (
                  <p className="text-center text-neutral-medium py-4">No hay empleados disponibles</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.length === employees.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees(employees.map(emp => emp.id));
                          } else {
                            setSelectedEmployees([]);
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-neutral-dark">
                        Seleccionar todos ({employees.length})
                      </span>
                    </div>
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-3 p-3 border border-neutral-mid/20 rounded-lg hover:bg-neutral-light/50 cursor-pointer"
                        onClick={() => toggleEmployeeSelection(employee.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => toggleEmployeeSelection(employee.id)}
                          className="w-4 h-4"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-neutral-dark">{employee.name}</div>
                          <div className="text-sm text-neutral-medium">{employee.employeeCode}</div>
                          {employee.currentTemplate && (
                            <div className="text-xs text-brand-light mt-1 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Plantilla actual: {employee.currentTemplate}
                            </div>
                          )}
                          {!employee.currentTemplate && (
                            <div className="text-xs text-neutral-medium mt-1 italic">
                              Sin plantilla asignada
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedEmployees([]);
                    setSelectedTemplateForApply(null);
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-mid/30 text-neutral-dark rounded-lg hover:bg-neutral-light"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyTemplate}
                  disabled={selectedEmployees.length === 0}
                  className="flex-1 px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aplicar a {selectedEmployees.length} empleado(s)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Gestión de Pausas */}
        {showBreaksModal && selectedTemplateForBreaks && (
          <BreaksManagementModal
            template={selectedTemplateForBreaks}
            onClose={() => {
              setShowBreaksModal(false);
              setSelectedTemplateForBreaks(null);
              setSelectedDayForBreaks(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Breaks Management Modal Component
const BreaksManagementModal = ({ template, onClose }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddBreak, setShowAddBreak] = useState(false);
  const [breakForm, setBreakForm] = useState({
    name: '',
    startTime: '',
    endTime: '',
    breakType: 'meal',
    isPaid: false,
    isRequired: true,
    isFlexible: false,
    flexibilityMinutes: 0,
    description: '',
    applyToAllDays: false
  });

  const breakTypes = [
    { value: 'paid', label: 'Pausa Pagada' },
    { value: 'unpaid', label: 'Pausa No Pagada' },
    { value: 'meal', label: 'Comida' },
    { value: 'rest', label: 'Descanso' },
    { value: 'personal', label: 'Personal' },
    { value: 'other', label: 'Otro' }
  ];

  const fetchBreaks = async (templateDayId) => {
    if (!templateDayId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/schedule-breaks/template_day/${templateDayId}`);
      if (response.ok) {
        const data = await response.json();
        setBreaks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching breaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    fetchBreaks(day.id);
    setShowAddBreak(false);
  };

  const handleAddBreak = async (e) => {
    e.preventDefault();
    
    if (!selectedDay && !breakForm.applyToAllDays) {
      alert('Selecciona un día primero');
      return;
    }

    try {
      // Obtener el primer empleado para createdBy
      const employeesResponse = await fetch(`${getApiUrl()}/employees`);
      const employeesData = await employeesResponse.json();
      const firstEmployee = employeesData[0];

      const breakData = {
        parentType: 'template_day',
        name: breakForm.name,
        startTime: breakForm.startTime,
        endTime: breakForm.endTime,
        breakType: breakForm.breakType,
        isPaid: breakForm.isPaid,
        isRequired: breakForm.isRequired,
        isFlexible: breakForm.isFlexible,
        flexibilityMinutes: breakForm.isFlexible ? parseInt(breakForm.flexibilityMinutes) : 0,
        description: breakForm.description,
        createdBy: firstEmployee?.id
      };

      // Si "Aplicar a todos los días" está marcado
      if (breakForm.applyToAllDays) {
        let successCount = 0;
        
        // Crear pausas una por una con delay para evitar rate limiting
        for (const day of template.templateDays) {
          try {
            const response = await fetch(`${getApiUrl()}/schedule-breaks`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...breakData,
                parentId: day.id
              })
            });

            if (response.ok) {
              successCount++;
            }
            
            // Delay de 100ms entre cada petición para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error creating break for day ${day.dayOfWeek}:`, error);
          }
        }

        if (successCount === template.templateDays.length) {
          alert(`Pausa añadida a todos los días (${successCount} días)`);
          setShowAddBreak(false);
          setBreakForm({
            name: '',
            startTime: '',
            endTime: '',
            breakType: 'meal',
            isPaid: false,
            isRequired: true,
            isFlexible: false,
            flexibilityMinutes: 0,
            description: '',
            applyToAllDays: false
          });
          if (selectedDay) {
            fetchBreaks(selectedDay.id);
          }
        } else {
          alert(`Pausa añadida a ${successCount} de ${template.templateDays.length} días. Algunos días fallaron.`);
          if (selectedDay) {
            fetchBreaks(selectedDay.id);
          }
        }
      } else {
        // Aplicar solo al día seleccionado
        const response = await fetch(`${getApiUrl()}/schedule-breaks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...breakData,
            parentId: selectedDay.id
          })
        });

        if (response.ok) {
          alert('Pausa añadida exitosamente');
          setShowAddBreak(false);
          setBreakForm({
            name: '',
            startTime: '',
            endTime: '',
            breakType: 'meal',
            isPaid: false,
            isRequired: true,
            isFlexible: false,
            flexibilityMinutes: 0,
            description: '',
            applyToAllDays: false
          });
          fetchBreaks(selectedDay.id);
        } else {
          const error = await response.json();
          alert('Error: ' + (error.error || 'No se pudo añadir la pausa'));
        }
      }
    } catch (error) {
      alert('Error al añadir pausa: ' + error.message);
    }
  };

  const handleDeleteBreak = async (breakId) => {
    if (!confirm('¿Eliminar esta pausa?')) return;

    try {
      const response = await fetch(`${getApiUrl()}/schedule-breaks/${breakId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Pausa eliminada');
        fetchBreaks(selectedDay.id);
      }
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-neutral-dark">
            Gestión de Pausas - {template.name}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-medium hover:text-neutral-dark text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lista de días */}
          <div className="md:col-span-1">
            <h4 className="font-semibold text-neutral-dark mb-3">Selecciona un día</h4>
            <div className="space-y-2">
              {template.templateDays?.map((day) => (
                <button
                  key={day.id}
                  onClick={() => handleDaySelect(day)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedDay?.id === day.id
                      ? 'border-brand-light bg-brand-light/10 text-brand-dark'
                      : 'border-neutral-mid/20 hover:bg-neutral-light'
                  }`}
                >
                  <div className="font-medium">{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day.dayOfWeek]}</div>
                  <div className="text-sm text-neutral-medium">
                    {day.startTime} - {day.endTime}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pausas del día seleccionado */}
          <div className="md:col-span-2">
            {!selectedDay ? (
              <div className="flex items-center justify-center h-full text-neutral-medium">
                ← Selecciona un día para gestionar sus pausas
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-neutral-dark">
                    Pausas del {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][selectedDay.dayOfWeek]}
                  </h4>
                  <button
                    onClick={() => setShowAddBreak(!showAddBreak)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Añadir Pausa
                  </button>
                </div>

                {/* Formulario añadir pausa */}
                {showAddBreak && (
                  <form onSubmit={handleAddBreak} className="bg-neutral-light/50 p-4 rounded-lg mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input
                          type="text"
                          required
                          value={breakForm.name}
                          onChange={(e) => setBreakForm({ ...breakForm, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="Ej: Pausa comida"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <select
                          value={breakForm.breakType}
                          onChange={(e) => setBreakForm({ ...breakForm, breakType: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          {breakTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Hora inicio</label>
                        <input
                          type="time"
                          required
                          value={breakForm.startTime}
                          onChange={(e) => setBreakForm({ ...breakForm, startTime: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Hora fin</label>
                        <input
                          type="time"
                          required
                          value={breakForm.endTime}
                          onChange={(e) => setBreakForm({ ...breakForm, endTime: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={breakForm.isPaid}
                          onChange={(e) => setBreakForm({ ...breakForm, isPaid: e.target.checked })}
                        />
                        Pagada
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={breakForm.isRequired}
                          onChange={(e) => setBreakForm({ ...breakForm, isRequired: e.target.checked })}
                        />
                        Obligatoria
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={breakForm.isFlexible}
                          onChange={(e) => setBreakForm({ ...breakForm, isFlexible: e.target.checked })}
                        />
                        Flexible
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-brand-light">
                        <input
                          type="checkbox"
                          checked={breakForm.applyToAllDays}
                          onChange={(e) => setBreakForm({ ...breakForm, applyToAllDays: e.target.checked })}
                        />
                        🔄 Repetir todos los días
                      </label>
                    </div>

                    {breakForm.isFlexible && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Flexibilidad (minutos)</label>
                        <input
                          type="number"
                          min="0"
                          value={breakForm.flexibilityMinutes}
                          onChange={(e) => setBreakForm({ ...breakForm, flexibilityMinutes: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddBreak(false)}
                        className="px-4 py-2 border rounded-lg text-sm hover:bg-neutral-light"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        Guardar Pausa
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista de pausas */}
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : breaks.length === 0 ? (
                  <div className="text-center py-8 text-neutral-medium">
                    No hay pausas configuradas para este día
                  </div>
                ) : (
                  <div className="space-y-2">
                    {breaks.map((breakItem) => (
                      <div
                        key={breakItem.id}
                        className="border border-neutral-mid/20 rounded-lg p-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-neutral-dark">{breakItem.name}</div>
                            <div className="text-sm text-neutral-medium mt-1">
                              {breakItem.startTime} - {breakItem.endTime}
                              {breakItem.isFlexible && ` (±${breakItem.flexibilityMinutes} min)`}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                breakItem.isPaid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {breakItem.isPaid ? 'Pagada' : 'No pagada'}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                {breakTypes.find(t => t.value === breakItem.breakType)?.label || breakItem.breakType}
                              </span>
                              {breakItem.isRequired && (
                                <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
                                  Obligatoria
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteBreak(breakItem.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Records Summary Content - Resumen de fichajes por empleado con pausas
const RecordsSummaryContent = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filterType, setFilterType] = useState('day'); // day, week, month, custom
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordsSummary, setRecordsSummary] = useState(null);
  const [complianceReport, setComplianceReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  // Update date range based on filter type
  React.useEffect(() => {
    const today = new Date();
    let start, end;

    switch (filterType) {
      case 'day':
        start = end = selectedDate;
        break;
      case 'week':
        const weekDate = new Date(selectedDate);
        const dayOfWeek = weekDate.getDay();
        const diff = weekDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
        start = new Date(weekDate.setDate(diff)).toISOString().split('T')[0];
        end = new Date(weekDate.setDate(weekDate.getDate() + 6)).toISOString().split('T')[0];
        break;
      case 'month':
        const monthDate = new Date(selectedDate);
        start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'custom':
        // Use manually set startDate and endDate
        return;
    }

    setStartDate(start);
    setEndDate(end);
  }, [filterType, selectedDate]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/employees`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchRecordsSummary = async () => {
    if (!selectedEmployee) {
      alert('Selecciona un empleado');
      return;
    }

    setLoading(true);
    try {
      // Obtener registros del rango
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      const recordsResponse = await fetch(
        `${getApiUrl()}/records/all?employeeId=${selectedEmployee}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      
      if (!recordsResponse.ok) {
        throw new Error('Error al obtener registros');
      }

      const recordsData = await recordsResponse.json();
      const allRecords = recordsData.records || [];
      
      // Obtener horarios del empleado
      const scheduleResponse = await fetch(
        `${getApiUrl()}/schedules/employee/${selectedEmployee}`
      );
      
      let schedules = [];
      const scheduleBreaksMap = {};
      
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        schedules = scheduleData.schedules || [];
        
        // Obtener pausas para cada horario
        for (const schedule of schedules) {
          if (schedule.id) {
            try {
              const breaksResponse = await fetch(
                `${getApiUrl()}/schedule-breaks/schedule/${schedule.id}`
              );
              if (breaksResponse.ok) {
                const breaksData = await breaksResponse.json();
                scheduleBreaksMap[schedule.dayOfWeek] = breaksData.data || [];
              }
              await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
              console.error(`Error loading breaks for schedule ${schedule.id}:`, error);
            }
          }
        }
      }

      // Agrupar registros por día
      const recordsByDay = {};
      allRecords.forEach(record => {
        const date = new Date(record.timestamp).toISOString().split('T')[0];
        if (!recordsByDay[date]) {
          recordsByDay[date] = [];
        }
        recordsByDay[date].push(record);
      });

      // Ordenar registros de cada día por timestamp
      Object.keys(recordsByDay).forEach(date => {
        recordsByDay[date].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });

      setRecordsSummary({
        recordsByDay,
        schedules,
        scheduleBreaksMap,
        employee: employees.find(e => e.id === selectedEmployee),
        dateRange: { start: startDate, end: endDate }
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar resumen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateMinutesDifference = (time1, time2) => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const generateComplianceReport = async () => {
    setGeneratingReport(true);
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const report = [];

      // Procesar cada empleado
      for (const employee of employees) {
        // Obtener registros del empleado
        const recordsResponse = await fetch(
          `${getApiUrl()}/records/all?employeeId=${employee.id}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
        );
        
        if (!recordsResponse.ok) continue;

        const recordsData = await recordsResponse.json();
        const allRecords = recordsData.records || [];

        // Obtener horarios del empleado
        const scheduleResponse = await fetch(
          `${getApiUrl()}/schedules/employee/${employee.id}`
        );
        
        if (!scheduleResponse.ok) continue;

        const scheduleData = await scheduleResponse.json();
        const schedules = scheduleData.schedules || [];

        // Agrupar registros por día
        const recordsByDay = {};
        allRecords.forEach(record => {
          const date = new Date(record.timestamp).toISOString().split('T')[0];
          if (!recordsByDay[date]) {
            recordsByDay[date] = [];
          }
          recordsByDay[date].push(record);
        });

        // Analizar cada día
        const employeeIssues = [];
        let totalDaysWorked = 0;
        let daysWithIssues = 0;

        Object.keys(recordsByDay).forEach(date => {
          const dayRecords = recordsByDay[date].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
          const dayOfWeek = new Date(date).getDay();
          const schedule = schedules.find(s => s.dayOfWeek === dayOfWeek);

          if (!schedule || !schedule.isWorkingDay) return;

          totalDaysWorked++;
          const issues = [];

          const entryRecords = dayRecords.filter(r => r.type === 'checkin' || r.type === 'entry');
          const exitRecords = dayRecords.filter(r => r.type === 'checkout' || r.type === 'exit');

          // Verificar entrada
          if (entryRecords.length === 0) {
            issues.push('❌ Sin registro de entrada');
            daysWithIssues++;
          } else {
            const entryTime = formatTime(entryRecords[0].timestamp);
            const expectedEntry = schedule.startTime;
            const diff = calculateMinutesDifference(expectedEntry, entryTime);
            
            if (diff > 15) {
              issues.push(`⚠️ Entrada tardía: ${entryTime} (esperado: ${expectedEntry}, +${diff} min)`);
              daysWithIssues++;
            }
          }

          // Verificar salida
          if (exitRecords.length === 0) {
            issues.push('❌ Sin registro de salida');
            daysWithIssues++;
          } else {
            const exitTime = formatTime(exitRecords[exitRecords.length - 1].timestamp);
            const expectedExit = schedule.endTime;
            const diff = calculateMinutesDifference(exitTime, expectedExit);
            
            if (diff > 15) {
              issues.push(`⚠️ Salida anticipada: ${exitTime} (esperado: ${expectedExit}, -${Math.abs(diff)} min)`);
              daysWithIssues++;
            }
          }

          // Calcular horas trabajadas
          if (entryRecords.length > 0 && exitRecords.length > 0) {
            const entryTimestamp = new Date(entryRecords[0].timestamp);
            const exitTimestamp = new Date(exitRecords[exitRecords.length - 1].timestamp);
            const workedMinutes = (exitTimestamp - entryTimestamp) / (1000 * 60);
            const workedHours = (workedMinutes / 60).toFixed(2);

            const [expectedH, expectedM] = schedule.endTime.split(':').map(Number);
            const [startH, startM] = schedule.startTime.split(':').map(Number);
            const expectedMinutes = (expectedH * 60 + expectedM) - (startH * 60 + startM);
            const expectedHours = (expectedMinutes / 60).toFixed(2);

            if (workedHours < expectedHours - 0.5) {
              issues.push(`⏱️ Horas insuficientes: ${workedHours}h (esperado: ${expectedHours}h)`);
            }
          }

          if (issues.length > 0) {
            employeeIssues.push({
              date,
              issues
            });
          }
        });

        if (employeeIssues.length > 0 || totalDaysWorked > 0) {
          report.push({
            employee,
            totalDaysWorked,
            daysWithIssues,
            complianceRate: totalDaysWorked > 0 
              ? ((totalDaysWorked - daysWithIssues) / totalDaysWorked * 100).toFixed(1)
              : 0,
            issues: employeeIssues
          });
        }

        // Delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Ordenar por tasa de cumplimiento (menor a mayor)
      report.sort((a, b) => parseFloat(a.complianceRate) - parseFloat(b.complianceRate));

      setComplianceReport(report);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar informe: ' + error.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-neutral-dark mb-6">
          📊 Resumen de Fichajes por Empleado
        </h2>

        {/* Filtros */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Empleado
              </label>
              <select
                value={selectedEmployee || ''}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light"
              >
                <option value="">Selecciona un empleado...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Tipo de Filtro
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light"
              >
                <option value="day">📅 Día</option>
                <option value="week">📆 Semana</option>
                <option value="month">🗓️ Mes</option>
                <option value="custom">🔧 Rango Personalizado</option>
              </select>
            </div>
          </div>

          {filterType !== 'custom' ? (
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                {filterType === 'day' ? 'Fecha' : filterType === 'week' ? 'Semana (selecciona cualquier día)' : 'Mes'}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light"
              />
              <p className="text-xs text-neutral-medium mt-1">
                Rango: {startDate} al {endDate}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-mid/30 rounded-lg focus:ring-2 focus:ring-brand-light"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={fetchRecordsSummary}
              disabled={loading || !selectedEmployee}
              className="px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : 'Ver Resumen Individual'}
            </button>
            <button
              onClick={generateComplianceReport}
              disabled={generatingReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generatingReport ? (
                <>
                  <LoadingSpinner />
                  Generando...
                </>
              ) : (
                <>
                  📋 Generar Informe de Cumplimiento
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resumen en Tabla */}
        {recordsSummary && (
          <div className="border-t border-neutral-mid/20 pt-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-neutral-dark">
                {recordsSummary.employee?.name} - Del {startDate} al {endDate}
              </h3>
              <p className="text-sm text-neutral-medium mt-1">
                Total de días con registros: {Object.keys(recordsSummary.recordsByDay).length}
              </p>
            </div>

            {Object.keys(recordsSummary.recordsByDay).length === 0 ? (
              <p className="text-neutral-medium text-center py-8">No hay registros para este rango de fechas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-mid/20">
                  <thead className="bg-neutral-light">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-dark uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-dark uppercase tracking-wider">
                        Entrada
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-dark uppercase tracking-wider">
                        Salida
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-dark uppercase tracking-wider">
                        Pausas Configuradas
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-dark uppercase tracking-wider">
                        Horario Esperado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-mid/20">
                    {Object.keys(recordsSummary.recordsByDay).sort().map((date) => {
                      const dayRecords = recordsSummary.recordsByDay[date];
                      const dayOfWeek = new Date(date).getDay();
                      const schedule = recordsSummary.schedules.find(s => s.dayOfWeek === dayOfWeek);
                      const breaks = recordsSummary.scheduleBreaksMap[dayOfWeek] || [];
                      
                      const entryRecords = dayRecords.filter(r => r.type === 'checkin' || r.type === 'entry');
                      const exitRecords = dayRecords.filter(r => r.type === 'checkout' || r.type === 'exit');

                      return (
                        <tr key={date} className="hover:bg-neutral-light/50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-dark">
                              {new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {entryRecords.map((record, idx) => (
                                <div key={record.id} className="text-sm">
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 font-mono">
                                    🟢 {formatTime(record.timestamp)}
                                  </span>
                                </div>
                              ))}
                              {entryRecords.length === 0 && (
                                <span className="text-xs text-neutral-medium italic">Sin entrada</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {exitRecords.map((record, idx) => (
                                <div key={record.id} className="text-sm">
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-800 font-mono">
                                    🔴 {formatTime(record.timestamp)}
                                  </span>
                                </div>
                              ))}
                              {exitRecords.length === 0 && (
                                <span className="text-xs text-neutral-medium italic">Sin salida</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {breaks.length > 0 ? (
                              <div className="space-y-1">
                                {breaks.map((breakItem, idx) => (
                                  <div key={breakItem.id} className="text-xs">
                                    <span className="font-medium text-blue-900">{breakItem.name || `Pausa ${idx + 1}`}</span>
                                    <span className="text-blue-700 font-mono ml-1">
                                      {breakItem.startTime}-{breakItem.endTime}
                                    </span>
                                    {breakItem.isPaid && (
                                      <span className="ml-1 px-1 py-0.5 bg-green-100 text-green-800 rounded text-[10px]">P</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-medium italic">Sin pausas</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {schedule ? (
                              <div className="text-xs">
                                <div className="font-mono text-neutral-dark">
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-medium italic">No laboral</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Informe de Cumplimiento */}
        {complianceReport && (
          <div className="border-t border-neutral-mid/20 pt-6 mt-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-neutral-dark">
                📋 Informe de Incumplimientos - Del {startDate} al {endDate}
              </h3>
              <p className="text-sm text-neutral-medium mt-1">
                Empleados con incidencias detectadas
              </p>
            </div>

            {/* Solo mostrar empleados con problemas */}
            {complianceReport.filter(r => r.issues.length > 0).length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h4 className="text-xl font-semibold text-green-800 mb-2">
                  ¡Excelente! Todos los empleados cumplieron con sus horarios
                </h4>
                <p className="text-green-700">
                  No se detectaron incidencias en el período seleccionado
                </p>
              </div>
            ) : (
              <>
                {/* Tabla de incumplimientos */}
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-neutral-mid/20 border border-neutral-mid/20">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">
                          Empleado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">
                          Incidencias
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-mid/20">
                      {complianceReport
                        .filter(r => r.issues.length > 0)
                        .map((employeeReport) => (
                          employeeReport.issues.map((dayIssue, dayIdx) => (
                            <tr key={`${employeeReport.employee.id}-${dayIdx}`} className="hover:bg-red-50">
                              {dayIdx === 0 && (
                                <td 
                                  className="px-4 py-3 border-r border-neutral-mid/20" 
                                  rowSpan={employeeReport.issues.length}
                                >
                                  <div className="font-semibold text-neutral-dark">
                                    {employeeReport.employee.name}
                                  </div>
                                  <div className="text-xs text-neutral-medium">
                                    {employeeReport.employee.employeeCode}
                                  </div>
                                  <div className="mt-2 text-xs">
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-semibold">
                                      {employeeReport.daysWithIssues} {employeeReport.daysWithIssues === 1 ? 'día' : 'días'} con problemas
                                    </span>
                                  </div>
                                </td>
                              )}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-dark">
                                  {new Date(dayIssue.date).toLocaleDateString('es-ES', { 
                                    weekday: 'long', 
                                    day: '2-digit', 
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <ul className="space-y-1">
                                  {dayIssue.issues.map((issue, issueIdx) => (
                                    <li key={issueIdx} className="text-sm text-neutral-dark flex items-start gap-2">
                                      <span className="text-red-600 font-bold">•</span>
                                      <span>{issue}</span>
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          ))
                        ))
                      }
                    </tbody>
                  </table>
                </div>

                {/* Resumen de empleados con problemas */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-3">
                    ⚠️ Resumen de Incumplimientos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded p-3 border border-red-200">
                      <div className="text-2xl font-bold text-red-600">
                        {complianceReport.filter(r => r.issues.length > 0).length}
                      </div>
                      <div className="text-xs text-neutral-medium">
                        Empleados con incidencias
                      </div>
                    </div>
                    <div className="bg-white rounded p-3 border border-red-200">
                      <div className="text-2xl font-bold text-red-600">
                        {complianceReport.reduce((sum, r) => sum + r.daysWithIssues, 0)}
                      </div>
                      <div className="text-xs text-neutral-medium">
                        Total días con problemas
                      </div>
                    </div>
                    <div className="bg-white rounded p-3 border border-red-200">
                      <div className="text-2xl font-bold text-green-600">
                        {complianceReport.filter(r => r.issues.length === 0).length}
                      </div>
                      <div className="text-xs text-neutral-medium">
                        Empleados sin incidencias
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de empleados sin problemas */}
                {complianceReport.filter(r => r.issues.length === 0).length > 0 && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3">
                      ✅ Empleados con Cumplimiento Perfecto
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {complianceReport
                        .filter(r => r.issues.length === 0)
                        .map((employeeReport) => (
                          <span 
                            key={employeeReport.employee.id}
                            className="px-3 py-1 bg-white border border-green-300 rounded-full text-sm text-green-800"
                          >
                            {employeeReport.employee.name}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
