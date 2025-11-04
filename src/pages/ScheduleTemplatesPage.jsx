import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Users, 
  Clock, 
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/apiHelper';

const ScheduleTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [employees, setEmployees] = useState([]);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateDays: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorkingDay: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorkingDay: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorkingDay: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorkingDay: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorkingDay: true },
      { dayOfWeek: 6, startTime: '', endTime: '', breakStartTime: '', breakEndTime: '', isWorkingDay: false },
      { dayOfWeek: 0, startTime: '', endTime: '', breakStartTime: '', breakEndTime: '', isWorkingDay: false }
    ]
  });

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Cargar plantillas
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiGet('schedule-templates');
      setTemplates(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar empleados
  const fetchEmployees = async () => {
    try {
      const data = await apiGet('employees');
      setEmployees(data.data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchEmployees();
  }, []);

  // Filtrar plantillas
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && template.isActive) ||
                         (filterStatus === 'inactive' && !template.isActive);
    return matchesSearch && matchesFilter;
  });

  // Crear plantilla
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      await apiPost('schedule-templates', {
        ...formData,
        createdBy: localStorage.getItem('userId') // Asumiendo que tienes el userId guardado
      });
      
      await fetchTemplates();
      setShowCreateModal(false);
      resetForm();
      alert('Plantilla creada exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Actualizar plantilla
  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    try {
      await apiPut(`schedule-templates/${selectedTemplate.id}`, formData);
      
      await fetchTemplates();
      setShowEditModal(false);
      resetForm();
      alert('Plantilla actualizada exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Eliminar plantilla
  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) return;
    
    try {
      await apiDelete(`schedule-templates/${templateId}`);
      
      await fetchTemplates();
      alert('Plantilla eliminada exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Aplicar plantilla a empleados
  const handleApplyTemplate = async (employeeIds) => {
    try {
      const result = await apiPost(`schedule-templates/${selectedTemplate.id}/apply`, {
        employeeIds,
        createdBy: localStorage.getItem('userId')
      });
      
      setShowApplyModal(false);
      alert(`Plantilla aplicada exitosamente a ${result.summary.successful}/${result.summary.total} empleados`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      templateDays: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorkingDay: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorkingDay: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorkingDay: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorkingDay: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorkingDay: true },
        { dayOfWeek: 6, startTime: '', endTime: '', breakStartTime: '', breakEndTime: '', isWorkingDay: false },
        { dayOfWeek: 0, startTime: '', endTime: '', breakStartTime: '', breakEndTime: '', isWorkingDay: false }
      ]
    });
  };

  // Abrir modal de edición
  const openEditModal = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      templateDays: template.templateDays || []
    });
    setShowEditModal(true);
  };

  // Abrir modal de aplicación
  const openApplyModal = (template) => {
    setSelectedTemplate(template);
    setShowApplyModal(true);
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plantillas de Horarios</h1>
        <p className="text-gray-600">Gestiona plantillas reutilizables para asignar a múltiples empleados</p>
      </div>

      {/* Controles superiores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Plantilla
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Lista de plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                {template.isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900">
                  {template.templateDays?.filter(day => day.isWorkingDay).length || 0}
                </div>
                <div className="text-xs text-gray-600">Días laborales</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900">
                  {template.appliedCount || 0}
                </div>
                <div className="text-xs text-gray-600">Empleados</div>
              </div>
            </div>

            {/* Horarios resumidos */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Horarios:</h4>
              <div className="space-y-1">
                {template.templateDays?.filter(day => day.isWorkingDay).slice(0, 3).map((day) => (
                  <div key={day.dayOfWeek} className="flex justify-between text-xs text-gray-600">
                    <span>{dayNames[day.dayOfWeek]}</span>
                    <span>{day.startTime} - {day.endTime}</span>
                  </div>
                ))}
                {template.templateDays?.filter(day => day.isWorkingDay).length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{template.templateDays.filter(day => day.isWorkingDay).length - 3} más...
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(template)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 text-sm"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => openApplyModal(template)}
                className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2 text-sm"
              >
                <Users className="h-4 w-4" />
                Aplicar
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay plantillas */}
      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'No se encontraron plantillas con los filtros aplicados'
              : 'Crea tu primera plantilla de horarios para comenzar'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Crear Primera Plantilla
            </button>
          )}
        </div>
      )}

      {/* Modal de creación/edición */}
      {(showCreateModal || showEditModal) && (
        <TemplateFormModal
          isOpen={showCreateModal || showEditModal}
          isEdit={showEditModal}
          formData={formData}
          setFormData={setFormData}
          onSubmit={showEditModal ? handleUpdateTemplate : handleCreateTemplate}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          dayNames={dayNames}
        />
      )}

      {/* Modal de aplicación */}
      {showApplyModal && (
        <ApplyTemplateModal
          isOpen={showApplyModal}
          template={selectedTemplate}
          employees={employees}
          onApply={handleApplyTemplate}
          onClose={() => setShowApplyModal(false)}
        />
      )}
    </div>
  );
};

// Componente del modal de formulario
const TemplateFormModal = ({ isOpen, isEdit, formData, setFormData, onSubmit, onClose, dayNames }) => {
  if (!isOpen) return null;

  const updateTemplateDay = (dayIndex, field, value) => {
    const newTemplateDays = [...formData.templateDays];
    newTemplateDays[dayIndex] = { ...newTemplateDays[dayIndex], [field]: value };
    setFormData({ ...formData, templateDays: newTemplateDays });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h2>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Plantilla *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Horario Oficina Estándar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción opcional"
                />
              </div>
            </div>

            {/* Horarios por día */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios por Día</h3>
              <div className="space-y-4">
                {formData.templateDays.map((day, index) => (
                  <div key={day.dayOfWeek} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{dayNames[day.dayOfWeek]}</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={day.isWorkingDay}
                          onChange={(e) => updateTemplateDay(index, 'isWorkingDay', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Día laboral</span>
                      </label>
                    </div>

                    {day.isWorkingDay && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Hora inicio
                          </label>
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => updateTemplateDay(index, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Hora fin
                          </label>
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => updateTemplateDay(index, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pausa inicio
                          </label>
                          <input
                            type="time"
                            value={day.breakStartTime}
                            onChange={(e) => updateTemplateDay(index, 'breakStartTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pausa fin
                          </label>
                          <input
                            type="time"
                            value={day.breakEndTime}
                            onChange={(e) => updateTemplateDay(index, 'breakEndTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Botones */}
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
                {isEdit ? 'Actualizar' : 'Crear'} Plantilla
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente del modal de aplicación
const ApplyTemplateModal = ({ isOpen, template, employees, onApply, onClose }) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAll = () => {
    setSelectedEmployees(filteredEmployees.map(emp => emp.id));
  };

  const clearAll = () => {
    setSelectedEmployees([]);
  };

  const handleApply = () => {
    if (selectedEmployees.length === 0) {
      alert('Selecciona al menos un empleado');
      return;
    }
    onApply(selectedEmployees);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Aplicar Plantilla: {template?.name}
          </h2>

          {/* Búsqueda y controles */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={selectAll}
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              Todos
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Ninguno
            </button>
          </div>

          {/* Lista de empleados */}
          <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto mb-4">
            {filteredEmployees.map((employee) => (
              <label
                key={employee.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={() => toggleEmployee(employee.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{employee.name}</div>
                  <div className="text-sm text-gray-600">{employee.employeeCode}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Resumen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-blue-800">
              <strong>{selectedEmployees.length}</strong> empleados seleccionados
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Aplicar Plantilla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTemplatesPage;
