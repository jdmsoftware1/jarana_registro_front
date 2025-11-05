import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Coffee,
  Utensils,
  User,
  AlertCircle,
  CheckCircle,
  Move,
  Save,
  X
} from 'lucide-react';

const ScheduleBreaksManager = ({ 
  parentType, 
  parentId, 
  workStartTime = '09:00', 
  workEndTime = '17:00',
  onBreaksChange = () => {},
  readOnly = false 
}) => {
  const [breaks, setBreaks] = useState([]);
  const [breakTypes, setBreakTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBreak, setEditingBreak] = useState(null);
  const [stats, setStats] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    startTime: '10:00',
    endTime: '10:15',
    breakType: 'rest',
    isPaid: true,
    isRequired: false,
    description: '',
    isFlexible: false,
    flexibilityMinutes: 0,
    sortOrder: 0
  });

  // Cargar pausas
  const fetchBreaks = async () => {
    if (!parentType || !parentId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedule-breaks/${parentType}/${parentId}`);
      if (!response.ok) throw new Error('Error al cargar pausas');
      
      const data = await response.json();
      setBreaks(data.data || []);
      setStats(data.stats);
      onBreaksChange(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar tipos de pausas
  const fetchBreakTypes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedule-breaks/utils/break-types`);
      if (!response.ok) throw new Error('Error al cargar tipos de pausas');
      
      const data = await response.json();
      setBreakTypes(data.data || []);
    } catch (err) {
      console.error('Error loading break types:', err);
    }
  };

  useEffect(() => {
    fetchBreaks();
    fetchBreakTypes();
  }, [parentType, parentId]);

  // Crear pausa
  const handleCreateBreak = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedule-breaks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parentType,
          parentId,
          createdBy: localStorage.getItem('userId')
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear pausa');
      }
      
      await fetchBreaks();
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Actualizar pausa
  const handleUpdateBreak = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedule-breaks/${editingBreak.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar pausa');
      }
      
      await fetchBreaks();
      resetForm();
      setEditingBreak(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Eliminar pausa
  const handleDeleteBreak = async (breakId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta pausa?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedule-breaks/${breakId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar pausa');
      
      await fetchBreaks();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Aplicar pausas por defecto
  const handleApplyDefaultBreaks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedule-breaks/utils/default-breaks`);
      if (!response.ok) throw new Error('Error al obtener pausas por defecto');
      
      const data = await response.json();
      const defaultBreaks = data.data;

      const bulkResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedule-breaks/bulk/${parentType}/${parentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breaks: defaultBreaks,
          createdBy: localStorage.getItem('userId'),
          workStartTime,
          workEndTime
        })
      });

      if (!bulkResponse.ok) {
        const errorData = await bulkResponse.json();
        throw new Error(errorData.error || 'Error al aplicar pausas por defecto');
      }
      
      await fetchBreaks();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '10:00',
      endTime: '10:15',
      breakType: 'rest',
      isPaid: true,
      isRequired: false,
      description: '',
      isFlexible: false,
      flexibilityMinutes: 0,
      sortOrder: breaks.length + 1
    });
  };

  // Abrir formulario de edición
  const openEditForm = (breakItem) => {
    setEditingBreak(breakItem);
    setFormData({
      name: breakItem.name,
      startTime: breakItem.startTime,
      endTime: breakItem.endTime,
      breakType: breakItem.breakType,
      isPaid: breakItem.isPaid,
      isRequired: breakItem.isRequired,
      description: breakItem.description || '',
      isFlexible: breakItem.isFlexible,
      flexibilityMinutes: breakItem.flexibilityMinutes || 0,
      sortOrder: breakItem.sortOrder
    });
  };

  // Obtener icono por tipo de pausa
  const getBreakIcon = (breakType) => {
    switch (breakType) {
      case 'meal': return <Utensils className="h-4 w-4" />;
      case 'rest': return <Coffee className="h-4 w-4" />;
      case 'personal': return <User className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Obtener color por tipo de pausa
  const getBreakColor = (breakType, isPaid) => {
    if (!isPaid) return 'text-red-600 bg-red-50 border-red-200';
    
    switch (breakType) {
      case 'meal': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'rest': return 'text-green-600 bg-green-50 border-green-200';
      case 'personal': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Pausas del Horario</h3>
          <p className="text-sm text-gray-600">
            Gestiona las pausas y descansos para este horario
          </p>
        </div>
        
        {!readOnly && (
          <div className="flex gap-2">
            <button
              onClick={handleApplyDefaultBreaks}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Pausas Estándar
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Añadir Pausa
            </button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{breaks.length}</div>
              <div className="text-sm text-gray-600">Total Pausas</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">{stats.paidHours}h</div>
              <div className="text-sm text-gray-600">Pagadas</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">{stats.unpaidHours}h</div>
              <div className="text-sm text-gray-600">No Pagadas</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">{stats.totalHours}h</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Lista de pausas */}
      <div className="space-y-2">
        {breaks.map((breakItem, index) => (
          <div
            key={breakItem.id}
            className={`border rounded-lg p-4 ${getBreakColor(breakItem.breakType, breakItem.isPaid)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getBreakIcon(breakItem.breakType)}
                  <span className="font-medium">{breakItem.name}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-mono">
                    {breakItem.startTime} - {breakItem.endTime}
                  </span>
                  
                  <span className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs">
                    {breakItem.isPaid ? 'Pagada' : 'No Pagada'}
                  </span>
                  
                  {breakItem.isRequired && (
                    <span className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs">
                      Obligatoria
                    </span>
                  )}
                  
                  {breakItem.isFlexible && (
                    <span className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs">
                      ±{breakItem.flexibilityMinutes}min
                    </span>
                  )}
                </div>
              </div>

              {!readOnly && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditForm(breakItem)}
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBreak(breakItem.id)}
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {breakItem.description && (
              <div className="mt-2 text-sm opacity-75">
                {breakItem.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay pausas */}
      {breaks.length === 0 && !loading && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Coffee className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-4">No hay pausas configuradas</p>
          {!readOnly && (
            <div className="space-x-2">
              <button
                onClick={handleApplyDefaultBreaks}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Aplicar Pausas Estándar
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear Primera Pausa
              </button>
            </div>
          )}
        </div>
      )}

      {/* Formulario de añadir/editar pausa */}
      {(showAddForm || editingBreak) && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">
            {editingBreak ? 'Editar Pausa' : 'Nueva Pausa'}
          </h4>

          <form onSubmit={editingBreak ? handleUpdateBreak : handleCreateBreak} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Pausa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Desayuno, Almuerzo, Merienda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pausa
                </label>
                <select
                  value={formData.breakType}
                  onChange={(e) => {
                    const selectedType = breakTypes.find(t => t.value === e.target.value);
                    setFormData({ 
                      ...formData, 
                      breakType: e.target.value,
                      isPaid: selectedType?.isPaid ?? true
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {breakTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Inicio *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Fin *
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPaid}
                  onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">Pausa Pagada</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">Obligatoria</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFlexible}
                  onChange={(e) => setFormData({ ...formData, isFlexible: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">Horario Flexible</span>
              </label>
            </div>

            {formData.isFlexible && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flexibilidad (minutos)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.flexibilityMinutes}
                  onChange={(e) => setFormData({ ...formData, flexibilityMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 15 (±15 minutos)"
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingBreak(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingBreak ? 'Actualizar' : 'Crear'} Pausa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ScheduleBreaksManager;
