import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Coffee,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import ScheduleBreaksManager from '../components/ScheduleBreaksManager';

const AdvancedSchedulingDashboard = () => {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [effectiveSchedule, setEffectiveSchedule] = useState(null);
  const [conflicts, setConflicts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEffectiveSchedule();
      analyzeConflicts();
    }
  }, [selectedEmployee, selectedDate]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employees`);
      if (!response.ok) throw new Error('Error al cargar empleados');
      const data = await response.json();
      setEmployees(data.data || []);
      if (data.data && data.data.length > 0) {
        setSelectedEmployee(data.data[0]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Aquí podrías crear un endpoint específico para estadísticas del dashboard
      // Por ahora simulamos con datos básicos
      const currentYear = new Date().getFullYear();
      
      const templatesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedule-templates`);
      const templatesData = await templatesResponse.json();
      
      setStats({
        totalTemplates: templatesData.data?.length || 0,
        activeTemplates: templatesData.data?.filter(t => t.isActive).length || 0,
        totalEmployees: employees.length,
        scheduledEmployees: 0 // Esto se podría calcular con más datos
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEffectiveSchedule = async () => {
    if (!selectedEmployee || !selectedDate) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/advanced-breaks/employee/${selectedEmployee.id}/effective-breaks/${selectedDate}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setEffectiveSchedule(data.data);
      } else {
        setEffectiveSchedule(null);
      }
    } catch (err) {
      console.error('Error fetching effective schedule:', err);
      setEffectiveSchedule(null);
    }
  };

  const analyzeConflicts = async () => {
    if (!selectedEmployee) return;
    
    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 7);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/advanced-breaks/employee/${selectedEmployee.id}/analyze-conflicts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setConflicts(data.data.analysis);
      }
    } catch (err) {
      console.error('Error analyzing conflicts:', err);
    }
  };

  const generateReport = async () => {
    if (!selectedEmployee) return;
    
    try {
      const startDate = new Date(selectedDate);
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date(selectedDate);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/advanced-breaks/employee/${selectedEmployee.id}/report?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Aquí podrías procesar el reporte o descargarlo
        console.log('Report data:', data);
        alert('Reporte generado exitosamente (ver consola)');
      }
    } catch (err) {
      alert('Error al generar reporte: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Horarios Avanzados</h1>
        <p className="text-gray-600">Vista general del sistema de horarios, plantillas y pausas</p>
      </div>

      {/* Estadísticas generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plantillas Activas</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeTemplates}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.totalTemplates} plantillas totales
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Empleados</p>
                <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Empleados registrados
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conflictos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {conflicts?.conflictCount || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Últimas 2 semanas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horarios Efectivos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {effectiveSchedule?.effectiveBreaks?.isWorkingDay ? '✓' : '✗'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Fecha seleccionada
            </p>
          </div>
        </div>
      )}

      {/* Controles de empleado y fecha */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empleado
              </label>
              <select
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const employee = employees.find(emp => emp.id === e.target.value);
                  setSelectedEmployee(employee);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={generateReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Generar Reporte
            </button>
            <button
              onClick={() => {
                fetchEffectiveSchedule();
                analyzeConflicts();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Horario efectivo del día */}
      {selectedEmployee && effectiveSchedule && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del horario */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horario Efectivo - {new Date(selectedDate).toLocaleDateString('es-ES')}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Empleado:</span>
                <span className="text-sm text-gray-900">{effectiveSchedule.employee.name}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Fuente:</span>
                <span className="text-sm text-gray-900 capitalize">
                  {effectiveSchedule.effectiveBreaks.source.replace('_', ' ')}
                </span>
              </div>

              {effectiveSchedule.effectiveBreaks.isWorkingDay ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Horario:</span>
                    <span className="text-sm font-mono text-green-700">
                      {effectiveSchedule.effectiveBreaks.workStartTime} - {effectiveSchedule.effectiveBreaks.workEndTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Pausas:</span>
                    <span className="text-sm text-blue-700">
                      {effectiveSchedule.effectiveBreaks.breaks.length} pausas configuradas
                    </span>
                  </div>

                  {effectiveSchedule.workTimeStats && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg text-center">
                        <div className="text-lg font-semibold text-purple-700">
                          {effectiveSchedule.workTimeStats.totalHours}h
                        </div>
                        <div className="text-xs text-purple-600">Tiempo Total</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <div className="text-lg font-semibold text-green-700">
                          {effectiveSchedule.workTimeStats.effectiveHours}h
                        </div>
                        <div className="text-xs text-green-600">Tiempo Efectivo</div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-gray-100 rounded-lg text-center">
                  <div className="text-gray-600">Día no laboral</div>
                </div>
              )}
            </div>
          </div>

          {/* Análisis de conflictos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Análisis de Conflictos
            </h2>

            {conflicts ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Período:</span>
                  <span className="text-sm text-gray-900">
                    {conflicts.dateRange.startDate} - {conflicts.dateRange.endDate}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Conflictos:</span>
                  <span className={`text-sm font-semibold ${
                    conflicts.hasConflicts ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {conflicts.conflictCount} encontrados
                  </span>
                </div>

                {conflicts.hasConflicts && conflicts.conflicts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Detalles:</h4>
                    {conflicts.conflicts.slice(0, 3).map((conflict, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="font-medium text-red-800">
                          {conflict.date}
                        </div>
                        <div className="text-red-600">
                          {conflict.errors?.length || 0} errores detectados
                        </div>
                      </div>
                    ))}
                    {conflicts.conflicts.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{conflicts.conflicts.length - 3} conflictos más...
                      </div>
                    )}
                  </div>
                )}

                {!conflicts.hasConflicts && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-green-700 font-medium">Sin conflictos detectados</div>
                    <div className="text-green-600 text-sm">Los horarios están correctamente configurados</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">Cargando análisis de conflictos...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gestión de pausas */}
      {selectedEmployee && effectiveSchedule?.effectiveBreaks?.isWorkingDay && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ScheduleBreaksManager
            parentType={effectiveSchedule.effectiveBreaks.source}
            parentId={effectiveSchedule.effectiveBreaks.sourceId}
            workStartTime={effectiveSchedule.effectiveBreaks.workStartTime}
            workEndTime={effectiveSchedule.effectiveBreaks.workEndTime}
            readOnly={effectiveSchedule.effectiveBreaks.source === 'none'}
          />
        </div>
      )}

      {/* Enlaces rápidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Enlaces Rápidos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/schedule-templates"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Plantillas de Horarios</div>
                <div className="text-sm text-gray-600">Gestionar plantillas reutilizables</div>
              </div>
            </div>
          </a>

          <a
            href="/weekly-scheduling"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Planificación Semanal</div>
                <div className="text-sm text-gray-600">Planificar horarios por semanas</div>
              </div>
            </div>
          </a>

          <a
            href="/admin"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">Panel de Administración</div>
                <div className="text-sm text-gray-600">Gestión general del sistema</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSchedulingDashboard;
