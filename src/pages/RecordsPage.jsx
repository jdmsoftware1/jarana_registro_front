import React, { useState, useEffect } from 'react';
import { Calendar, Clock, LogIn, LogOut, Filter, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { api } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0
  });

  useEffect(() => {
    fetchRecords();
  }, [filters, pagination.offset]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await api.getRecords(params);
      setRecords(response.records);
      setPagination(prev => ({
        ...prev,
        total: response.total
      }));
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };

  const setQuickFilter = (months) => {
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    
    setFilters(prev => ({
      ...prev,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    }));
  };

  const calculateWorkingHours = () => {
    const pairs = [];
    let currentCheckin = null;

    records.forEach(record => {
      if (record.type === 'checkin') {
        currentCheckin = record;
      } else if (record.type === 'checkout' && currentCheckin) {
        pairs.push({
          checkin: currentCheckin,
          checkout: record,
          duration: new Date(record.timestamp) - new Date(currentCheckin.timestamp)
        });
        currentCheckin = null;
      }
    });

    const totalMs = pairs.reduce((sum, pair) => sum + pair.duration, 0);
    const totalHours = totalMs / (1000 * 60 * 60);
    
    return { pairs, totalHours };
  };

  const { pairs, totalHours } = calculateWorkingHours();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Registros</h1>
        <p className="text-gray-600">Consulta tu historial de fichajes y horas trabajadas</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Registros</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Días Trabajados</p>
              <p className="text-2xl font-bold text-gray-900">{pairs.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Horas Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Desde:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Hasta:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Tipo:</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input text-sm"
            >
              <option value="">Todos</option>
              <option value="checkin">Entrada</option>
              <option value="checkout">Salida</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setQuickFilter(1)}
              className="btn btn-secondary text-sm"
            >
              Último mes
            </button>
            <button
              onClick={() => setQuickFilter(3)}
              className="btn btn-secondary text-sm"
            >
              3 meses
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Historial de Fichajes
          </h2>
          <button className="btn btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay registros en el período seleccionado</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispositivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {record.type === 'checkin' ? (
                            <LogIn className="h-5 w-5 text-green-600 mr-2" />
                          ) : (
                            <LogOut className="h-5 w-5 text-red-600 mr-2" />
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.type === 'checkin'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.type === 'checkin' ? 'Entrada' : 'Salida'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(record.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.device}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total} registros
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                  disabled={pagination.offset === 0}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecordsPage;
