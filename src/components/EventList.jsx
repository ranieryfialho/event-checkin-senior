import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Calendar, Clock, MapPin, User, Users, Sparkles, ArrowRight } from 'lucide-react';
import CheckinForm from './CheckinForm';
import toast from 'react-hot-toast';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    const q = query(
      collection(db, 'events'),
      where('date', '>=', todayString),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar eventos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleRegistration = async (formData) => {
    try {
      await addDoc(collection(db, 'registrations'), {
        ...formData,
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        registeredAt: serverTimestamp(),
        status: 'confirmed'
      });

      toast.success('Inscrição realizada com sucesso! 🎉');
      setShowForm(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Erro ao realizar inscrição:', error);
      toast.error('Erro ao realizar inscrição. Tente novamente.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime) return '';
    return endTime ? `${startTime} - ${endTime}` : startTime;
  };

  const isEventSoon = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  if (showForm && selectedEvent) {
    return (
      <CheckinForm
        event={selectedEvent}
        onSubmit={handleRegistration}
        onBack={() => setShowForm(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando eventos incríveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-transparent"></div>
          <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">Eventos Exclusivos</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Eventos Disponíveis
          </h1>
          
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Descubra oportunidades incríveis de aprendizado e networking. 
            Selecione um evento para se inscrever gratuitamente!
          </p>
          
          <div className="flex items-center justify-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{events.length} evento{events.length !== 1 ? 's' : ''} disponível{events.length !== 1 ? 'eis' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Eventos */}
      <div className="container mx-auto px-4 py-12">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">
              Nenhum evento disponível no momento
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Fique atento! Novos eventos estão sempre sendo adicionados. 
              Volte em breve para conferir as próximas oportunidades.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
              >
                {/* Badge para eventos próximos */}
                {isEventSoon(event.date) && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      🔥 Em breve
                    </span>
                  </div>
                )}

                {/* Imagem do evento */}
                <div className="relative h-48 overflow-hidden">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {event.name}
                  </h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {formatDate(event.date)}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-3 text-purple-500 flex-shrink-0" />
                      <span className="text-sm">
                        {formatTime(event.startTime || event.time, event.endTime)}
                      </span>
                    </div>

                    {event.lab && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{event.lab}</span>
                      </div>
                    )}

                    {event.responsible && (
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0" />
                        <span className="text-sm">{event.responsible}</span>
                      </div>
                    )}
                  </div>

                  {event.observations && (
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                      {event.observations}
                    </p>
                  )}

                  {/* Botão de inscrição */}
                  <button
                    onClick={() => handleEventSelect(event)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    <Users className="w-5 h-5" />
                    <span>Inscrever-se</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer inspirador */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Transforme seu futuro com conhecimento! 🚀
            </h3>
            <p className="text-gray-300">
              Cada evento é uma oportunidade única de crescimento pessoal e profissional. 
              Não perca a chance de fazer parte dessa jornada de transformação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventList;