
import React, { useState, useEffect, useRef } from 'react';
import { COURSES, PROFESSORS } from '../constants';
import { XPBar, AchievementBadge, AiTutor } from '../components/DashboardComponents';
import { Calendar as CalIcon, BookOpen, Clock, CheckCircle, XCircle, Users, Activity, BarChart2, Edit, Save, Plus, ChevronLeft, ChevronRight, Info, Bell, UploadCloud, Trash2, Settings, Lock, AlertTriangle, Shield, Search, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Booking, UserRole } from '../types';

// --- Improved Calendar Component ---

const SquareCalendar: React.FC<{ bookings: Booking[] }> = ({ bookings }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    };

    // Adjust for Monday start (standard in MK)
    const getStartOffset = (dayIndex: number) => {
        return dayIndex === 0 ? 6 : dayIndex - 1; 
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const startDay = getStartOffset(getFirstDayOfMonth(currentDate));

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
        setCurrentDate(new Date(newDate));
        setSelectedDate(null);
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() && 
               d1.getMonth() === d2.getMonth() && 
               d1.getFullYear() === d2.getFullYear();
    };

    const getBookingsForDay = (day: number) => {
        return bookings.filter(b => {
            const bDate = new Date(b.date);
            return bDate.getDate() === day && 
                   bDate.getMonth() === currentDate.getMonth() && 
                   bDate.getFullYear() === currentDate.getFullYear() &&
                   b.status === 'approved'; 
        });
    };

    const renderCalendarDays = () => {
        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/30 border border-gray-100/50"></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dayBookings = getBookingsForDay(i);
            const isToday = isSameDay(new Date(), new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
            const isSelected = selectedDate && selectedDate.getDate() === i;
            const approvedCount = dayBookings.length;

            days.push(
                <div 
                    key={i} 
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))}
                    className={`h-24 border border-gray-100 p-2 cursor-pointer transition-all hover:bg-indigo-50 flex flex-col justify-between
                        ${isToday ? 'bg-indigo-50/50' : 'bg-white'}
                        ${isSelected ? 'ring-2 ring-indigo-500 z-10' : ''}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{i}</span>
                        {approvedCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
                        )}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                        {dayBookings.slice(0, 2).map((b, idx) => (
                            <div key={b.id} className="text-[10px] truncate bg-green-100 text-green-800 px-1 py-0.5 rounded border border-green-200">
                                {new Date(b.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {b.courseTitle}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-fade-in-up">
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                        <CalIcon className="h-6 w-6 text-indigo-600" />
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="h-5 w-5" /></button>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="h-5 w-5" /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 text-center mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-xs font-bold text-gray-400 uppercase py-2">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 bg-gray-200 border border-gray-200 gap-px overflow-hidden rounded-lg">
                    {renderCalendarDays()}
                </div>
            </div>

            <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                    {selectedDate ? selectedDate.toDateString() : "Select a date"}
                </h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {!selectedDate ? (
                        <div className="text-center py-8 text-gray-400">
                            <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Click on a day to view details.</p>
                        </div>
                    ) : (
                         (() => {
                            const daysBookings = getBookingsForDay(selectedDate.getDate());
                            if (daysBookings.length === 0) return <p className="text-sm text-gray-500">No classes scheduled.</p>;
                            
                            return daysBookings.map(b => (
                                <div key={b.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-indigo-700 text-xs uppercase">
                                            {new Date(b.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Confirmed</span>
                                    </div>
                                    <h5 className="font-bold text-gray-900 text-sm mb-1">{b.courseTitle}</h5>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Users className="h-3 w-3" /> {b.userEmail}
                                    </p>
                                </div>
                            ));
                         })()
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Admin Booking Action Component ---
const BookingActionButtons: React.FC<{ bookingId: string, updateStatus: (id: string, status: 'approved'|'rejected') => Promise<void> }> = ({ bookingId, updateStatus }) => {
    const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null);
    const { notify } = useNotification();

    const handleAction = async (status: 'approved' | 'rejected') => {
        setLoading(status);
        try {
            await updateStatus(bookingId, status);
            notify('Success', `Booking ${status}`, 'success');
        } catch(e: any) {
            console.error(e);
            notify('Error', `Failed to update: ${e.message || 'Unknown error'}`, 'info');
        }
        setLoading(null);
    }

    return (
        <div className="flex gap-2">
            <button 
                onClick={() => handleAction('approved')} 
                disabled={!!loading}
                className="p-1 hover:bg-green-100 text-green-600 rounded disabled:opacity-50"
            >
                {loading === 'approved' ? <Loader className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
            </button>
            <button 
                onClick={() => handleAction('rejected')} 
                disabled={!!loading}
                className="p-1 hover:bg-red-100 text-red-600 rounded disabled:opacity-50"
            >
                {loading === 'rejected' ? <Loader className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
            </button>
        </div>
    );
};

// --- Admin Course Manager ---

const AdminCourseManager: React.FC = () => {
    const { addCourse, uploadCourseImage } = useData();
    const { notify } = useNotification();
    const { t } = useLanguage();
    
    // Form State
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('Online and group study available.');
    const [selectedProf, setSelectedProf] = useState(PROFESSORS[0].id);
    const [university, setUniversity] = useState('FINKI'); 
    const [price, setPrice] = useState(6000);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Module State
    const [lectures, setLectures] = useState<Array<{title: string, date: string, time: string}>>([]);
    const [newModTitle, setNewModTitle] = useState('');
    const [newModDate, setNewModDate] = useState('');
    
    // New Dropdown Time State
    const [newModHour, setNewModHour] = useState('09');
    const [newModMinute, setNewModMinute] = useState('00');

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    };
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }
    };

    const addModule = () => {
        if (!newModTitle || !newModDate) {
            notify('Error', 'Please fill all module fields', 'info');
            return;
        }
        const timeString = `${newModHour}:${newModMinute}`;
        setLectures([...lectures, { title: newModTitle, date: newModDate, time: timeString }]);
        setNewModTitle('');
        setNewModDate('');
        setNewModHour('09');
        setNewModMinute('00');
    };

    const removeLecture = (index: number) => {
        setLectures(lectures.filter((_, i) => i !== index));
    };

    const handleAddCourse = async () => {
        if(!title || !code || !selectedProf || lectures.length === 0) {
            notify('Error', 'Missing required fields or modules', 'info');
            return;
        }
        setIsSubmitting(true);
        const finalLectures = lectures.map((l, i) => ({
            id: `l-new-${Date.now()}-${i}`,
            title: l.title,
            date: new Date(`${l.date}T${l.time}`).toISOString(),
            duration: 90,
        }));

        try {
            // 1. Handle Image Upload
            let finalImageUrl = imagePreview;
            if (imageFile) {
                finalImageUrl = await uploadCourseImage(imageFile);
            } else if (!imagePreview) {
                finalImageUrl = "https://picsum.photos/800/400?random=" + Math.random();
            }

            // 2. Add Course
            await addCourse({
                id: `c-${Date.now()}`,
                title, code, description, professorId: selectedProf,
                university: university,
                image: finalImageUrl,
                priceFull: Number(price), priceSingle: 750, lectures: finalLectures
            });
            notify('Course Added', `${title} is live!`, 'success');
            setTitle(''); setCode(''); setLectures([]); setImagePreview(''); setImageFile(null);
        } catch (e: any) {
            notify('Error', e.message || 'Failed to add course.', 'info');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" /> {t('createCourse')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('courseTitle')}</label>
                        <input className="w-full p-2 border rounded-lg" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('courseCode')}</label>
                             <input className="w-full p-2 border rounded-lg" value={code} onChange={e => setCode(e.target.value)} />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('priceMkd')}</label>
                             <input type="number" className="w-full p-2 border rounded-lg" value={price} onChange={e => setPrice(Number(e.target.value))} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">University</label>
                        <input 
                            list="uni-list"
                            className="w-full p-2 border rounded-lg bg-white" 
                            value={university} 
                            onChange={e => setUniversity(e.target.value)}
                            placeholder="Select or type university..."
                        />
                        <datalist id="uni-list">
                            <option value="FINKI" />
                            <option value="UKIM" />
                            <option value="FON" />
                            <option value="American College" />
                            <option value="Medical Faculty" />
                        </datalist>
                        <p className="text-[10px] text-gray-400 mt-1">Type a new name to create a new university category.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('assignProf')}</label>
                        <select className="w-full p-2 border rounded-lg bg-white" value={selectedProf} onChange={e => setSelectedProf(e.target.value)}>
                            {PROFESSORS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('desc')}</label>
                         <textarea rows={3} className="w-full p-2 border rounded-lg" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('coverImg')}</label>
                        <div 
                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors h-32 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'} ${imagePreview ? 'p-0 overflow-hidden' : ''}`}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500 text-center">{t('uploadText')}</p>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileInput} />
                        </div>
                     </div>

                     <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3 flex justify-between">
                            <span>{t('modules')}</span>
                            <span className="text-indigo-600">{lectures.length}</span>
                        </label>
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                            {lectures.map((l, i) => (
                                <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 text-sm">
                                    <div className="truncate flex-1">
                                        <span className="font-bold block text-gray-900">{l.title}</span>
                                        <span className="text-xs text-gray-500">{l.date} @ {l.time}</span>
                                    </div>
                                    <button onClick={() => removeLecture(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                             <input placeholder={t('moduleTitle')} className="w-full p-2 border rounded text-sm" value={newModTitle} onChange={e => setNewModTitle(e.target.value)} />
                             <div className="flex gap-2">
                                 <input type="date" className="flex-1 p-2 border rounded text-sm" value={newModDate} onChange={e => setNewModDate(e.target.value)} />
                                 <select className="w-16 p-2 border rounded text-sm bg-white" value={newModHour} onChange={e => setNewModHour(e.target.value)}>
                                     {Array.from({length: 24}).map((_, i) => {
                                         const h = i.toString().padStart(2, '0');
                                         return <option key={h} value={h}>{h}</option>;
                                     })}
                                 </select>
                                 <span className="self-center font-bold text-gray-400">:</span>
                                 <select className="w-16 p-2 border rounded text-sm bg-white" value={newModMinute} onChange={e => setNewModMinute(e.target.value)}>
                                     {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                                 </select>

                                 <button onClick={addModule} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                                     <Plus className="h-4 w-4" />
                                 </button>
                             </div>
                        </div>
                     </div>
                </div>
            </div>

            <button 
                onClick={handleAddCourse} 
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-200 disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {isSubmitting && <Loader className="animate-spin h-5 w-5" />}
                {t('publishCourse')}
            </button>
        </div>
    )
}

// --- Admin User Manager ---
const AdminUserManager: React.FC = () => {
    const { users, updateUserRole } = useData();
    const { notify } = useNotification();
    const { t } = useLanguage();
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(search.toLowerCase()) || 
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            await updateUserRole(userId, newRole);
            notify('Role Updated', 'User role updated successfully.', 'success');
        } catch (e) {
            notify('Error', 'Failed to update user role.', 'info');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-600" /> User Management
                </h3>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-48 focus:w-64 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
             </div>
             <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Current Role</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{u.name}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                        ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                                          u.role === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}
                                    `}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5"
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                    >
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-6 text-gray-500">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

// --- Settings Tab Component ---

const SettingsTab: React.FC = () => {
    const { t } = useLanguage();
    const { updatePassword, user } = useAuth();
    const { notify } = useNotification();
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            notify('Error', t('passwordsDoNotMatch'), 'info');
            return;
        }
        if (newPassword.length < 6) {
             notify('Error', t('passwordTooShort'), 'info');
             return;
        }

        setLoading(true);
        try {
            await updatePassword(newPassword);
            notify('Success', t('passwordUpdated'), 'success');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            notify('Error', err.message || 'Failed to update password', 'info');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl animate-fade-in-up">
            <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2"><Settings className="h-5 w-5 text-indigo-600" /> {t('settings')}</h3>
            
            <div className="space-y-6">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-indigo-900">Account Details</h4>
                        <p className="text-sm text-indigo-700 mt-1">
                            Email: {user?.email}<br/>
                            Name: {user?.name}
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-gray-500" /> {t('changePassword')}
                    </h4>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmNewPassword')}</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !newPassword}
                            className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
                        >
                            {loading ? t('processing') : t('updatePassword')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard ---

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { bookings, updateBookingStatus, courses } = useData();
  const { notify } = useNotification();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Guard Clause: If not authenticated or user is missing, redirect immediately.
  // This prevents white screen issues when user state is cleared on logout.
  if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
  }

  let myBookings: Booking[] = [];
  if (user.role === 'admin') myBookings = bookings;
  else if (user.role === 'teacher') {
    const myCourseIds = courses.filter(c => c.professorId === user.id).map(c => c.id);
    myBookings = bookings.filter(b => myCourseIds.includes(b.courseId));
  } else myBookings = bookings.filter(b => b.userId === user.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl uppercase">
                {user.name ? user.name.charAt(0) : 'U'}
             </div>
             <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('welcome')}, {user.name}!</h1>
                <p className="text-gray-500 capitalize">{user.role} {t('dashboard')}</p>
             </div>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
             <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{t('overview')}</button>
             <button onClick={() => setActiveTab('calendar')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'calendar' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{t('calendar')}</button>
             {user.role === 'admin' && <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{t('adminTools')}</button>}
             <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{t('settings')}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* SETTINGS TAB */}
                {activeTab === 'settings' && <SettingsTab />}

                {/* ADMIN TOOLS TAB */}
                {activeTab === 'admin' && user.role === 'admin' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <AdminUserManager />
                        <AdminCourseManager />
                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-lg text-gray-900">Booking Management</h3></div>
                            <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Student</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Course</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map(booking => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.userEmail}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{booking.courseTitle}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{booking.status}</span></td>
                                        <td className="px-6 py-4">
                                            {booking.status === 'pending' && (
                                                <BookingActionButtons bookingId={booking.id} updateStatus={updateBookingStatus} />
                                            )}
                                        </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && <tr><td colSpan={4} className="text-center py-6 text-gray-500">No bookings yet.</td></tr>}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                   <>
                        {user.role === 'student' && <XPBar user={user} />}
                        {user.role === 'admin' && (
                             <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                    <h3 className="text-3xl font-bold text-indigo-600">{bookings.length}</h3>
                                    <p className="text-xs text-gray-500 uppercase font-bold">{t('totalBookings')}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                    <h3 className="text-3xl font-bold text-green-600">{courses.length}</h3>
                                    <p className="text-xs text-gray-500 uppercase font-bold">{t('activeCourses')}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                    <h3 className="text-3xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</h3>
                                    <p className="text-xs text-gray-500 uppercase font-bold">{t('pendingActions')}</p>
                                </div>
                             </div>
                        )}

                        {(user.role !== 'admin') && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-600" /> {t('recentActivity')}
                                </h3>
                                <div className="space-y-4">
                                {myBookings.length === 0 ? <p className="text-gray-500 text-center py-4">No recent bookings.</p> : (
                                    myBookings.slice(0, 3).map(booking => (
                                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{booking.courseTitle}</h4>
                                                <p className="text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()}</p>
                                            </div>
                                            <div><span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{booking.status}</span></div>
                                        </div>
                                    ))
                                )}
                                </div>
                            </div>
                        )}
                   </>
                )}

                {/* CALENDAR TAB */}
                {activeTab === 'calendar' && (
                    <SquareCalendar bookings={myBookings} />
                )}
            </div>

            <div className="space-y-8">
                <AnalyticsCard role={user.role} />
                <AiTutor />
            </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsCard: React.FC<{ role: string }> = ({ role }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-600" /> Analytics
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl">
                    <p className="text-xs text-indigo-600 font-bold uppercase">{role === 'student' ? 'Attendance' : 'Students'}</p>
                    <p className="text-2xl font-bold text-gray-900">{role === 'student' ? '0%' : '0'}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-xs text-purple-600 font-bold uppercase">{role === 'student' ? 'Avg Grade' : 'Earnings'}</p>
                    <p className="text-2xl font-bold text-gray-900">{role === 'student' ? '-' : '0 MKD'}</p>
                </div>
             </div>
        </div>
    )
}
