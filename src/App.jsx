import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import EventList from "./components/EventList";
import { Toaster, toast } from "react-hot-toast";

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    // Busca os eventos
    const eventsQuery = query(collection(db, "events"));
    const unsubscribeEvents = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const eventsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const upcomingEvents = eventsData.filter((event) => {
          if (!event.date) return false;
          const eventDate = new Date(event.date + "T00:00:00"); // Trata a data como local
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return eventDate >= today;
        });
        upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(upcomingEvents);
      },
      (error) => {
        console.error("Erro ao carregar eventos:", error);
        toast.error("Erro ao carregar eventos.");
        setLoading(false);
      }
    );

    // Busca os alunos de todas as turmas
    const classesQuery = query(collection(db, "classes"));
    const unsubscribeClasses = onSnapshot(
      classesQuery,
      (snapshot) => {
        const studentsList = [];
        snapshot.forEach((doc) => {
          const classData = doc.data();
          if (classData.students && Array.isArray(classData.students)) {
            classData.students.forEach((student) => {
              studentsList.push({ ...student, className: classData.name });
            });
          }
        });
        setAllStudents(studentsList);
        setLoading(false); // Só para de carregar depois que eventos e alunos estiverem prontos
      },
      (error) => {
        console.error("Erro ao carregar turmas/alunos:", error);
        toast.error("Não foi possível carregar a lista de alunos.");
        setLoading(false);
      }
    );

    return () => {
      unsubscribeEvents();
      unsubscribeClasses();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl text-gray-600">A carregar...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="App">
        <EventList events={events} allStudents={allStudents} />
      </div>
    </>
  );
}

export default App;