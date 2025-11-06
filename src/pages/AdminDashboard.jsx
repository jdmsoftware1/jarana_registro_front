import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  Download
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import AIChat from '../components/AIChat';

// Helper function for API URL
const getApiUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${baseUrl}/api`;
};

// Helper function for authenticated fetch
const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : '',
  };
  
  return fetch(url, {
    ...options,
    headers
  });
};

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
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { deactivateSystem, getSessionDuration } = useSystem();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const sessionDuration = getSessionDuration();

  // Doble verificación de seguridad
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  // Verificar que sea admin
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'records', label: 'Registros', icon: Clock },
    { id: 'schedules', label: 'Horarios', icon: Calendar },
    { id: 'vacations', label: 'Vacaciones', icon: Shield },
    { id: 'weekly', label: 'Vista Semanal', icon: FileText },
    { id: 'ai-insights', label: 'IA Insights', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleDeactivateSystem = () => {
    if (confirm('¿Estás seguro de que quieres desactivar el sistema? Esto cerrará tu sesión y los empleados no podrán fichar hasta que se reactive.')) {
      deactivateSystem();
      // Cerrar sesión y redirigir
      logout();
      navigate('/', { replace: true });
      window.location.reload(); // Forzar recarga completa
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
                onClick={handleBackToHome}
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
        {activeTab === 'schedules' && <SchedulesContent />}
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
        authenticatedFetch(`${getApiUrl()}/employees`),
        authenticatedFetch(`${getApiUrl()}/records/all`)
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
      const response = await authenticatedFetch(`${getApiUrl()}/employees`);
      
      if (response.ok) {
        const employeesData = await response.json();
        setEmployees(employeesData);
        
        // Obtener último registro para cada empleado
        const employeesWithLastRecord = await Promise.all(
          employeesData.map(async (employee) => {
            try {
              const recordsResponse = await authenticatedFetch(`${getApiUrl()}/records/employee/${employee.id}?limit=1`);
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
              const response = await authenticatedFetch(`${getApiUrl()}/employees/${selectedEmployee.id}/regenerate-totp`, {
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
  const [loading, setLoading] = useState(true);

  // Cargar registros
  const fetchRecords = async () => {
    try {
      const response = await authenticatedFetch(`${getApiUrl()}/records/all`);
      
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRecords();
  }, []);

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
          <button className="inline-flex items-center px-4 py-2 border border-neutral-mid/30 text-neutral-dark rounded-lg hover:bg-neutral-light transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-brand-light text-brand-cream rounded-lg hover:bg-brand-medium transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

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
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-brand-medium">
                  No hay registros de fichajes
                </td>
              </tr>
            ) : (
              records.map((record) => (
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
const SchedulesContent = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar empleados
  const fetchEmployees = async () => {
    try {
      const response = await authenticatedFetch(`${getApiUrl()}/employees`);
      
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
        authenticatedFetch(`${getApiUrl()}/vacations`),
        authenticatedFetch(`${getApiUrl()}/employees`)
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
      const response = await authenticatedFetch(`${getApiUrl()}/vacations/${vacationId}/status`, {
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
      const employeesResponse = await authenticatedFetch(`${getApiUrl()}/employees`);
      
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);

        // Fetch schedules for each employee
        const schedulesData = {};
        for (const employee of employeesData) {
          try {
            const scheduleResponse = await authenticatedFetch(`${getApiUrl()}/schedules/employee/${employee.id}`);
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
        authenticatedFetch(`${getApiUrl()}/ai/anomalies-summary?days=${selectedPeriod}`),
        authenticatedFetch(`${getApiUrl()}/ai/smart-alerts`)
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
      const response = await authenticatedFetch(`${getApiUrl()}/employees`, {
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
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const daysOfWeek = [
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' },
    { id: 0, name: 'Domingo' }
  ];

  // Load existing schedules or initialize with defaults
  React.useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await authenticatedFetch(`${getApiUrl()}/schedules/employee/${employee.id}`);
        
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
  }, [employee.id]);

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
      const response = await authenticatedFetch(`${getApiUrl()}/schedules/employee/${employee.id}`, {
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
        <h3 className="text-lg font-semibold text-neutral-dark mb-4">
          Horarios de {employee.name} ({employee.employeeCode})
        </h3>

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
      const response = await authenticatedFetch(`${getApiUrl()}/vacations`, {
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

export default AdminDashboard;
