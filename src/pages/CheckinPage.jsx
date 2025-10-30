import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, MapPin, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../utils/api';
import { useUser } from '@clerk/clerk-react';
import LoadingSpinner from '../components/LoadingSpinner';

const CheckinPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useUser();

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    try {
      const statusData = await api.getStatus();
      setStatus(statusData);
    } catch (error) {
      console.error('Error fetching status:', error);
      setError('Error al obtener el estado actual');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.checkin('web', null, notes);
      setSuccess(result.message);
      setNotes('');
      await fetchStatus();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.checkout('web', null, notes);
      setSuccess(result.message);
      setNotes('');
      await fetchStatus();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const isCheckedIn = status?.isCheckedIn;
  const lastRecord = status?.lastRecord;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-dark mb-2 font-serif">
          ¡Hola, {user?.firstName}!
        </h1>
        <div className="text-6xl font-mono text-brand-light mb-2 font-bold">
          {format(currentTime, 'HH:mm:ss')}
        </div>
        <div className="text-lg text-brand-medium">
          {format(currentTime, "EEEE, d MMMM yyyy")}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-dark font-serif">Estado Actual</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCheckedIn 
                ? 'bg-accent-olive/20 text-accent-olive' 
                : 'bg-neutral-mid/20 text-neutral-dark'
            }`}>
              {isCheckedIn ? 'Fichado' : 'No fichado'}
            </div>
          </div>

          {lastRecord && (
            <div className="space-y-3">
              <div className="flex items-center text-neutral-dark">
                <Clock className="h-5 w-5 mr-2" />
                <span>
                  Último registro: {format(new Date(lastRecord.timestamp), 'HH:mm:ss - dd/MM/yyyy')}
                </span>
              </div>
              <div className="flex items-center text-neutral-dark">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Dispositivo: {lastRecord.device}</span>
              </div>
              {lastRecord.notes && (
                <div className="flex items-start text-neutral-dark">
                  <MessageSquare className="h-5 w-5 mr-2 mt-0.5" />
                  <span>{lastRecord.notes}</span>
                </div>
              )}
            </div>
          )}

          {!lastRecord && (
            <p className="text-neutral-mid">No hay registros previos</p>
          )}
        </div>

        {/* Action Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-dark mb-4 font-serif">
            {isCheckedIn ? 'Fichar Salida' : 'Fichar Entrada'}
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-neutral-dark mb-2">
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Añade una nota sobre tu fichaje..."
                maxLength={500}
              />
              <p className="text-xs text-neutral-mid mt-1">
                {notes.length}/500 caracteres
              </p>
            </div>

            <button
              onClick={isCheckedIn ? handleCheckout : handleCheckin}
              disabled={actionLoading}
              className={`w-full btn flex items-center justify-center text-lg py-4 ${
                isCheckedIn ? 'btn-danger' : 'btn-success'
              }`}
            >
              {actionLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {isCheckedIn ? (
                    <>
                      <LogOut className="h-6 w-6 mr-2" />
                      Fichar Salida
                    </>
                  ) : (
                    <>
                      <LogIn className="h-6 w-6 mr-2" />
                      Fichar Entrada
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="mt-8">
        <RecentRecords />
      </div>
    </div>
  );
};

const RecentRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentRecords();
  }, []);

  const fetchRecentRecords = async () => {
    try {
      const response = await api.getRecords({ limit: 5 });
      setRecords(response.records);
    } catch (error) {
      console.error('Error fetching recent records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-neutral-dark mb-4 font-serif">
        Registros Recientes
      </h2>

      {records.length === 0 ? (
        <p className="text-neutral-mid text-center py-4">
          No hay registros recientes
        </p>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 bg-neutral-light rounded-lg border border-neutral-mid/20"
            >
              <div className="flex items-center">
                {record.type === 'checkin' ? (
                  <LogIn className="h-5 w-5 text-green-600 mr-3" />
                ) : (
                  <LogOut className="h-5 w-5 text-red-600 mr-3" />
                )}
                <div>
                  <p className="font-medium text-neutral-dark">
                    {record.type === 'checkin' ? 'Entrada' : 'Salida'}
                  </p>
                  <p className="text-sm text-neutral-mid">
                    {format(new Date(record.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>
              {record.notes && (
                <div className="text-sm text-neutral-dark max-w-xs truncate">
                  {record.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckinPage;
