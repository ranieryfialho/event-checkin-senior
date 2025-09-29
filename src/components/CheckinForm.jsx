import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, User, Mail, Phone, GraduationCap, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

const CheckinForm = ({ event, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'event_registrations'), {
        ...formData,
        eventId: event.id,
        eventName: event.name,
        registrationDate: serverTimestamp(),
      });

      setIsSuccess(true);
    } catch (error) {
      console.error('Erro ao fazer inscrição:', error);
      alert('Erro ao fazer inscrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime) return 'Horário não definido';
    let timeString = startTime;
    if (endTime) {
      timeString += ` - ${endTime}`;
    }
    return timeString;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Inscrição Realizada!
          </h2>
          <p className="text-gray-600 mb-6">
            Sua inscrição no evento <strong>{event.name}</strong> foi realizada com sucesso!
          </p>
          <button
            onClick={onBack}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Voltar aos Eventos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos eventos
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Inscrição no Evento
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações do Evento */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Detalhes do Evento
            </h2>
            
            {event.imageUrl && (
              <img 
                src={event.imageUrl} 
                alt={event.name} 
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {event.name}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                <span>{formatDate(event.date)}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-3 text-green-600" />
                <span>{formatTime(event.startTime || event.time, event.endTime)}</span>
              </div>

              {event.lab && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-red-600" />
                  <span>{event.lab}</span>
                </div>
              )}

              {event.responsible && (
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-3 text-purple-600" />
                  <span>Responsável: {event.responsible}</span>
                </div>
              )}
            </div>

            {event.observations && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-sm">{event.observations}</p>
              </div>
            )}
          </div>

          {/* Formulário de Inscrição */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Dados para Inscrição
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <User className="w-4 h-4" />
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Mail className="w-4 h-4" />
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite seu e-mail"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite seu telefone"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <GraduationCap className="w-4 h-4" />
                  Curso
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite seu curso (opcional)"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </>
                ) : (
                  'Confirmar Inscrição'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinForm;