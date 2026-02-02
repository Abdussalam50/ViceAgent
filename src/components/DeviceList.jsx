import * as React from 'react';
import { supabase } from '../api/supabase';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DeviceList = ({ devices, profile, onRefresh, onUpdateDevice }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState('edit'); // 'add' | 'edit'
  const [selectedDevice, setSelectedDevice] = React.useState(null);

  // Form State
  const [formData, setFormData] = React.useState({
    device_name: '',
    project_name: '', // Added project_name
    target_path: '',
    scan_interval: 30,
    language: 'python'
  });

  // Open Modal Helpers
  const openAddModal = () => {
    setModalMode('add');
    setFormData({ device_name: '', project_name: '', target_path: '', scan_interval: 30, language: 'python' });
    setIsModalOpen(true);
  };

  const openEditModal = (device) => {
    setModalMode('edit');
    setSelectedDevice(device);
    setFormData({
      device_name: device.device_name,
      project_name: device.project_name || '', // Load existing project_name
      target_path: device.target_path || '',
      scan_interval: device.scan_interval || 30,
      language: device.language || 'python'
    });
    setIsModalOpen(true);
  };

  // CRUD Handlers
  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("No authenticated user found. Operations might fail due to RLS.");
      }
      const userId = user?.id;

      // Validation: Check for duplicate scan interval on the same device
      const intervalNum = parseInt(formData.scan_interval);
      const isDuplicateInterval = devices.some(d =>
        d.device_name === formData.device_name &&
        d.scan_interval === intervalNum &&
        (modalMode === 'add' || d.id !== selectedDevice.id)
      );

      if (isDuplicateInterval) {
        alert(t('interval_duplicate_error', { interval: intervalNum, device: formData.device_name }));
        return;
      }


      if (modalMode === 'add') {
        const countCurrentProject = devices.length;
        if (!profile?.is_pro && countCurrentProject >= 2) {
          alert(t('project_limit_error'));
          return;
        }
        const insertPayload = {
          device_name: formData.device_name,
          project_name: formData.project_name,
          target_path: formData.target_path,
          scan_interval: intervalNum,
          language: formData.language
        };
        if (userId) insertPayload.user_id = userId;

        const { error } = await supabase.from('agent_configs').insert([insertPayload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('agent_configs')
          .update({
            scan_interval: intervalNum,
            target_path: formData.target_path,
            language: formData.language,
            project_name: formData.project_name
          })
          .eq('id', selectedDevice.id);
        if (error) throw error;
      }
      onRefresh();
      setIsModalOpen(false);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_confirm'))) return;
    try {
      const { error } = await supabase.from('agent_configs').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      alert("Error deleting: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-700">{t('project_configs_title')}</h3>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition"
        >
          {t('add_project_btn')}
        </button>
      </div>

      {devices.map((device) => (
        <div key={device.id} className="glass-card p-6 flex justify-between items-center transition-all hover:scale-[1.01]">

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-bold text-slate-800">{device.device_name}</h4>
              <span className="badge-online text-[10px]">Active</span>
              {device.language && (
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono font-bold ${device.language === 'python' ? 'bg-blue-100 text-blue-600' :
                  device.language === 'javascript' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                  {device.language}
                </span>
              )}
            </div>
            {/* Show Project Name if available */}
            <p className="text-xs text-slate-600 font-bold mt-1">{device.project_name}</p>
            <p className="text-sm text-slate-500 font-mono mt-0">{device.target_path}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold leading-none">{t('interval')}</p>
              <p className="text-lg font-black text-slate-700">{device.scan_interval}m</p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl flex items-center gap-3 border border-slate-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={device.is_active !== false}
                  onChange={() => onUpdateDevice(device.id, { is_active: device.is_active === false })}
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
              <div className="text-left w-12">
                <p className={`text-[9px] font-black uppercase ${device.is_active !== false ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {device.is_active !== false ? 'Active' : 'Paused'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(device)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 transition-all"
              >
                {t('edit')}
              </button>
              <button
                onClick={() => handleDelete(device.id)}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-100 transition-all"
              >
                {t('delete_btn')}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* --- MODAL OVERLAY --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">{modalMode === 'add' ? t('add_new_project_title') : t('edit_settings_title')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Device Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('device_name_label')}</label>
                <input
                  type="text"
                  value={formData.device_name}
                  onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                  disabled={modalMode === 'edit'}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold ${modalMode === 'edit' ? 'bg-slate-100 text-slate-500' : ''}`}
                  placeholder="e.g. LAPTOP-001"
                />
              </div>

              {/* Project Name - NEW FIELD */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('project_name_label')}</label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-semibold"
                  placeholder="e.g. E-Commerce Backend"
                />
              </div>

              {/* Target Path */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('target_path_label')}</label>
                <input
                  type="text"
                  value={formData.target_path}
                  onChange={(e) => setFormData({ ...formData, target_path: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  placeholder="e.g. C:\Projects\MyCode"
                />
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('language_label')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['python', 'javascript', 'php'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setFormData({ ...formData, language: lang })}
                      className={`py-2 rounded-lg text-sm font-bold capitalize transition-all border ${formData.language === lang
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('scan_interval_label')}</label>
                <input
                  type="number"
                  value={formData.scan_interval}
                  onChange={(e) => setFormData({ ...formData, scan_interval: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg font-semibold"
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-gray-200 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                {modalMode === 'add' ? t('create_project_btn') : t('save_changes_btn')}
              </button>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default DeviceList;