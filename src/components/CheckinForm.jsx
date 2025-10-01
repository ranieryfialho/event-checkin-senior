import React, { useState, useMemo } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Search,
  Hash,
  AlertTriangle,
} from "lucide-react";

const CheckinForm = ({ event, onBack, allStudents }) => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchInput || searchInput.length < 2) return [];
    const lowercasedInput = searchInput.toLowerCase();
    return allStudents
      .filter(
        (student) =>
          student.name.toLowerCase().includes(lowercasedInput) ||
          (student.code && student.code.toString().includes(lowercasedInput))
      )
      .slice(0, 5);
  }, [searchInput, allStudents]);

  const handleSelectStudent = async (student) => {
    setSearchInput("");
    setIsChecking(true);
    setIsAlreadyRegistered(false);
    setSelectedStudent(null);

    const registrationQuery = query(
      collection(db, "event_registrations"),
      where("eventId", "==", event.id),
      where("studentCode", "==", student.code)
    );

    try {
      const querySnapshot = await getDocs(registrationQuery);
      if (!querySnapshot.empty) {
        setIsAlreadyRegistered(true);
        toast.error(`${student.name} já está inscrito(a) neste evento.`);
      }
      setSelectedStudent(student);
    } catch (error) {
      console.error("Erro ao verificar inscrição:", error);
      toast.error("Ocorreu um erro ao verificar sua inscrição.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleResetSelection = () => {
    setSelectedStudent(null);
    setIsAlreadyRegistered(false);
    setSearchInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("Por favor, selecione um aluno da lista.");
      return;
    }

    if (isAlreadyRegistered) {
      toast.error("Este aluno já está inscrito neste evento.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "event_registrations"), {
        name: selectedStudent.name,
        studentCode: selectedStudent.code,
        course: selectedStudent.className,
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        checkedIn: false,
        registrationDate: serverTimestamp(),
      });

      toast.success(
        `Inscrição realizada com sucesso para ${selectedStudent.name}! 🎉`
      );
      setIsSuccess(true);
    } catch (error) {
      console.error("Erro ao fazer inscrição:", error);
      toast.error("Erro ao fazer inscrição. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data não definida";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (startTime, endTime) => {
    if (!startTime) return "Horário não definido";
    let timeString = startTime;
    if (endTime) timeString += ` - ${endTime}`;
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
            A inscrição de <strong>{selectedStudent?.name}</strong> no evento{" "}
            <strong>{event.name}</strong> foi realizada com sucesso!
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
          {/* Detalhes do Evento */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Detalhes do Evento
            </h2>

            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
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
                <span>
                  {formatTime(event.startTime || event.time, event.endTime)}
                </span>
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
              <div className="relative">
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Search className="w-4 h-4" />
                  Buscar por Matrícula ou Nome *
                </label>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite para buscar..."
                  disabled={!!selectedStudent}
                />

                {searchResults.length > 0 && !selectedStudent && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {searchResults.map((student) => (
                      <li
                        key={student.code}
                        onClick={() => handleSelectStudent(student)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-gray-500">
                          {student.code} - {student.className}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {isChecking && (
                <div className="text-center p-4 text-sm text-blue-700 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    A verificar inscrição...
                  </div>
                </div>
              )}

              {isAlreadyRegistered && selectedStudent && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="py-1">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                    </div>
                    <div>
                      <p className="font-bold text-yellow-800">
                        Inscrição já realizada
                      </p>
                      <p className="text-sm text-yellow-700">
                        O aluno {selectedStudent.name} já está inscrito(a) neste
                        evento.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetSelection}
                        className="mt-2 text-sm text-yellow-600 hover:underline font-medium"
                      >
                        Selecionar outro aluno
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedStudent && !isAlreadyRegistered && (
                <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-blue-800">
                      Aluno Selecionado
                    </h3>
                    <button
                      type="button"
                      onClick={handleResetSelection}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Alterar
                    </button>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                      <Hash className="w-4 h-4" /> Matrícula
                    </label>
                    <input
                      type="text"
                      value={selectedStudent.code}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                      <User className="w-4 h-4" /> Nome Completo
                    </label>
                    <input
                      type="text"
                      value={selectedStudent.name}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                      <GraduationCap className="w-4 h-4" /> Turma
                    </label>
                    <input
                      type="text"
                      value={selectedStudent.className}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !selectedStudent ||
                  isAlreadyRegistered ||
                  isChecking
                }
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    A processar...
                  </>
                ) : (
                  "Confirmar Inscrição"
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