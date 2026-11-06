import { supabase } from './supabaseClient.js';

export const Storage = {
    // --- TỔ CHỨC / ĐỐI TÁC ---
    getOrgs: async () => {
        const { data, error } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
        if (error) { console.error(error); return []; }
        return data;
    },
    saveOrg: async (o) => {
        const { error } = await supabase.from('organizations').insert([o]);
        if (error) alert("Lỗi khi ghi danh tổ chức: " + error.message);
    },
    updateOrgStatus: async (id, newStatus) => {
        const { error } = await supabase.from('organizations').update({ status: newStatus }).eq('id', id);
        if (error) alert("Lỗi cập nhật: " + error.message);
    },
    deleteOrg: async (id) => {
        const { error } = await supabase.from('organizations').delete().eq('id', id);
        if (error) alert("Lỗi khi xóa: " + error.message);
    },

    // --- HỒ SƠ CÁ NHÂN (WORKERS) ---
    getWorkers: async () => {
        const { data, error } = await supabase.from('workers').select('*').order('created_at', { ascending: false });
        if (error) { console.error(error); return []; }
        return data;
    },
    saveWorker: async (w) => {
        const { error } = await supabase.from('workers').insert([w]);
        if (error) alert("Lỗi khi đăng ký hồ sơ: " + error.message);
    },
    updateWorkerStatus: async (id, newStatus) => {
        const { error } = await supabase.from('workers').update({ status: newStatus }).eq('id', id);
        if (error) alert("Lỗi cập nhật: " + error.message);
    },
    deleteWorker: async (id) => {
        const { error } = await supabase.from('workers').delete().eq('id', id);
        if (error) alert("Lỗi khi xóa: " + error.message);
    }
};