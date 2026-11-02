//File khởi chạy chính
import { initAuthModal } from './auth-modal.js';
import { initPostJobModal } from './post-job-modal.js';
import { initOrgModals } from './org-modal.js';
import { initTrashModal } from './trash-modal.js';
import { renderJobs, renderOrganizations } from './render.js';

document.addEventListener('DOMContentLoaded', () => {
    const trash = initTrashModal();
    initAuthModal(() => { renderJobs(); trash.updateUI(); });
    initPostJobModal(() => renderJobs());
    initOrgModals(() => renderOrganizations());

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(t => t.id === tabId ? t.classList.remove('hidden') : t.classList.add('hidden'));
            if (tabId === 'tabOrganization') renderOrganizations();
        });
    });

    renderJobs();
});