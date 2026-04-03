import React, { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Trash2, Edit3, Save, X } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { CourseRecord } from '../../types';

type EditableCourse = {
  title: string; title_en: string; code: string;
  description: string; description_en: string;
  image: string; university: string;
  price_full: number; price_single: number; custom_price_display: string;
  status: string;
  professor_id: string;
};

interface ProfessorOption {
  id: string;
  full_name: string;
}

interface CoursesTabProps {
  courses: CourseRecord[];
  updateCourseStatus: (id: string, status: string) => void;
  fetchAll: () => void;
  t: (k: any) => string;
}

export const CoursesTab: React.FC<CoursesTabProps> = ({ courses, updateCourseStatus, fetchAll, t }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', title_en: '', code: '', description: '', description_en: '', university: '', price_full: 0, price_single: 0, custom_price_display: '', image: '', professor_id: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditableCourse>({
    title: '', title_en: '', code: '', description: '', description_en: '',
    image: '', university: '', price_full: 0, price_single: 0, custom_price_display: '', status: 'draft', professor_id: '',
  });
  const [professors, setProfessors] = useState<ProfessorOption[]>([]);

  useEffect(() => {
    supabase.from('professors').select('id, profiles(full_name)').then(({ data }) => {
      if (data) setProfessors(data.map((p: any) => ({ id: p.id, full_name: p.profiles?.full_name || '' })));
    });
  }, []);

  const startEdit = (course: CourseRecord) => {
    setEditingId(course.id);
    setEditForm({
      title: course.title || '',
      title_en: (course as any).title_en || '',
      code: course.code || '',
      description: course.description || '',
      description_en: (course as any).description_en || '',
      image: course.image || '',
      university: course.university || '',
      price_full: course.price_full ?? 0,
      price_single: course.price_single ?? 0,
      custom_price_display: (course as any).custom_price_display || '',
      status: course.status || 'draft',
      professor_id: course.professor_id || '',
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('courses').update(editForm).eq('id', editingId);
    if (error) { if (import.meta.env.DEV) console.error('Save failed:', error.message); alert(t('operationFailed')); return; }
    setEditingId(null);
    fetchAll();
  };

  const addCourse = async () => {
    if (!newCourse.title.trim()) return;
    const courseData: any = { ...newCourse, status: 'draft' };
    if (!courseData.professor_id) delete courseData.professor_id;
    if (!courseData.title_en) delete courseData.title_en;
    if (!courseData.description_en) delete courseData.description_en;
    if (!courseData.custom_price_display) delete courseData.custom_price_display;
    const { error } = await supabase.from('courses').insert(courseData);
    if (error) { if (import.meta.env.DEV) console.error('Add course failed:', error.message); alert(t('operationFailed')); return; }
    setShowAdd(false);
    setNewCourse({ title: '', title_en: '', code: '', description: '', description_en: '', university: '', price_full: 0, price_single: 0, custom_price_display: '', image: '', professor_id: '' });
    fetchAll();
  };

  const inputCls = "px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white w-full";

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('manageCourses')}</h2>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all">
          <Plus className="h-4 w-4" /> {t('addCourse')}
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input placeholder={`${t('courseTitle')} (${t('titleMk')})`} aria-label={t('courseTitle')} value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className={inputCls} />
            <input placeholder={t('titleEn')} aria-label={t('titleEn')} value={newCourse.title_en} onChange={e => setNewCourse({...newCourse, title_en: e.target.value})} className={inputCls} />
            <input placeholder={t('courseCode')} aria-label={t('courseCode')} value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} className={inputCls} />
            <input placeholder={t('university')} aria-label={t('university')} value={newCourse.university} onChange={e => setNewCourse({...newCourse, university: e.target.value})} className={inputCls} />
            <input placeholder={t('imageUrl')} aria-label={t('imageUrl')} value={newCourse.image} onChange={e => setNewCourse({...newCourse, image: e.target.value})} className={inputCls} />
            <input placeholder={t('customPriceDisplay')} aria-label={t('customPriceDisplay')} value={newCourse.custom_price_display} onChange={e => setNewCourse({...newCourse, custom_price_display: e.target.value})} className={inputCls} />
            <input type="number" placeholder={t('priceSingle')} aria-label={t('priceSingle')} value={newCourse.price_single || ''} onChange={e => setNewCourse({...newCourse, price_single: Number(e.target.value)})} className={inputCls} />
            <input type="number" placeholder={t('priceFull')} aria-label={t('priceFull')} value={newCourse.price_full || ''} onChange={e => setNewCourse({...newCourse, price_full: Number(e.target.value)})} className={inputCls} />
            <div>
              <select aria-label={t('selectProfessor')} value={newCourse.professor_id} onChange={e => setNewCourse({...newCourse, professor_id: e.target.value})} className={inputCls}>
                <option value="">{t('selectProfessor')}</option>
                {professors.map(p => <option key={p.id} value={p.id}>{p.full_name || t('unknownProfessor')}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <textarea placeholder={`${t('descriptionLabel')} (${t('descriptionMk')})`} value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white resize-none" />
          </div>
          <textarea placeholder={t('descriptionEn')} value={newCourse.description_en} onChange={e => setNewCourse({...newCourse, description_en: e.target.value})} rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white mb-4 resize-none" />
          <div className="flex gap-2">
            <button onClick={addCourse} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">{t('saveCourse')}</button>
            <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl">{t('cancel')}</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {courses.map(course => (
          <div key={course.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{course.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {course.code} • {course.university} • {course.price_single}/{course.price_full} MKD
                  {course.professor_id && ` • ${professors.find(p => p.id === course.professor_id)?.full_name || t('unknownProfessor')}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => editingId === course.id ? setEditingId(null) : startEdit(course)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                  <Edit3 className="h-4 w-4" /> {editingId === course.id ? t('cancel') : t('edit')}
                </button>
                {course.status === 'draft' && (
                  <button onClick={() => updateCourseStatus(course.id, 'published')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                    <Eye className="h-4 w-4" /> {t('publish')}
                  </button>
                )}
                {course.status === 'published' && (
                  <button onClick={() => updateCourseStatus(course.id, 'draft')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">
                    <EyeOff className="h-4 w-4" /> {t('unpublish')}
                  </button>
                )}
                {course.status !== 'archived' && (
                  <button onClick={() => updateCourseStatus(course.id, 'archived')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg hover:bg-red-200">
                    <Trash2 className="h-4 w-4" /> {t('archive')}
                  </button>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  course.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  course.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>{course.status === 'published' ? t('published') : course.status === 'draft' ? t('draft') : t('archived')}</span>
              </div>
            </div>

            {editingId === course.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-gray-100 dark:border-slate-700 p-5 bg-gray-50 dark:bg-slate-900/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t('editCourse')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('titleMk')}</label>
                    <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('titleEn')}</label>
                    <input value={editForm.title_en} onChange={e => setEditForm({...editForm, title_en: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('courseCode')}</label>
                    <input value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('university')}</label>
                    <input value={editForm.university} onChange={e => setEditForm({...editForm, university: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('priceSingle')} (MKD)</label>
                    <input type="number" value={editForm.price_single || ''} onChange={e => setEditForm({...editForm, price_single: Number(e.target.value)})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('priceFull')} (MKD)</label>
                    <input type="number" value={editForm.price_full || ''} onChange={e => setEditForm({...editForm, price_full: Number(e.target.value)})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('customPriceDisplay')}</label>
                    <input value={editForm.custom_price_display} onChange={e => setEditForm({...editForm, custom_price_display: e.target.value})} placeholder="e.g. From 1200 MKD" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('imageUrl')}</label>
                    <input value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('statusLabel')}</label>
                    <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className={inputCls}>
                      <option value="draft">{t('draft')}</option>
                      <option value="published">{t('published')}</option>
                      <option value="archived">{t('archived')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('professor')}</label>
                    <select value={editForm.professor_id} onChange={e => setEditForm({...editForm, professor_id: e.target.value})} className={inputCls}>
                      <option value="">{t('selectProfessor')}</option>
                      {professors.map(p => <option key={p.id} value={p.id}>{p.full_name || t('unknownProfessor')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('descriptionMk')}</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white resize-none" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('descriptionEn')}</label>
                  <textarea value={editForm.description_en} onChange={e => setEditForm({...editForm, description_en: e.target.value})} rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors">
                    <Save className="h-4 w-4" /> {t('saveChanges')}
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="flex items-center gap-2 px-5 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl transition-colors">
                    <X className="h-4 w-4" /> {t('cancel')}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
