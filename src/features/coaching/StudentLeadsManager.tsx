import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Download, 
  Calendar, 
  GraduationCap, 
  School, 
  MapPin, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  UserCheck, 
  X,
  FileSpreadsheet,
  Send,
  Sparkles
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdmissionLead, LeadStatus } from './marketplaceTypes';
import { INITIAL_ADMISSION_LEADS } from './marketplaceData';

interface StudentLeadsManagerProps {
  coachingId?: string;
  coachingName?: string;
}

export const StudentLeadsManager: React.FC<StudentLeadsManagerProps> = ({
  coachingId,
  coachingName
}) => {
  const [leads, setLeads] = useState<AdmissionLead[]>(() => {
    try {
      const stored = localStorage.getItem('dapathshala_coaching_leads');
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem('dapathshala_coaching_leads', JSON.stringify(INITIAL_ADMISSION_LEADS));
      return INITIAL_ADMISSION_LEADS;
    } catch {
      return INITIAL_ADMISSION_LEADS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [selectedLeadForNote, setSelectedLeadForNote] = useState<AdmissionLead | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('dapathshala_coaching_leads', JSON.stringify(leads));
    } catch {}
  }, [leads]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { ...l, status: newStatus };
      }
      return l;
    }));

    const statusLabels: Record<LeadStatus, string> = {
      new: 'নতুন',
      contacted: 'যোগাযোগ সম্পন্ন',
      enrolled: 'ভর্তি নিশ্চিত',
      cancelled: 'বাতিল'
    };
    showToast(`আবেদনের স্ট্যাটাস পরিবর্তিত: ${statusLabels[newStatus]}`);
  };

  const handleSaveAdminNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForNote) return;

    setLeads(prev => prev.map(l => {
      if (l.id === selectedLeadForNote.id) {
        return { ...l, adminNotes: adminNoteInput };
      }
      return l;
    }));

    setSelectedLeadForNote(null);
    setAdminNoteInput('');
    showToast('অ্যাডমিন ফলো-আপ নোট সংরক্ষিত হয়েছে।');
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই আবেদন তালিকা থেকে মুছে ফেলতে চান?')) {
      setLeads(prev => prev.filter(l => l.id !== leadId));
      showToast('আবেদন সফলভাবে মুছে ফেলা হয়েছে।');
    }
  };

  const handleExportCSV = () => {
    const headers = ['আইডি', 'শিক্ষার্থীর নাম', 'মোবাইল', 'প্রতিষ্ঠান', 'শ্রেণি', 'কোর্স', 'শিফট', 'অভিভাবক', 'অভিভাবকের ফোন', 'তারিখ', 'স্ট্যাটাস', 'নোট'];
    const rows = filteredLeads.map(l => [
      l.id,
      `"${l.studentName}"`,
      `"${l.phone}"`,
      `"${l.currentInstitution}"`,
      `"${l.classLevel}"`,
      `"${l.programInterest}"`,
      `"${l.preferredShift}"`,
      `"${l.guardianName}"`,
      `"${l.guardianPhone}"`,
      `"${new Date(l.appliedAt).toLocaleDateString('bn-BD')}"`,
      `"${l.status}"`,
      `"${l.adminNotes || l.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dapathshala_admission_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV ফাইল ডাউনলোড সম্পন্ন হয়েছে।');
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    // If coachingId passed and it doesn't match, we still allow displaying sample/general leads or matched leads
    const matchesSearch = 
      lead.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.currentInstitution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.programInterest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.coachingName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const contactedCount = leads.filter(l => l.status === 'contacted').length;
  const enrolledCount = leads.filter(l => l.status === 'enrolled').length;

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
            <Users size={14} className="text-emerald-600" />
            <span>ভর্তি ব্যবস্থাপনা ও প্রসপেক্টাস লিডস</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">ভর্তি ইচ্ছুক শিক্ষার্থীদের তালিকা (Student Leads)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            মার্কেটপ্লেস ও ডিরেক্টরি থেকে সরাসরি আসা ভর্তি আবেদনসমূহ পর্যবেক্ষণ ও ফলো-আপ করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="text-xs font-bold gap-1.5 border-slate-300 text-slate-700 cursor-pointer"
          >
            <Download size={14} />
            <span>CSV এক্সপোর্ট</span>
          </Button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-none shadow-sm bg-white flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">মোট আবেদন</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalLeads} জন</p>
          </div>
        </Card>

        <Card className="p-4 border-none shadow-sm bg-white flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">নতুন আবেদন</span>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{newLeadsCount} জন</p>
          </div>
        </Card>

        <Card className="p-4 border-none shadow-sm bg-white flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Phone size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">যোগাযোগ সম্পন্ন</span>
            <p className="text-2xl font-black text-indigo-600 mt-0.5">{contactedCount} জন</p>
          </div>
        </Card>

        <Card className="p-4 border-none shadow-sm bg-white flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">সফল ভর্তি</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{enrolledCount} জন</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-none shadow-sm bg-white space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="শিক্ষার্থী নাম, মোবাইল বা কলেজ লিখে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `সকল (${totalLeads})` },
              { id: 'new', label: `নতুন (${newLeadsCount})` },
              { id: 'contacted', label: `যোগাযোগকৃত (${contactedCount})` },
              { id: 'enrolled', label: `ভর্তিকৃত (${enrolledCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Leads Table / Cards */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
            <Users size={36} className="mx-auto text-slate-300" />
            <h4 className="text-base font-bold text-slate-700">কোনো ভর্তি আবেদন পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              শিক্ষার্থীরা মার্কেটপ্লেস থেকে আপনার প্রতিষ্ঠানে আবেদন করলে সরাসরি এখানে জমা হবে।
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const waGreeting = encodeURIComponent(
              `আসসালামু আলাইকুম ${lead.studentName}! আমি ${lead.coachingName} থেকে যোগাযোগ করছি। আপনি "${lead.programInterest}" কোর্সে ভর্তির যে আবেদন করেছিলেন, সে সম্পর্কে কথা বলতে চাচ্ছি।`
            );

            return (
              <div 
                key={lead.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-sm space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-100">
                      {lead.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{lead.studentName}</h3>
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {lead.id}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          lead.status === 'new'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : lead.status === 'contacted'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : lead.status === 'enrolled'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {lead.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
                          {lead.status === 'new' ? 'নতুন আবেদন' : lead.status === 'contacted' ? 'যোগাযোগ সম্পন্ন' : lead.status === 'enrolled' ? 'ভর্তি সম্পন্ন' : 'বাতিল'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <School size={13} className="text-slate-400" /> {lead.currentInstitution}
                        </span>
                        <span>•</span>
                        <span className="text-slate-600 font-bold">{lead.classLevel}</span>
                        <span>•</span>
                        <span className="text-slate-400">
                          {new Date(lead.appliedAt).toLocaleDateString('bn-BD', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {/* Status Changer */}
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                      aria-label="আবেদনের অবস্থা পরিবর্তন করুন"
                      className="bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
                    >
                      <option value="new">নতুন আবেদন</option>
                      <option value="contacted">যোগাযোগ সম্পন্ন</option>
                      <option value="enrolled">ভর্তি সম্পন্ন (Enrolled)</option>
                      <option value="cancelled">বাতিল</option>
                    </select>

                    {/* WhatsApp Action */}
                    <a
                      href={`https://wa.me/88${lead.phone.replace(/[^0-9]/g, '')}?text=${waGreeting}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      WhatsApp
                    </a>

                    {/* Call Action */}
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Phone size={14} />
                      কল দিন
                    </a>

                    {/* Add note */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLeadForNote(lead);
                        setAdminNoteInput(lead.adminNotes || '');
                      }}
                      className="text-xs font-bold text-slate-600 hover:bg-slate-100 p-2"
                      title="অ্যাডমিন নোট যুক্ত করুন"
                    >
                      <Edit3 size={15} />
                    </Button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="আবেদন মুছে ফেলুন"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Lead details summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">আগ্রহের কোর্স:</span>
                    <span className="font-bold text-slate-800">{lead.programInterest}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">পছন্দের শিফট:</span>
                    <span className="font-bold text-slate-800">{lead.preferredShift}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">অভিভাবক ও ফোন:</span>
                    <span className="font-bold text-slate-800">
                      {lead.guardianName} ({lead.guardianPhone})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">শিক্ষার্থী ফোন:</span>
                    <span className="font-bold text-slate-800 font-mono">{lead.phone}</span>
                  </div>
                </div>

                {/* Student message or admin note */}
                {(lead.notes || lead.adminNotes) && (
                  <div className="space-y-1.5 text-xs">
                    {lead.notes && (
                      <div className="text-slate-600 bg-amber-50/50 border border-amber-100 rounded-lg p-2.5">
                        <span className="font-bold text-amber-800 mr-1.5">শিক্ষার্থীর মন্তব্য:</span>
                        <span>{lead.notes}</span>
                      </div>
                    )}
                    {lead.adminNotes && (
                      <div className="text-slate-700 bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5">
                        <span className="font-bold text-emerald-800 mr-1.5">অ্যাডমিন ফলো-আপ নোট:</span>
                        <span>{lead.adminNotes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Admin Note Modal */}
      {selectedLeadForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 size={18} className="text-emerald-600" />
                ফলো-আপ নোট যোগ করুন
              </h3>
              <button
                onClick={() => setSelectedLeadForNote(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              শিক্ষার্থী: <strong className="text-slate-800">{selectedLeadForNote.studentName}</strong> ({selectedLeadForNote.phone})
            </p>

            <form onSubmit={handleSaveAdminNote} className="space-y-4">
              <textarea
                rows={3}
                required
                placeholder="যেমন: অভিভাবকের সাথে কথা হয়েছে। শুক্রবারে ফি দিয়ে এডমিশন কনফার্ম করবেন..."
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedLeadForNote(null)}
                  className="text-xs font-bold"
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  সংরক্ষণ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
