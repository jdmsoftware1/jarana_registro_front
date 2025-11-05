import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Clock,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Filter
} from 'lucide-react';

const WeeklySchedulingPage = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    fetchEmployees();
    fetchTemplates();
  }, []);

  // Cargar horarios semanales cuando cambie el empleado o año
  useEffect(() => {
    if (selectedEmployee) {
      fetchWeeklySchedules();
    }
  }, [selectedEmployee, currentYear]);

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

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedule-templates/active`);
      if (!response.ok) throw new Error('Error al cargar plantillas');
      const data = await response.json();
      setTemplates(data.data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const fetchWeeklySchedules = async () => {
    if (!selectedEmployee) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/weekly-schedules/employee/${selectedEmployee.id}/year/${currentYear}`
      );
      if (!response.ok) throw new Error('Error al cargar horarios semanales');
      const data = await response.json();
      setWeeklySchedules(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generar semanas del año
  const generateWeeksOfYear = (year) => {
    const weeks = [];
    const startOfYear = new Date(year, 0, 1);
    
    // Encontrar el primer lunes del año
    let currentDate = new Date(startOfYear);
    while (currentDate.getDay() !== 1) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    let weekNumber = 1;
    while (currentDate.getFullYear() === year && weekNumber <= 53) {
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + 6);
      
      weeks.push({
        weekNumber,
        startDate: new Date(currentDate),
        endDate: new Date(endDate),
        hasSchedule: weeklySchedules.some(ws => ws.weekNumber === weekNumber)
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
      
      if (endDate.getFullYear() > year) break;
    }
    
    return weeks;
  };

  const weeks = generateWeeksOfYear(currentYear);

  // Crear/actualizar horario semanal
  const handleCreateWeeklySchedule = async (weekNumber, templateId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/weekly-schedules/employee/${selectedEmployee.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: currentYear,
            weekNumber,
            templateId,
            createdBy: localStorage.getItem('userId')
          })
        }
      );

      if (!response.ok) throw new Error('Error al crear horario semanal');
      
      await fetchWeeklySchedules();
      setShowPlanModal(false);
      setSelectedWeek(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Planificar año completo
  const handlePlanifyYear = async (templateId) => {
    if (!confirm(`¿Planificar todo el año ${currentYear} con la plantilla seleccionada?`)) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/advanced-scheduling/employee/${selectedEmployee.id}/planify-year`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: currentYear,
            templateId,
            createdBy: localStorage.getItem('userId'),
            options: {
              skipExistingWeeks: true
            }
          })
        }
      );

      if (!response.ok) throw new Error('Error al planificar año');
      
      const result = await response.json();
      await fetchWeeklySchedules();
      alert(`Año planificado exitosamente: ${result.summary.successful}/${result.summary.totalWeeksProcessed} semanas`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Eliminar horario semanal
  const handleDeleteWeeklySchedule = async (weekNumber) => {
    if (!confirm('¿Eliminar el horario de esta semana?')) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/weekly-schedules/employee/${selectedEmployee.id}/week/${currentYear}/${weekNumber}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Error al eliminar horario semanal');
      
      await fetchWeeklySchedules();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const getWeekSchedule = (weekNumber) => {
    return weeklySchedules.find(ws => ws.weekNumber === weekNumber);
  };

  if (loading && !selectedEmployee) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Planificación Semanal</h1>
        <p className="text-gray-600">Planifica horarios por semanas específicas del año</p>
      </div>

      {/* Controles superiores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Selector de empleado */}
          <div className="flex items-center gap-4">
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

            {/* Selector de año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentYear(currentYear - 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-lg font-semibold px-4">{currentYear}</span>
                <button
                  onClick={() => setCurrentYear(currentYear + 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handlePlanifyYear(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Planificar Año Completo</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Estadísticas */}
      {selectedEmployee && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{weeks.length}</div>
              <div className="text-sm text-gray-600">Total Semanas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {weeklySchedules.length}
              </div>
              <div className="text-sm text-gray-600">Planificadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {weeks.length - weeklySchedules.length}
              </div>
              <div className="text-sm text-gray-600">Sin Planificar</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((weeklySchedules.length / weeks.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Completado</div>
            </div>
          </div>
        </div>
      )}

      {/* Calendario de semanas */}
      {selectedEmployee && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Calendario Semanal - {selectedEmployee.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weeks.map((week) => {
              const schedule = getWeekSchedule(week.weekNumber);
              const hasSchedule = !!schedule;

              return (
                <div
                  key={week.weekNumber}
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                    hasSchedule 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Header de la semana */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        Semana {week.weekNumber}
                      </span>
                    </div>
                    {hasSchedule ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>

                  {/* Fechas */}
                  <div className="text-sm text-gray-600 mb-3">
                    {formatDate(week.startDate)} - {formatDate(week.endDate)}
                  </div>

                  {/* Información del horario */}
                  {hasSchedule && schedule.template ? (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-900">
                        {schedule.template.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {schedule.template.description}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mb-3">
                      Sin horario asignado
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2">
                    {hasSchedule ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedWeek(week.weekNumber);
                            setShowPlanModal(true);
                          }}
                          className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-1 text-xs"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteWeeklySchedule(week.weekNumber)}
                          className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedWeek(week.weekNumber);
                          setShowPlanModal(true);
                        }}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Planificar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de planificación */}
      {showPlanModal && selectedWeek && (
        <PlanWeekModal
          isOpen={showPlanModal}
          weekNumber={selectedWeek}
          year={currentYear}
          employee={selectedEmployee}
          templates={templates}
          existingSchedule={getWeekSchedule(selectedWeek)}
          onPlan={handleCreateWeeklySchedule}
          onClose={() => {
            setShowPlanModal(false);
            setSelectedWeek(null);
          }}
        />
      )}
    </div>
  );
};

// Modal para planificar semana
const PlanWeekModal = ({ 
  isOpen, 
  weekNumber, 
  year, 
  employee, 
  templates, 
  existingSchedule,
  onPlan, 
  onClose 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(existingSchedule?.templateId || '');
  const [notes, setNotes] = useState(existingSchedule?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTemplate) {
      alert('Selecciona una plantilla');
      return;
    }
    onPlan(weekNumber, selectedTemplate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {existingSchedule ? 'Editar' : 'Planificar'} Semana {weekNumber}
          </h2>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">
              <strong>Empleado:</strong> {employee.name}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Año:</strong> {year}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plantilla de Horario *
              </label>
              <select
                required
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar plantilla...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas adicionales para esta semana..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {existingSchedule ? 'Actualizar' : 'Planificar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedulingPage;
