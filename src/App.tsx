/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { jsPDF } from 'jspdf';
import { 
  db, 
  auth, 
  googleProvider, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  signInWithPopup,
  signOut,
  signInAnonymously,
  OperationType,
  handleFirestoreError
} from './firebase';
import { 
  Phone, 
  Calendar, 
  MapPin, 
  Clock, 
  Star, 
  ShieldCheck, 
  UserCheck, 
  Stethoscope, 
  Menu, 
  X, 
  ChevronRight,
  MessageCircle,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Smile,
  HeartPulse,
  Sparkles,
  Activity,
  Trash2,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Data ---

const CLINIC_INFO = {
  name: "Meera Dental",
  tagline: "Best Dental Doctor in Patna",
  logo: "https://i.ibb.co/bRHWxBNW/23e68d8a-48a5-47d7-a536-5cb1b6bfa9b5-removebg-preview.png",
  phone: "091535 93567",
  whatsapp: "919153593567",
  address: "70 Feet BPCL Rd, Opposite Reliance Smart, Purbi Saristabad, Sipara, Patna, Bihar 800032",
  timing: "7:00 AM – 10:00 PM",
  rating: 4.9,
  reviewsCount: 775,
  experience: "15+ Years",
  patients: "10,000+"
};

const SERVICES = [
  {
    title: "Dental Implants",
    description: "Permanent and natural-looking tooth replacement solutions using advanced implant technology for a complete smile.",
    icon: <Award className="w-8 h-8" />
  },
  {
    title: "Cosmetic Dentistry",
    description: "Enhance your smile with professional whitening, veneers, and aesthetic bonding for a perfect look.",
    icon: <Star className="w-8 h-8" />
  },
  {
    title: "General Dentistry",
    description: "Comprehensive oral health checkups, cleanings, and preventive care for patients of all ages.",
    icon: <ShieldCheck className="w-8 h-8" />
  },
  {
    title: "Crowns & Bridges",
    description: "High-quality restorative solutions to strengthen damaged teeth and replace missing ones effectively.",
    icon: <CheckCircle2 className="w-8 h-8" />
  },
  {
    title: "Braces & Aligners",
    description: "Expert orthodontic care including traditional braces and modern clear aligners for perfectly aligned teeth.",
    icon: <Sparkles className="w-8 h-8" />
  },
  {
    title: "Full Mouth Rehabilitation",
    description: "Complete restorative treatment plans to rebuild your oral health and function from the ground up.",
    icon: <Activity className="w-8 h-8" />
  },
  {
    title: "Gum Treatment",
    description: "Specialized care for periodontal health to prevent gum disease and ensure a strong foundation for your teeth.",
    icon: <UserCheck className="w-8 h-8" />
  },
  {
    title: "Pediatric Dentistry",
    description: "Gentle and friendly dental care specifically designed to make children feel comfortable and safe.",
    icon: <Smile className="w-8 h-8" />
  },
  {
    title: "Oral Cancer Treatment",
    description: "Advanced screening and specialized treatment options for early detection and care of oral health conditions.",
    icon: <HeartPulse className="w-8 h-8" />
  }
];

const TIME_SLOTS = [
  "07:00 AM - 08:00 AM",
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
  "09:00 PM - 10:00 PM"
];

const TESTIMONIALS = [
  {
    name: "Rahul Kumar",
    treatment: "Root Canal Treatment",
    text: "Dr. Sandeep is very professional. The RCT was completely painless. Highly recommended for anyone in Patna.",
    rating: 5
  },
  {
    name: "Priya Singh",
    treatment: "Orthodontics",
    text: "Got my braces done here. The progress is amazing and the staff is very supportive. Best orthodontist in town!",
    rating: 5
  },
  {
    name: "Amit Sharma",
    treatment: "Dental Implants",
    text: "Very clean and hygienic clinic. The implant procedure was smooth and the results look very natural.",
    rating: 5
  },
  {
    name: "Suman Devi",
    treatment: "Pediatric Dentistry",
    text: "My son was scared of dentists, but the doctors here made him feel so comfortable. Great experience!",
    rating: 5
  }
];

const BEFORE_AFTER = [
  {
    title: "Smile Makeover",
    desc: "Complete aesthetic transformation",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600&h=400"
  },
  {
    title: "Teeth Alignment",
    desc: "Orthodontic correction",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=600&h=400"
  },
  {
    title: "Teeth Whitening",
    desc: "Instant brightness",
    image: "https://images.unsplash.com/photo-1460672985063-6764ac8b9c74?auto=format&fit=crop&q=80&w=600&h=400"
  }
];

// --- Components ---

const SectionHeading = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center mb-12">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-slate-600 max-w-2xl mx-auto"
      >
        {subtitle}
      </motion.p>
    )}
    <div className="w-20 h-1 bg-blue-600 mx-auto mt-6 rounded-full" />
  </div>
);

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [isAdminView, setIsAdminView] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [editingApt, setEditingApt] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingAptId, setDeletingAptId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdminView || !user || user.email !== "niteshkumar9128ku@gmail.com") {
      // If not admin view or not logged in as admin, we don't need to sync all appointments
      // But we might want to show the user their own appointments? 
      // For now, let's just sync everything if in admin view
      if (!isAdminView) return;
    }

    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppointments(apts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    return () => unsubscribe();
  }, [isAdminView, user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (isAdminView) {
      setIsAdminView(false);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const handleAppointmentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    const formData = new FormData(e.currentTarget);
    const appointmentData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      service: formData.get('service') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      age: formData.get('age') as string,
      gender: formData.get('gender') as string,
      address: formData.get('address') as string,
      createdAt: new Date().toISOString() // Use ISO for better sorting
    };

    try {
      await addDoc(collection(db, 'appointments'), appointmentData);
      
      // Generate PDF
      generateReceipt(appointmentData);

      setFormStatus('success');
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
      setFormStatus('idle');
    }
  };

  const generateReceipt = (data: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Colors
    const primaryBlue = '#004a99';
    const lightBlue = '#e6f0ff';
    const grayText = '#64748b';

    // Header Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Logo & Title
    doc.setTextColor(primaryBlue);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('Meera Dental', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Best Dental Doctor in Patna', 105, 32, { align: 'center' });

    // Doctor Info
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Dr. Sandeep Singh', 105, 45, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('BDS, MDS (Orthodontics)', 105, 51, { align: 'center' });
    doc.text('15+ Years Experience', 105, 57, { align: 'center' });

    // Contact Info Bar
    doc.setDrawColor(primaryBlue);
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);
    
    doc.setFontSize(9);
    doc.setTextColor(primaryBlue);
    doc.text(`Phone: ${CLINIC_INFO.phone}  |  Address: ${CLINIC_INFO.address}`, 105, 71, { align: 'center' });
    
    doc.line(20, 77, 190, 77);

    // Patient Details Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Row 1
    doc.text('Patient Name:', 20, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(data.name || '', 50, 90);
    doc.line(48, 91, 110, 91);

    doc.setFont('helvetica', 'bold');
    doc.text('Age:', 115, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(data.age || '', 125, 90);
    doc.line(124, 91, 140, 91);

    doc.setFont('helvetica', 'bold');
    doc.text('Gender:', 145, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(data.gender || '', 162, 90);
    doc.line(160, 91, 190, 91);

    // Row 2
    doc.setFont('helvetica', 'bold');
    doc.text('Mobile No.:', 20, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(data.phone || '', 50, 100);
    doc.line(48, 101, 110, 101);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 115, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(data.date || '', 128, 100);
    doc.line(126, 101, 190, 101);

    // Row 3
    doc.setFont('helvetica', 'bold');
    doc.text('Address:', 20, 110);
    doc.setFont('helvetica', 'normal');
    doc.text(data.address || '', 50, 110);
    doc.line(48, 111, 190, 111);

    // Main Body Lines
    const startY = 125;
    const labels = [
      { label: 'Chief Complaint:', key: 'service' },
      { label: 'Diagnosis:', key: 'diagnosis' },
      { label: 'Rx / Medicines:', key: 'medicines' },
      { label: 'Procedure / Treatment:', key: 'procedure' },
      { label: 'Advice:', key: 'advice' },
      { label: 'Follow-up Date:', key: 'followUp' }
    ];

    labels.forEach((item, index) => {
      const y = startY + (index * 12);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, 20, y);
      
      doc.setFont('helvetica', 'normal');
      doc.text(data[item.key] || '', 65, y);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, y + 2, 190, y + 2);
    });

    // Bottom Section
    const bottomY = 210;
    doc.setFont('helvetica', 'bold');
    doc.text('Tooth No.:', 20, bottomY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.toothNo || '', 42, bottomY);
    doc.line(42, bottomY + 1, 70, bottomY + 1);

    doc.setFont('helvetica', 'bold');
    doc.text('Treatment Planned:', 80, bottomY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.treatmentPlanned || '', 118, bottomY);
    doc.line(118, bottomY + 1, 190, bottomY + 1);

    doc.setFont('helvetica', 'bold');
    doc.text('Next Visit:', 20, bottomY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(data.nextVisit || '', 42, bottomY + 15);
    doc.line(42, bottomY + 16, 100, bottomY + 16);

    doc.setFont('helvetica', 'bold');
    doc.text('X-Ray / Imaging:', 110, bottomY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(data.imaging || '', 145, bottomY + 15);
    doc.line(145, bottomY + 16, 190, bottomY + 16);

    // Footer
    doc.setDrawColor(primaryBlue);
    doc.line(20, 250, 190, 250);
    
    doc.setFontSize(11);
    doc.text('Thank you for trusting Meera Dental', 105, 258, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Safe & Sterilized Dental Care | Experienced Surgeons | Advanced Dental Solutions', 105, 265, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("Doctor's Signature: ___________________", 190, 280, { align: 'right' });

    // Save the PDF
    doc.save(`Meera_Dental_Appointment_${data.name}.pdf`);
  };

  const handleUpdateApt = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      diagnosis: formData.get('diagnosis') as string || "",
      medicines: formData.get('medicines') as string || "",
      procedure: formData.get('procedure') as string || "",
      advice: formData.get('advice') as string || "",
      followUp: formData.get('followUp') as string || "",
      toothNo: formData.get('toothNo') as string || "",
      treatmentPlanned: formData.get('treatmentPlanned') as string || "",
      nextVisit: formData.get('nextVisit') as string || "",
      imaging: formData.get('imaging') as string || "",
    };

    try {
      const aptRef = doc(db, 'appointments', editingApt.id);
      await updateDoc(aptRef, updatedData);
      setIsEditModalOpen(false);
      setEditingApt(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${editingApt.id}`);
    }
  };

  const handleDeleteApt = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'appointments', id));
      setDeletingAptId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
    }
  };

  const handleAdminLogin = () => {
    setIsLoginModalOpen(true);
    setLoginError(false);
    setLoginPassword('');
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdminView(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedPassword = loginPassword.trim();
    
    if (trimmedPassword === "Meera@12Meera") {
      try {
        // Try to sign in anonymously to allow Firestore access
        // If this fails, we still show the admin view but log the error
        try {
          if (!user) {
            await signInAnonymously(auth);
          }
        } catch (authErr) {
          console.error("Anonymous auth failed, proceeding anyway", authErr);
        }
        
        setIsAdminView(true);
        setIsLoginModalOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("Login process failed", error);
        setLoginError(true);
      }
    } else {
      setLoginError(true);
    }
  };

  if (isAdminView) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-xl font-bold text-blue-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {user.email}
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-500 transition-colors text-sm font-bold"
              >
                Logout
              </button>
              <button 
                onClick={() => setIsAdminView(false)}
                className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-all"
              >
                Exit Admin
              </button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Appointments</h2>
              <p className="text-slate-500">Total: {appointments.length} bookings</p>
            </div>
            <button 
              onClick={() => {
                if(appointments.length > 0) {
                  setDeletingAptId('all');
                }
              }}
              className="text-red-500 text-sm font-bold hover:underline"
            >
              Clear All
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Yet</h3>
              <p className="text-slate-500">New bookings will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {appointments.map((apt) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={apt.id} 
                  className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <UserCheck size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-1">{apt.name}</h4>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Phone size={14} /> {apt.phone}</span>
                        <span className="flex items-center gap-1.5 font-bold text-blue-600"><Stethoscope size={14} /> {apt.service}</span>
                        {apt.age && <span className="flex items-center gap-1.5 text-slate-600 font-medium">Age: {apt.age}</span>}
                        {apt.gender && <span className="flex items-center gap-1.5 text-slate-600 font-medium">Gender: {apt.gender}</span>}
                        {apt.address && <span className="flex items-center gap-1.5"><MapPin size={14} /> {apt.address}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          setEditingApt(apt);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                      >
                        View/Edit
                      </button>
                      <button 
                        onClick={() => generateReceipt(apt)}
                        className="bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-1"
                      >
                        Download Receipt
                      </button>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{apt.date}</p>
                        <p className="text-xs text-slate-500">{apt.time}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <Calendar size={20} />
                      </div>
                      <button 
                        onClick={() => setDeletingAptId(apt.id)}
                        className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all"
                        title="Delete Booking"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Booked: {apt.createdAt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>

        <footer className="py-12 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Meera Dental Admin Portal</p>
        </footer>

        {/* --- Edit Appointment Modal --- */}
        <AnimatePresence>
          {isEditModalOpen && editingApt && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Clinical Details</h3>
                    <p className="text-sm text-slate-500">Patient: {editingApt.name}</p>
                  </div>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="w-10 h-10 bg-white text-slate-400 rounded-full flex items-center justify-center hover:text-slate-600 shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleUpdateApt} className="p-8 overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnosis</label>
                      <input name="diagnosis" defaultValue={editingApt.diagnosis} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" placeholder="e.g. Cavity in molar" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tooth No.</label>
                      <input name="toothNo" defaultValue={editingApt.toothNo} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" placeholder="e.g. 14, 15" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rx / Medicines</label>
                      <textarea name="medicines" defaultValue={editingApt.medicines} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" placeholder="List medicines here..." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Procedure / Treatment</label>
                      <input name="procedure" defaultValue={editingApt.procedure} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" placeholder="e.g. Root Canal" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Treatment Planned</label>
                      <input name="treatmentPlanned" defaultValue={editingApt.treatmentPlanned} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Advice</label>
                      <input name="advice" defaultValue={editingApt.advice} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" placeholder="e.g. Avoid cold water" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">X-Ray / Imaging</label>
                      <input name="imaging" defaultValue={editingApt.imaging} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-up Date</label>
                      <input name="followUp" type="date" defaultValue={editingApt.followUp} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Visit</label>
                      <input name="nextVisit" type="date" defaultValue={editingApt.nextVisit} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none" />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-4">
                    <button 
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                    >
                      Save Changes
                    </button>
                    <button 
                      type="button"
                      onClick={() => generateReceipt(editingApt)}
                      className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Download Current
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* --- Delete Confirmation Modal --- */}
        <AnimatePresence>
          {deletingAptId && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeletingAptId(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Delete</h3>
                <p className="text-slate-500 mb-8">
                  {deletingAptId === 'all' 
                    ? "Are you sure you want to clear ALL records? This cannot be undone." 
                    : "Are you sure you want to delete this booking?"}
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setDeletingAptId(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      if (deletingAptId === 'all') {
                        // Batch delete is complex in Firestore, let's just delete one by one for simplicity in this demo
                        // or just clear the local state if we want to be safe
                        for (const apt of appointments) {
                          await deleteDoc(doc(db, 'appointments', apt.id));
                        }
                        setDeletingAptId(null);
                      } else {
                        handleDeleteApt(deletingAptId);
                      }
                    }}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- Navigation --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img 
              src={CLINIC_INFO.logo} 
              alt={CLINIC_INFO.name} 
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback if the direct link fails
                (e.target as HTMLImageElement).src = "https://ibb.co/bRHWxBNW";
              }}
            />
            <div>
              <h1 className="text-xl font-bold leading-none text-blue-900">Meera Dental</h1>
              <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">Best Care in Patna</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {['Home', 'About', 'Services', 'Reviews', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                {item}
              </button>
            ))}
            <button 
              onClick={() => scrollToSection('appointment')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                {['Home', 'About', 'Services', 'Reviews', 'Contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="text-left text-lg font-medium text-slate-700 py-2 border-b border-slate-50"
                  >
                    {item}
                  </button>
                ))}
                <button 
                  onClick={() => scrollToSection('appointment')}
                  className="bg-blue-600 text-white w-full py-4 rounded-xl text-lg font-bold mt-2"
                >
                  Book Appointment
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Hero Section --- */}
      <section 
        id="home" 
        className="relative min-h-[600px] flex items-center justify-center overflow-hidden py-20 md:py-32"
      >
        {/* Background Image with Zoom Effect */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url('https://citylifedubai.com/wp-content/uploads/2024/12/micris-dental-dubai-cover-1024x320.jpg')` 
            }}
          />
        </motion.div>

        {/* Dark Gradient Overlay (40-60% opacity) */}
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10" />

        <div className="container mx-auto px-4 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-blue-400 font-bold tracking-widest uppercase mb-4 text-sm md:text-lg">
              {CLINIC_INFO.tagline}
            </h2>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
              {CLINIC_INFO.name}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Advanced Implants, Orthodontics & Pain-Free Treatment
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              <a 
                href={`tel:${CLINIC_INFO.phone.replace(/\s/g, '')}`}
                className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-700 transition-all shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-3 group"
              >
                <Phone size={24} />
                Call Now
              </a>
              <button 
                onClick={() => scrollToSection('appointment')}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border-2 border-white/30 px-10 py-5 rounded-full text-xl font-bold hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-3"
              >
                <Calendar size={24} />
                Book Appointment
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-90">
              <div className="flex items-center gap-2 text-white font-semibold bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <Star className="text-yellow-400" fill="currentColor" size={20} />
                <span>{CLINIC_INFO.rating} Rating</span>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <Award className="text-blue-400" size={20} />
                <span>{CLINIC_INFO.experience} Exp</span>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <Users className="text-green-400" size={20} />
                <span>{CLINIC_INFO.patients} Patients</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50 hidden md:block"
        >
          <ArrowRight size={32} className="rotate-90" />
        </motion.div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400&h=500" 
                  alt="Clinic Interior" 
                  className="rounded-3xl shadow-lg w-full h-64 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="bg-blue-600 p-8 rounded-3xl text-white">
                  <h3 className="text-4xl font-bold mb-1">{CLINIC_INFO.experience}</h3>
                  <p className="text-blue-100 font-medium">Clinical Excellence</p>
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="bg-slate-100 p-8 rounded-3xl">
                  <h3 className="text-4xl font-bold text-slate-900 mb-1">4.9</h3>
                  <p className="text-slate-500 font-medium">Google Rating</p>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=400&h=500" 
                  alt="Dental Equipment" 
                  className="rounded-3xl shadow-lg w-full h-64 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <span className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4 block">About Meera Dental</span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Providing Advanced Dental Care with a Personal Touch
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Meera Dental has been a cornerstone of dental health in Patna for over 15 years. 
                Our mission is to provide high-quality, comprehensive dental care in a comfortable 
                and friendly environment.
              </p>
              <p className="text-slate-600 mb-8">
                We utilize the latest technology and follow strict sterilization protocols to ensure 
                the safety and satisfaction of every patient. From routine checkups to complex 
                surgical procedures, our team is dedicated to giving you the smile you deserve.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "100% Painless Procedures",
                  "Advanced Digital Imaging",
                  "Highly Experienced Specialists",
                  "Affordable & Transparent Pricing"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-800 font-semibold">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <CheckCircle2 size={16} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-4 transition-all group"
              >
                Learn more about our clinic
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Chief Dentist Section --- */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-[50px] overflow-hidden shadow-xl border border-slate-100 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 p-8 lg:p-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <img 
                  src="https://i.ibb.co/tPPj78kR/doctor.png" 
                  alt="Dr. Sandeep Singh" 
                  className="w-full h-auto rounded-[40px] shadow-2xl object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to the page link if direct link fails
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800&h=1000";
                  }}
                />
                <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-8 rounded-[32px] shadow-xl hidden md:block">
                  <p className="text-4xl font-bold">15+</p>
                  <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Years Exp.</p>
                </div>
              </motion.div>
            </div>
            
            <div className="lg:w-1/2 p-8 lg:p-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4 block">Chief Dentist & Orthodontist</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">Dr. Sandeep Singh</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Award size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Qualification</p>
                      <p className="text-lg font-bold text-slate-800">BDS, MDS (Orthodontics)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Specialization</p>
                      <p className="text-lg font-bold text-slate-800">Specialist in Dental Implants & Orthodontics</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Certification</p>
                      <p className="text-lg font-bold text-slate-800">Certified | MDS</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <button 
                    onClick={() => scrollToSection('appointment')}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                  >
                    Book Appointment with Dr. Sandeep
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Services Section --- */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <SectionHeading 
            title="Our Specialized Services" 
            subtitle="We offer a wide range of dental treatments tailored to your specific needs, using the latest medical advancements."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-100 group"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 mb-6 line-clamp-3">
                  {service.description}
                </p>
                <button 
                  onClick={() => scrollToSection('appointment')}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all"
                >
                  Learn more
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Before & After --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <SectionHeading 
            title="Smile Transformations" 
            subtitle="Real results from our patients. Witness the power of modern cosmetic and restorative dentistry."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BEFORE_AFTER.map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="relative group rounded-3xl overflow-hidden shadow-lg"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-blue-200 text-sm font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Testimonials --- */}
      <section id="reviews" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <SectionHeading 
            title="What Our Patients Say" 
            subtitle="We take pride in our 4.9-star rating. Here's why thousands of patients trust Meera Dental."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full"
              >
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-slate-600 italic mb-6 flex-grow">"{review.text}"</p>
                <div className="mt-auto">
                  <p className="font-bold text-slate-900">{review.name}</p>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{review.treatment}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <a 
              href="https://www.google.com/search?q=Meera+Dental+Patna+reviews" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              View all 775+ reviews on Google
            </a>
          </div>
        </div>
      </section>

      {/* --- Appointment Section --- */}
      <section id="appointment" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-blue-600 rounded-[50px] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            <div className="flex-1 p-12 lg:p-20 text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Book Your Visit Today</h2>
              <p className="text-blue-100 text-lg mb-10">
                Take the first step towards a healthier, more beautiful smile. 
                Fill out the form and our team will contact you shortly to confirm your slot.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">Call for Instant Booking</p>
                    <p className="text-xl font-bold">{CLINIC_INFO.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">Opening Hours</p>
                    <p className="text-xl font-bold">{CLINIC_INFO.timing}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-50 p-12 lg:p-20">
              {formStatus === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h3>
                  <p className="text-slate-600">We'll call you within 30 minutes to confirm your appointment.</p>
                  <button 
                    onClick={() => setFormStatus('idle')}
                    className="mt-8 text-blue-600 font-bold"
                  >
                    Book another appointment
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input 
                        required
                        name="name"
                        type="text" 
                        placeholder="e.g. Rahul Singh" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                      <input 
                        required
                        name="phone"
                        type="tel" 
                        placeholder="e.g. 91535 XXXXX" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                      <input 
                        required
                        name="age"
                        type="number" 
                        placeholder="Age" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                      <select 
                        required
                        name="gender"
                        defaultValue=""
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none bg-white"
                      >
                        <option value="" disabled>Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                      <input 
                        required
                        name="address"
                        type="text" 
                        placeholder="City/Area" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Service</label>
                    <select 
                      name="service" 
                      defaultValue={SERVICES[0].title}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none bg-white"
                    >
                      {SERVICES.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
                      <option value="General Consultation">General Consultation</option>
                      <option value="Emergency Care">Emergency Care</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Date</label>
                      <input 
                        required
                        name="date"
                        type="date" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Time</label>
                      <select 
                        required
                        name="time"
                        defaultValue=""
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none bg-white"
                      >
                        <option value="" disabled>Select Time Slot</option>
                        {TIME_SLOTS.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button 
                    disabled={formStatus === 'submitting'}
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 mt-4"
                  >
                    {formStatus === 'submitting' ? 'Processing...' : 'Confirm Appointment'}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-4">
                    By submitting, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- Contact & Location --- */}
      <section id="contact" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <SectionHeading 
            title="Visit Our Clinic" 
            subtitle="Located in the heart of Patna, our clinic is easily accessible with ample parking space."
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Our Location</h3>
                <p className="text-slate-600 leading-relaxed">
                  {CLINIC_INFO.address}
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Phone size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Contact Details</h3>
                <p className="text-slate-600">Phone: {CLINIC_INFO.phone}</p>
                <p className="text-slate-600">WhatsApp: +91 {CLINIC_INFO.whatsapp.slice(2)}</p>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Working Hours</h3>
                <p className="text-slate-600">Mon - Sun: {CLINIC_INFO.timing}</p>
                <p className="text-green-600 font-bold mt-2">Open Now</p>
              </div>
            </div>
            
            <div className="lg:col-span-2 bg-white p-4 rounded-[40px] shadow-sm border border-slate-100 h-[500px] lg:h-auto">
              <iframe 
                src="https://maps.google.com/maps?q=Meera%20Dental%20Patna%2070%20Feet%20BPCL%20Rd%20Sipara&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                className="w-full h-full rounded-[32px] border-0"
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-slate-400 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 text-white mb-6">
                <img 
                  src={CLINIC_INFO.logo} 
                  alt={CLINIC_INFO.name} 
                  className="w-10 h-10 object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xl font-bold">Meera Dental</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Meera Dental is committed to providing premium dental care in Patna. 
                With advanced technology and expert doctors, we ensure your oral health is in good hands.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, link: 'https://www.facebook.com/profile.php?id=61563333327816', label: 'Facebook' },
                  { icon: Instagram, link: 'https://www.instagram.com/meeradental_?igsh=djhjNjJwcXpvYWZ1', label: 'Instagram' },
                  { icon: Youtube, link: 'https://www.youtube.com/@meeradentalwithdrsatyam', label: 'YouTube' }
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all group"
                  >
                    <span className="sr-only">{social.label}</span>
                    <social.icon size={18} className="group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm">
                {['Home', 'About Us', 'Patient Reviews', 'Contact Us'].map(link => (
                  <li key={link}>
                    <button onClick={() => scrollToSection(link.toLowerCase().split(' ')[0])} className="hover:text-blue-400 transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Our Services</h4>
              <ul className="space-y-4 text-sm">
                {SERVICES.slice(0, 5).map(service => (
                  <li key={service.title}>
                    <button onClick={() => scrollToSection('services')} className="hover:text-blue-400 transition-colors">
                      {service.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Newsletter</h4>
              <p className="text-sm mb-4">Subscribe to get oral health tips and clinic updates.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-slate-800 border-0 rounded-lg px-4 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs uppercase tracking-widest font-bold">
            <p>© {new Date().getFullYear()} Meera Dental. All Rights Reserved.</p>
            <div className="flex gap-8 items-center">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Use</a>
              <button 
                onClick={handleAdminLogin}
                className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors group"
              >
                <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" />
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* --- Floating Actions --- */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
        <a 
          href={`https://wa.me/${CLINIC_INFO.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-green-600 transition-all hover:scale-110 active:scale-95 group relative"
        >
          <MessageCircle size={32} />
          <span className="absolute right-full mr-4 bg-white text-slate-900 px-3 py-1 rounded-lg text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat on WhatsApp
          </span>
        </a>
        
        <a 
          href={`tel:${CLINIC_INFO.phone.replace(/\s/g, '')}`}
          className="lg:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
        >
          <Phone size={28} />
        </a>
      </div>

      {/* --- Admin Login Modal --- */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 md:p-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Admin Access</h3>
                <p className="text-slate-500 text-sm mt-2">Enter the security password to access the dashboard.</p>
              </div>

              <form onSubmit={submitLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Security Password</label>
                  <input 
                    autoFocus
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError(false);
                    }}
                    placeholder="••••••••"
                    className={`w-full px-5 py-4 rounded-2xl border ${loginError ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-lg font-mono`}
                  />
                  {loginError && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1"
                    >
                      <X size={12} /> Incorrect password. Please try again.
                    </motion.p>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]"
                >
                  Verify & Login
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
