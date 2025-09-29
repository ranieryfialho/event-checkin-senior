import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import EventList from "./components/EventList";
import { Toaster, toast } from "react-hot-toast";

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        const eventsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Filtrar apenas eventos futuros ou do dia atual
        const upcomingEvents = eventsData.filter(event => {
          if (!event.date) return false;
          const eventDate = new Date(event.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        });
        
        // Ordenar por data
        upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setEvents(upcomingEvents);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar eventos:', error);
        toast.error('Erro ao carregar eventos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCheckin = async (checkinData) => {
    try {
      await addDoc(collection(db, 'checkins'), {
        ...checkinData,
        createdAt: serverTimestamp()
      });
      
      toast.success('Check-in realizado com sucesso!', {
        duration: 4000,
        icon: '🎉'
      });
    } catch (error) {
      console.error('Erro no check-in:', error);
      toast.error('Erro ao realizar check-in. Tente novamente.');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl text-gray-600 font-medium">Carregando eventos...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <EventList events={events} onCheckin={handleCheckin} />
    </>
  );
}

export default App;