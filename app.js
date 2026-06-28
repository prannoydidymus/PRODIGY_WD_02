/* ==========================================================================
   pulse application engine - logic & persistence
   ========================================================================== */

// --- INITIAL DATA SEEDING ---
const DEFAULT_EMPLOYEES = [
  { id: 'EMP-4821', name: 'Alexander Wright', email: 'alex.wright@pulse.com', phone: '+1 (555) 019-2834', dept: 'Engineering', title: 'Senior Systems Architect', salary: 142000, joinDate: '2022-03-15', status: 'Active', avatar: 'avatar1' },
  { id: 'EMP-4912', name: 'Sophia Martinez', email: 'sophia.m@pulse.com', phone: '+1 (555) 014-9821', dept: 'Design', title: 'Lead Product Designer', salary: 118000, joinDate: '2023-01-10', status: 'Active', avatar: 'avatar2' },
  { id: 'EMP-1102', name: 'Marcus Sterling', email: 'marcus.s@pulse.com', phone: '+1 (555) 017-4310', dept: 'Finance', title: 'Director of Finance', salary: 135000, joinDate: '2021-08-01', status: 'Active', avatar: 'avatar3' },
  { id: 'EMP-3049', name: 'Elena Rostova', email: 'elena.rostova@pulse.com', phone: '+1 (555) 012-3490', dept: 'Marketing', title: 'Growth Manager', salary: 92000, joinDate: '2024-05-18', status: 'On Leave', avatar: 'avatar4' },
  { id: 'EMP-5921', name: 'Jordan Vance', email: 'jordan.vance@pulse.com', phone: '+1 (555) 015-8273', dept: 'Engineering', title: 'Frontend Developer', salary: 88000, joinDate: '2024-09-01', status: 'Active', avatar: 'avatar5' },
  { id: 'EMP-9081', name: 'Aaliyah Jackson', email: 'aaliyah.j@pulse.com', phone: '+1 (555) 011-2098', dept: 'Human Resources', title: 'Talent Specialist', salary: 76000, joinDate: '2023-06-20', status: 'Inactive', avatar: 'avatar6' }
];

// --- AVATAR RESOURCE MAP (Beautiful Inline SVGs) ---
const AVATAR_SVGS = {
  avatar1: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%236366f1'/><circle cx='50' cy='40' r='18' fill='%23e0e7ff'/><path d='M20 78c0-15 15-22 30-22s30 7 30 22v4H20v-4z' fill='%23e0e7ff'/></svg>`,
  avatar2: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2310b981'/><circle cx='50' cy='40' r='18' fill='%23d1fae5'/><path d='M22 76c0-12 10-18 28-18s28 6 28 18v6H22v-6z' fill='%23d1fae5'/><path d='M38 28c3-4 10-6 12-6s9 2 12 6c1 2-1 4-1 4s-4-2-11-2-11 2-11 2-2-2-1-4z' fill='%23047857'/></svg>`,
  avatar3: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23f59e0b'/><circle cx='50' cy='40' r='18' fill='%23fef3c7'/><path d='M20 78c0-15 15-22 30-22s30 7 30 22v4H20v-4z' fill='%23fef3c7'/><path d='M42 35h16v4H42z' fill='%23b45309'/></svg>`,
  avatar4: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23ec4899'/><circle cx='50' cy='42' r='18' fill='%23fce7f3'/><path d='M20 79c0-12 13-19 30-19s30 7 30 19v3H20v-3z' fill='%23fce7f3'/></svg>`,
  avatar5: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%238b5cf6'/><circle cx='50' cy='38' r='18' fill='%23ede9fe'/><path d='M20 78c0-15 15-22 30-22s30 7 30 22v4H20v-4z' fill='%23ede9fe'/></svg>`,
  avatar6: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2306b6d4'/><circle cx='50' cy='40' r='18' fill='%23ecfeff'/><path d='M20 78c0-15 15-22 30-22s30 7 30 22v4H20v-4z' fill='%23ecfeff'/></svg>`
};

const getAvatarUrl = (key) => {
  const svg = AVATAR_SVGS[key] || AVATAR_SVGS.avatar1;
  return `data:image/svg+xml;utf8,${svg}`;
};

// --- APPLICATION STATE ---
let employeeList = [];
let activityLogs = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 5;

// --- DOM ELEMENTS SELECTORS ---
const dom = {
  // Theme Toggle
  themeToggleBtn: document.getElementById('theme-toggle-btn'),

  // Auth Elements
  authSection: document.getElementById('auth-section'),
  appSection: document.getElementById('app-section'),
  loginForm: document.getElementById('login-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  rememberMe: document.getElementById('remember-me'),
  togglePasswordBtn: document.getElementById('toggle-password-btn'),
  eyeIcon: document.getElementById('eye-icon'),
  emailError: document.getElementById('email-error'),
  passwordError: document.getElementById('password-error'),
  forgotPassword: document.getElementById('forgot-password'),

  // Nav Links
  navDashboardBtn: document.getElementById('nav-dashboard-btn'),
  navDirectoryBtn: document.getElementById('nav-directory-btn'),
  logoutBtn: document.getElementById('logout-btn'),

  // Dashboard Metrics
  statTotalEmployees: document.getElementById('stat-total-employees'),
  statAvgSalary: document.getElementById('stat-avg-salary'),
  statActiveRatio: document.getElementById('stat-active-ratio'),
  statActiveBreakdown: document.getElementById('stat-active-breakdown'),
  statDeptCount: document.getElementById('stat-department-count'),
  deptDistributionChart: document.getElementById('dept-distribution-chart'),
  activityLog: document.getElementById('activity-log'),
  welcomeActionBtn: document.getElementById('welcome-action-btn'),

  // Directory UI Controls
  searchInput: document.getElementById('search-input'),
  searchClearBtn: document.getElementById('search-clear-btn'),
  filterDept: document.getElementById('filter-dept'),
  filterStatus: document.getElementById('filter-status'),
  sortBy: document.getElementById('sort-by'),
  addEmployeeBtn: document.getElementById('add-employee-btn'),
  employeeTableBody: document.getElementById('employee-table-body'),
  tableEmptyState: document.getElementById('table-empty-state'),
  emptyStateResetBtn: document.getElementById('empty-state-reset-btn'),

  // Table Pagination
  paginationInfo: document.getElementById('pagination-info'),
  pagStart: document.getElementById('pag-start'),
  pagEnd: document.getElementById('pag-end'),
  pagTotal: document.getElementById('pag-total'),
  paginationButtons: document.getElementById('pagination-buttons'),

  // Toast Container
  toastContainer: document.getElementById('toast-container'),

  // Employee Form Modal
  employeeModal: document.getElementById('employee-modal'),
  employeeForm: document.getElementById('employee-form'),
  modalTitle: document.getElementById('modal-title'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  employeeCancelBtn: document.getElementById('employee-cancel-btn'),
  avatarSelectorGrid: document.getElementById('avatar-selector-grid'),
  employeeAvatar: document.getElementById('employee-avatar'),
  editEmployeeId: document.getElementById('edit-employee-id'),

  // Form Inputs
  empName: document.getElementById('emp-name'),
  empEmail: document.getElementById('emp-email'),
  empPhone: document.getElementById('emp-phone'),
  empDept: document.getElementById('emp-dept'),
  empTitle: document.getElementById('emp-title'),
  empSalary: document.getElementById('emp-salary'),
  empJoinDate: document.getElementById('emp-join-date'),
  empStatus: document.getElementById('emp-status'),

  // Detail Modal
  detailsModal: document.getElementById('details-modal'),
  detailsAvatar: document.getElementById('details-avatar'),
  detailsStatusBadge: document.getElementById('details-status-badge'),
  detailsName: document.getElementById('details-name'),
  detailsTitle: document.getElementById('details-title'),
  detailsDept: document.getElementById('details-dept'),
  detailsEmail: document.getElementById('details-email'),
  detailsPhone: document.getElementById('details-phone'),
  detailsSalary: document.getElementById('details-salary'),
  detailsJoinDate: document.getElementById('details-join-date'),
  detailsId: document.getElementById('details-id'),
  detailsEditShortcutBtn: document.getElementById('details-edit-shortcut-btn'),
  detailsDismissBtn: document.getElementById('details-dismiss-btn'),
  detailsCloseBtn: document.getElementById('details-close-btn'),

  // Delete Modal
  deleteModal: document.getElementById('delete-modal'),
  deleteEmployeeName: document.getElementById('delete-employee-name'),
  deleteEmployeeId: document.getElementById('delete-employee-id'),
  deleteCancelBtn: document.getElementById('delete-cancel-btn'),
  deleteConfirmBtn: document.getElementById('delete-confirm-btn'),
  deleteCloseBtn: document.getElementById('delete-close-btn')
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLocalStorage();
  checkAuthSession();
  setupEventListeners();
  buildAvatarSelector();
});

// Load theme state from storage or system settings
function initTheme() {
  const savedTheme = localStorage.getItem('pulse_theme');
  const html = document.documentElement;
  
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else {
    // Media query matching
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

// Setup local databases if not present
function initLocalStorage() {
  if (!localStorage.getItem('pulse_employees')) {
    localStorage.setItem('pulse_employees', JSON.stringify(DEFAULT_EMPLOYEES));
  }
  employeeList = JSON.parse(localStorage.getItem('pulse_employees'));

  if (!localStorage.getItem('pulse_activity')) {
    const seedLogs = [
      { time: new Date(Date.now() - 3600000 * 2).toISOString(), text: 'System seed data initialized.' },
      { time: new Date(Date.now() - 3600000).toISOString(), text: 'Employee credentials verified.' },
      { time: new Date().toISOString(), text: 'Pulse application launched.' }
    ];
    localStorage.setItem('pulse_activity', JSON.stringify(seedLogs));
  }
  activityLogs = JSON.parse(localStorage.getItem('pulse_activity'));
}

// Check logged in state on launch
function checkAuthSession() {
  const isLocalStorageLogin = localStorage.getItem('pulse_admin_logged_in') === 'true';
  const isSessionStorageLogin = sessionStorage.getItem('pulse_admin_logged_in') === 'true';

  if (isLocalStorageLogin || isSessionStorageLogin) {
    showAppSection();
  } else {
    showAuthSection();
  }
}

// Create layout of choices for profile pictures
function buildAvatarSelector() {
  dom.avatarSelectorGrid.innerHTML = '';
  Object.keys(AVATAR_SVGS).forEach((key, index) => {
    const img = document.createElement('img');
    img.src = getAvatarUrl(key);
    img.className = 'avatar-option';
    img.alt = `Avatar option ${index + 1}`;
    img.dataset.avatarKey = key;
    
    if (index === 0) {
      img.classList.add('selected');
      dom.employeeAvatar.value = key;
    }
    
    img.addEventListener('click', () => {
      document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
      img.classList.add('selected');
      dom.employeeAvatar.value = key;
    });
    
    dom.avatarSelectorGrid.appendChild(img);
  });
}

// ==========================================================================
// THEME & VIEW ROUTING
// ==========================================================================
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('pulse_theme', newTheme);
  
  showToast('Theme Updated', `Switched to ${newTheme} mode dashboard`, 'warning');
}

function showAuthSection() {
  dom.appSection.classList.add('hidden');
  dom.authSection.classList.remove('hidden');
}

function showAppSection() {
  dom.authSection.classList.add('hidden');
  dom.appSection.classList.remove('hidden');
  
  // Trigger initial metrics computation and directory rendering
  recalculateDashboardMetrics();
  renderEmployeeDirectory();
  renderActivityLog();
}

function switchTab(activeBtn, targetPaneId) {
  // Toggle nav buttons
  dom.navDashboardBtn.classList.remove('active');
  dom.navDirectoryBtn.classList.remove('active');
  activeBtn.classList.add('active');

  // Toggle tab panes
  document.getElementById('dashboard-tab').classList.add('hidden');
  document.getElementById('directory-tab').classList.add('hidden');
  document.getElementById(targetPaneId).classList.remove('hidden');

  // Refresh contents based on navigation
  if (targetPaneId === 'dashboard-tab') {
    recalculateDashboardMetrics();
    renderActivityLog();
  } else {
    renderEmployeeDirectory();
  }
}

// ==========================================================================
// AUTHENTICATION LOGIC
// ==========================================================================
function handleLogin(e) {
  e.preventDefault();
  
  const email = dom.loginEmail.value.trim();
  const password = dom.loginPassword.value.trim();
  let isValid = true;

  // Simple Front-end validations
  if (!email) {
    showFieldError(dom.loginEmail, dom.emailError, 'Email address is required.');
    isValid = false;
  } else if (!validateEmailPattern(email)) {
    showFieldError(dom.loginEmail, dom.emailError, 'Please enter a valid email format.');
    isValid = false;
  } else {
    clearFieldError(dom.loginEmail, dom.emailError);
  }

  if (!password) {
    showFieldError(dom.loginPassword, dom.passwordError, 'Password is required.');
    isValid = false;
  } else {
    clearFieldError(dom.loginPassword, dom.passwordError);
  }

  if (!isValid) return;

  // Credentials Matching
  if (email === 'admin@prodigy.com' && password === 'admin123') {
    // Store session settings
    if (dom.rememberMe.checked) {
      localStorage.setItem('pulse_admin_logged_in', 'true');
    } else {
      sessionStorage.setItem('pulse_admin_logged_in', 'true');
    }

    // Success notifications & redirection
    showToast('Login Successful', 'Welcome back, Administrator.', 'success');
    addActivity('Admin logged in securely.');
    
    // Clear inputs
    dom.loginEmail.value = '';
    dom.loginPassword.value = '';
    dom.rememberMe.checked = false;

    showAppSection();
  } else {
    // Shake animation feedback and alerts
    const submitBtn = document.getElementById('login-submit-btn');
    submitBtn.style.animation = 'shake 0.4s ease';
    setTimeout(() => submitBtn.style.animation = '', 400);

    if (email !== 'admin@prodigy.com') {
      showFieldError(dom.loginEmail, dom.emailError, 'Unknown administrative account.');
    } else {
      showFieldError(dom.loginPassword, dom.passwordError, 'Incorrect security password.');
    }
    showToast('Access Denied', 'Invalid credentials provided.', 'danger');
  }
}

function handleLogout() {
  localStorage.removeItem('pulse_admin_logged_in');
  sessionStorage.removeItem('pulse_admin_logged_in');
  
  addActivity('Admin signed out.');
  showToast('Signed Out', 'Your session has been terminated safely.', 'warning');
  
  showAuthSection();
}

function handleForgotPassword(e) {
  e.preventDefault();
  showToast('Reset Instructions', 'Check the browser console. Demo creds are: admin@prodigy.com / admin123', 'warning');
  console.log('Pulse System recovery: admin@prodigy.com | admin123');
}

// Toggle password text mask
function togglePasswordVisibility() {
  const isPassword = dom.loginPassword.type === 'password';
  dom.loginPassword.type = isPassword ? 'text' : 'password';
  
  // Update eye icon state
  if (isPassword) {
    dom.eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
  } else {
    dom.eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
  }
}

// ==========================================================================
// METRICS & ANALYSIS CALCULATION
// ==========================================================================
function recalculateDashboardMetrics() {
  const count = employeeList.length;
  dom.statTotalEmployees.textContent = count;

  if (count === 0) {
    dom.statAvgSalary.textContent = '$0';
    dom.statActiveRatio.textContent = '0%';
    dom.statActiveBreakdown.textContent = '0 Active / 0 Total';
    dom.statDeptCount.textContent = 0;
    dom.deptDistributionChart.innerHTML = `<div class="loading-state">No departmental statistics available.</div>`;
    return;
  }

  // Calculate Average Salary
  const totalSalaries = employeeList.reduce((acc, curr) => acc + Number(curr.salary), 0);
  const avgSalary = Math.round(totalSalaries / count);
  dom.statAvgSalary.textContent = `$${avgSalary.toLocaleString()}`;

  // Calculate Active Presence Ratio (Active + On Leave vs Total)
  const activeCount = employeeList.filter(emp => emp.status === 'Active').length;
  const leaveCount = employeeList.filter(emp => emp.status === 'On Leave').length;
  const presenceRatio = Math.round(((activeCount + leaveCount) / count) * 100);
  dom.statActiveRatio.textContent = `${presenceRatio}%`;
  dom.statActiveBreakdown.textContent = `${activeCount} Active, ${leaveCount} On Leave`;

  // Calculate Departments Count
  const depts = [...new Set(employeeList.map(emp => emp.dept))];
  dom.statDeptCount.textContent = depts.length;

  // Render departmental bar charts dynamically
  renderDepartmentDistribution(depts);
}

function renderDepartmentDistribution(departments) {
  dom.deptDistributionChart.innerHTML = '';
  
  // Compute counts per department
  const deptStats = {};
  departments.forEach(d => deptStats[d] = 0);
  employeeList.forEach(emp => {
    if (deptStats[emp.dept] !== undefined) {
      deptStats[emp.dept]++;
    }
  });

  // Calculate maximum count to define percentage widths
  const counts = Object.values(deptStats);
  const maxCount = Math.max(...counts, 1);

  // Sorting departments by headcount high to low
  const sortedDepts = Object.keys(deptStats).sort((a, b) => deptStats[b] - deptStats[a]);

  sortedDepts.forEach(dept => {
    const headCount = deptStats[dept];
    const percentage = Math.round((headCount / maxCount) * 100);
    
    // Assign unique bar colors based on department
    let barColor = 'var(--indigo-500)';
    if (dept === 'Engineering') barColor = 'var(--indigo-500)';
    else if (dept === 'Design') barColor = 'var(--purple-500)';
    else if (dept === 'Marketing') barColor = 'var(--green-500)';
    else if (dept === 'Finance') barColor = 'var(--cyan-500)';
    else if (dept === 'Human Resources') barColor = 'var(--purple-500)';
    else if (dept === 'Sales') barColor = 'var(--indigo-700)';

    const barGroup = document.createElement('div');
    barGroup.className = 'dept-bar-group';
    barGroup.innerHTML = `
      <div class="dept-bar-info">
        <span class="dept-name">${dept}</span>
        <span class="dept-count"><strong>${headCount}</strong> ${headCount === 1 ? 'employee' : 'employees'}</span>
      </div>
      <div class="dept-progress-outer">
        <div class="dept-progress-inner" style="width: 0%; background-color: ${barColor};"></div>
      </div>
    `;

    dom.deptDistributionChart.appendChild(barGroup);
    
    // Trigger animation slide using small timer delay
    setTimeout(() => {
      const progressBar = barGroup.querySelector('.dept-progress-inner');
      if (progressBar) progressBar.style.width = `${percentage}%`;
    }, 50);
  });
}

// ==========================================================================
// DIRECTORY DISPLAY & RENDERING (CRUD READ)
// ==========================================================================
function renderEmployeeDirectory() {
  const searchQuery = dom.searchInput.value.trim().toLowerCase();
  const selectedDept = dom.filterDept.value;
  const selectedStatus = dom.filterStatus.value;
  const sortingMethod = dom.sortBy.value;

  // Toggle search clear button
  if (searchQuery) {
    dom.searchClearBtn.classList.remove('hidden');
  } else {
    dom.searchClearBtn.classList.add('hidden');
  }

  // 1. FILTERING DATA
  let filtered = employeeList.filter(emp => {
    // Search match (name, email, job title)
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery) ||
                          emp.email.toLowerCase().includes(searchQuery) ||
                          emp.title.toLowerCase().includes(searchQuery) ||
                          emp.id.toLowerCase().includes(searchQuery);

    // Department match
    const matchesDept = selectedDept === 'all' || emp.dept === selectedDept;

    // Status match
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // 2. SORTING DATA
  filtered.sort((a, b) => {
    switch (sortingMethod) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'salary-desc':
        return Number(b.salary) - Number(a.salary);
      case 'salary-asc':
        return Number(a.salary) - Number(b.salary);
      case 'join-date-desc':
        return new Date(b.joinDate) - new Date(a.joinDate);
      default:
        return 0;
    }
  });

  // 3. PAGINATION MATH
  const totalItems = filtered.length;
  const maxPages = Math.max(Math.ceil(totalItems / ITEMS_PER_PAGE), 1);
  
  if (currentPage > maxPages) {
    currentPage = maxPages;
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedList = filtered.slice(startIndex, endIndex);

  // Render empty state if no matching rows
  if (totalItems === 0) {
    dom.employeeTableBody.innerHTML = '';
    dom.tableEmptyState.classList.remove('hidden');
    dom.paginationInfo.style.display = 'none';
    dom.paginationButtons.style.display = 'none';
    return;
  }

  dom.tableEmptyState.classList.add('hidden');
  dom.paginationInfo.style.display = 'block';
  dom.paginationButtons.style.display = 'flex';

  // Update pagination indicators
  dom.pagStart.textContent = totalItems === 0 ? 0 : startIndex + 1;
  dom.pagEnd.textContent = endIndex;
  dom.pagTotal.textContent = totalItems;

  // 4. WRITE TABLE BODY ROWS
  dom.employeeTableBody.innerHTML = '';
  paginatedList.forEach(emp => {
    const tr = document.createElement('tr');
    tr.dataset.id = emp.id;

    // Status badge class mapping
    let statusClass = 'badge-active';
    if (emp.status === 'On Leave') statusClass = 'badge-leave';
    else if (emp.status === 'Inactive') statusClass = 'badge-inactive';

    tr.innerHTML = `
      <td>
        <div class="employee-profile-cell">
          <img src="${getAvatarUrl(emp.avatar)}" alt="${emp.name}" class="table-avatar">
          <div class="employee-name-stack">
            <span class="emp-name-text">${escapeHTML(emp.name)}</span>
            <span class="emp-id-text">${emp.id}</span>
          </div>
        </div>
      </td>
      <td>
        <div class="contact-cell">
          <span class="contact-email">${escapeHTML(emp.email)}</span>
          <span class="contact-phone">${escapeHTML(emp.phone)}</span>
        </div>
      </td>
      <td>
        <div class="dept-cell">
          <span class="dept-title-text">${escapeHTML(emp.title)}</span>
          <span class="dept-name-text">${emp.dept}</span>
        </div>
      </td>
      <td>
        <span class="salary-cell">$${Number(emp.salary).toLocaleString()}</span>
      </td>
      <td>
        <span class="badge ${statusClass}">${emp.status}</span>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn action-btn-view" data-id="${emp.id}" title="View Details" aria-label="View Details of ${escapeHTML(emp.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button class="action-btn action-btn-edit" data-id="${emp.id}" title="Edit Profile" aria-label="Edit Profile of ${escapeHTML(emp.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="action-btn action-btn-delete" data-id="${emp.id}" title="Delete Record" aria-label="Delete Record of ${escapeHTML(emp.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </td>
    `;

    // Attach button event triggers
    tr.querySelector('.action-btn-view').addEventListener('click', () => openDetailsModal(emp.id));
    tr.querySelector('.action-btn-edit').addEventListener('click', () => openEmployeeModal(emp.id));
    tr.querySelector('.action-btn-delete').addEventListener('click', () => openDeleteModal(emp.id, emp.name));

    dom.employeeTableBody.appendChild(tr);
  });

  // Render pagination buttons UI
  renderPaginationButtons(maxPages);
}

function renderPaginationButtons(maxPages) {
  dom.paginationButtons.innerHTML = '';

  // Previous Page Button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pag-btn';
  prevBtn.innerHTML = `&larr;`;
  prevBtn.disabled = currentPage === 1;
  prevBtn.setAttribute('aria-label', 'Previous Page');
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderEmployeeDirectory();
    }
  });
  dom.paginationButtons.appendChild(prevBtn);

  // Number Buttons
  for (let i = 1; i <= maxPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pag-btn ${currentPage === i ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.setAttribute('aria-label', `Page ${i}`);
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderEmployeeDirectory();
    });
    dom.paginationButtons.appendChild(pageBtn);
  }

  // Next Page Button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pag-btn';
  nextBtn.innerHTML = `&rarr;`;
  nextBtn.disabled = currentPage === maxPages;
  nextBtn.setAttribute('aria-label', 'Next Page');
  nextBtn.addEventListener('click', () => {
    if (currentPage < maxPages) {
      currentPage++;
      renderEmployeeDirectory();
    }
  });
  dom.paginationButtons.appendChild(nextBtn);
}

function clearAllFilters() {
  dom.searchInput.value = '';
  dom.filterDept.value = 'all';
  dom.filterStatus.value = 'all';
  dom.sortBy.value = 'name-asc';
  currentPage = 1;
  renderEmployeeDirectory();
  showToast('Filters Cleared', 'Displaying all records.', 'success');
}

// ==========================================================================
// CRUD: CREATE & UPDATE FUNCTIONS
// ==========================================================================
function openEmployeeModal(editId = null) {
  // Clear any existing errors
  clearFormErrors();
  
  if (editId) {
    // Edit Mode Setup
    const emp = employeeList.find(e => e.id === editId);
    if (!emp) return;

    dom.modalTitle.textContent = 'Edit Employee Profile';
    dom.editEmployeeId.value = emp.id;
    
    // Map values to fields
    dom.empName.value = emp.name;
    dom.empEmail.value = emp.email;
    dom.empPhone.value = emp.phone;
    dom.empDept.value = emp.dept;
    dom.empTitle.value = emp.title;
    dom.empSalary.value = emp.salary;
    dom.empJoinDate.value = emp.joinDate;
    dom.empStatus.value = emp.status;

    // Highlight selected avatar key
    dom.employeeAvatar.value = emp.avatar;
    document.querySelectorAll('.avatar-option').forEach(el => {
      if (el.dataset.avatarKey === emp.avatar) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });

  } else {
    // Create Mode Setup
    dom.modalTitle.textContent = 'Add New Employee';
    dom.editEmployeeId.value = '';
    
    dom.employeeForm.reset();
    
    // Default Join Date to current local date
    const today = new Date().toISOString().split('T')[0];
    dom.empJoinDate.value = today;
    dom.empStatus.value = 'Active';

    // Select first avatar as default selection
    const firstAvatarKey = Object.keys(AVATAR_SVGS)[0];
    dom.employeeAvatar.value = firstAvatarKey;
    document.querySelectorAll('.avatar-option').forEach((el, idx) => {
      if (idx === 0) el.classList.add('selected');
      else el.classList.remove('selected');
    });
  }

  // Display overlay card
  dom.employeeModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Lock background scrolling
}

function closeEmployeeModal() {
  dom.employeeModal.classList.add('hidden');
  document.body.style.overflow = '';
}

function handleEmployeeFormSubmit(e) {
  e.preventDefault();
  
  const editId = dom.editEmployeeId.value;
  const name = dom.empName.value.trim();
  const email = dom.empEmail.value.trim();
  const phone = dom.empPhone.value.trim();
  const dept = dom.empDept.value;
  const title = dom.empTitle.value.trim();
  const salary = dom.empSalary.value;
  const joinDate = dom.empJoinDate.value;
  const status = dom.empStatus.value;
  const avatarKey = dom.employeeAvatar.value;

  let isValid = true;

  // Validation Check: Name length
  if (!name) {
    showFieldError(dom.empName, document.getElementById('emp-name-error'), 'Full name is required.');
    isValid = false;
  } else if (name.length < 2) {
    showFieldError(dom.empName, document.getElementById('emp-name-error'), 'Name must be at least 2 characters.');
    isValid = false;
  } else {
    clearFieldError(dom.empName, document.getElementById('emp-name-error'));
  }

  // Validation Check: Email pattern
  if (!email) {
    showFieldError(dom.empEmail, document.getElementById('emp-email-error'), 'Email address is required.');
    isValid = false;
  } else if (!validateEmailPattern(email)) {
    showFieldError(dom.empEmail, document.getElementById('emp-email-error'), 'Enter a valid corporate email (e.g., name@domain.com).');
    isValid = false;
  } else {
    // Check if email already exists (excluding the current employee if editing)
    const exists = employeeList.some(emp => emp.email.toLowerCase() === email.toLowerCase() && emp.id !== editId);
    if (exists) {
      showFieldError(dom.empEmail, document.getElementById('emp-email-error'), 'This email is already registered to another employee.');
      isValid = false;
    } else {
      clearFieldError(dom.empEmail, document.getElementById('emp-email-error'));
    }
  }

  // Validation Check: Phone number
  if (!phone) {
    showFieldError(dom.empPhone, document.getElementById('emp-phone-error'), 'Phone number is required.');
    isValid = false;
  } else {
    clearFieldError(dom.empPhone, document.getElementById('emp-phone-error'));
  }

  // Validation Check: Department selection
  if (!dept) {
    showFieldError(dom.empDept, document.getElementById('emp-dept-error'), 'Please select a operational department.');
    isValid = false;
  } else {
    clearFieldError(dom.empDept, document.getElementById('emp-dept-error'));
  }

  // Validation Check: Job Title
  if (!title) {
    showFieldError(dom.empTitle, document.getElementById('emp-title-error'), 'Job title is required.');
    isValid = false;
  } else {
    clearFieldError(dom.empTitle, document.getElementById('emp-title-error'));
  }

  // Validation Check: Salary range
  if (!salary) {
    showFieldError(dom.empSalary, document.getElementById('emp-salary-error'), 'Salary is required.');
    isValid = false;
  } else if (Number(salary) < 1000) {
    showFieldError(dom.empSalary, document.getElementById('emp-salary-error'), 'Salary must be at least $1,000 USD.');
    isValid = false;
  } else {
    clearFieldError(dom.empSalary, document.getElementById('emp-salary-error'));
  }

  // Validation Check: Join date
  if (!joinDate) {
    showFieldError(dom.empJoinDate, document.getElementById('emp-join-date-error'), 'Please select the contract join date.');
    isValid = false;
  } else {
    clearFieldError(dom.empJoinDate, document.getElementById('emp-join-date-error'));
  }

  // Stop if invalid
  if (!isValid) return;

  if (editId) {
    // ---------------- UPDATE ----------------
    const index = employeeList.findIndex(e => e.id === editId);
    if (index === -1) return;

    employeeList[index] = {
      ...employeeList[index],
      name, email, phone, dept, title, salary: Number(salary), joinDate, status, avatar: avatarKey
    };

    saveEmployeesToStorage();
    addActivity(`Updated employee profile: ${name} (${editId})`);
    showToast('Profile Updated', `${name}'s profile was successfully updated.`, 'success');
  } else {
    // ---------------- CREATE ----------------
    const newId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmp = {
      id: newId, name, email, phone, dept, title, salary: Number(salary), joinDate, status, avatar: avatarKey
    };

    employeeList.push(newEmp);
    saveEmployeesToStorage();
    addActivity(`Onboarded new employee: ${name} (${newId})`);
    showToast('Employee Added', `${name} has been added to the roster.`, 'success');
  }

  // Refresh UI displays
  closeEmployeeModal();
  renderEmployeeDirectory();
}

function saveEmployeesToStorage() {
  localStorage.setItem('pulse_employees', JSON.stringify(employeeList));
}

// ==========================================================================
// CRUD: READ SPECIFIC PROFILE DETAILS
// ==========================================================================
function openDetailsModal(id) {
  const emp = employeeList.find(e => e.id === id);
  if (!emp) return;

  dom.detailsAvatar.src = getAvatarUrl(emp.avatar);
  dom.detailsName.textContent = emp.name;
  dom.detailsTitle.textContent = emp.title;
  dom.detailsDept.textContent = `${emp.dept} Department`;
  dom.detailsEmail.textContent = emp.email;
  dom.detailsPhone.textContent = emp.phone;
  dom.detailsSalary.textContent = `$${Number(emp.salary).toLocaleString()}`;
  
  // Format Date to long form (e.g., Oct 12, 2021)
  const d = new Date(emp.joinDate);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  dom.detailsJoinDate.textContent = d.toLocaleDateString('en-US', options);
  dom.detailsId.textContent = emp.id;

  // Badge Status Style
  dom.detailsStatusBadge.className = 'badge';
  if (emp.status === 'Active') {
    dom.detailsStatusBadge.classList.add('badge-active');
  } else if (emp.status === 'On Leave') {
    dom.detailsStatusBadge.classList.add('badge-leave');
  } else {
    dom.detailsStatusBadge.classList.add('badge-inactive');
  }
  dom.detailsStatusBadge.textContent = emp.status;

  // Bind shortcut edit button trigger
  dom.detailsEditShortcutBtn.onclick = () => {
    closeDetailsModal();
    openEmployeeModal(emp.id);
  };

  dom.detailsModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDetailsModal() {
  dom.detailsModal.classList.add('hidden');
  document.body.style.overflow = '';
}

// ==========================================================================
// CRUD: DELETE FUNCTIONS
// ==========================================================================
function openDeleteModal(id, name) {
  dom.deleteEmployeeId.value = id;
  dom.deleteEmployeeName.textContent = name;
  
  dom.deleteModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  dom.deleteModal.classList.add('hidden');
  document.body.style.overflow = '';
}

function handleConfirmDelete() {
  const deleteId = dom.deleteEmployeeId.value;
  const emp = employeeList.find(e => e.id === deleteId);
  
  if (!emp) return;

  // Filter out record from array
  employeeList = employeeList.filter(e => e.id !== deleteId);
  saveEmployeesToStorage();

  addActivity(`Deleted employee record: ${emp.name} (${deleteId})`);
  showToast('Record Deleted', `${emp.name}'s data has been removed.`, 'danger');

  closeDeleteModal();
  renderEmployeeDirectory();
}

// ==========================================================================
// TOAST ALERT FEEDBACK ENGINE
// ==========================================================================
function showToast(title, description, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconSvg = '';
  switch (type) {
    case 'success':
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      break;
    case 'danger':
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      break;
    case 'warning':
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
      break;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-content">
      <h4 class="toast-title">${escapeHTML(title)}</h4>
      <p class="toast-desc">${escapeHTML(description)}</p>
    </div>
    <button class="toast-close" aria-label="Dismiss Notification">&times;</button>
  `;

  // Append toast
  dom.toastContainer.appendChild(toast);

  // Bind manual close click
  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });

  // Self destruction timer (4 seconds)
  setTimeout(() => {
    removeToast(toast);
  }, 4000);
}

function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100%) scale(0.9)';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 250);
}

// ==========================================================================
// SYSTEM LOG AUDITING & ACTIVITIES
// ==========================================================================
function addActivity(text) {
  const logItem = {
    time: new Date().toISOString(),
    text: text
  };

  activityLogs.unshift(logItem);
  
  // Cap logs size at 15 items
  if (activityLogs.length > 15) {
    activityLogs = activityLogs.slice(0, 15);
  }

  localStorage.setItem('pulse_activity', JSON.stringify(activityLogs));
}

function renderActivityLog() {
  dom.activityLog.innerHTML = '';
  
  if (activityLogs.length === 0) {
    dom.activityLog.innerHTML = `<div class="text-muted text-center py-6">No audits reported.</div>`;
    return;
  }

  activityLogs.forEach((log) => {
    const item = document.createElement('div');
    item.className = 'activity-item';

    // Parse timing distance string
    const timeDiffText = getTimeDistanceString(new Date(log.time));

    item.innerHTML = `
      <div class="activity-dot bg-indigo"></div>
      <div class="activity-info">
        <span class="activity-time">${timeDiffText}</span>
        <p class="activity-text">${escapeHTML(log.text)}</p>
      </div>
    `;
    dom.activityLog.appendChild(item);
  });
}

function getTimeDistanceString(time) {
  const seconds = Math.floor((new Date() - time) / 1000);
  
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return time.toLocaleDateString();
}

// ==========================================================================
// GENERAL UTILITIES & FIELD ERROR FORMATTERS
// ==========================================================================
function showFieldError(inputEl, errorEl, msg) {
  inputEl.style.borderColor = 'var(--danger-500)';
  errorEl.textContent = msg;
  errorEl.style.opacity = '1';
}

function clearFieldError(inputEl, errorEl) {
  inputEl.style.borderColor = '';
  errorEl.textContent = '';
  errorEl.style.opacity = '0';
}

function clearFormErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
    el.style.opacity = '0';
  });
  document.querySelectorAll('.employee-form input, .employee-form select').forEach(el => {
    el.style.borderColor = '';
  });
}

function validateEmailPattern(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// ==========================================================================
// CENTRALIZED EVENT LISTENER BINDINGS
// ==========================================================================
function setupEventListeners() {
  // Theme Toggle Button
  dom.themeToggleBtn.addEventListener('click', toggleTheme);

  // Authentication Triggers
  dom.loginForm.addEventListener('submit', handleLogin);
  dom.logoutBtn.addEventListener('click', handleLogout);
  dom.forgotPassword.addEventListener('click', handleForgotPassword);
  dom.togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

  // Nav Links Tabs Triggers
  dom.navDashboardBtn.addEventListener('click', () => switchTab(dom.navDashboardBtn, 'dashboard-tab'));
  dom.navDirectoryBtn.addEventListener('click', () => switchTab(dom.navDirectoryBtn, 'directory-tab'));
  dom.welcomeActionBtn.addEventListener('click', () => {
    switchTab(dom.navDirectoryBtn, 'directory-tab');
    openEmployeeModal();
  });

  // Directory Control Listeners
  dom.searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderEmployeeDirectory();
  });
  
  dom.searchClearBtn.addEventListener('click', () => {
    dom.searchInput.value = '';
    currentPage = 1;
    renderEmployeeDirectory();
  });

  dom.filterDept.addEventListener('change', () => {
    currentPage = 1;
    renderEmployeeDirectory();
  });

  dom.filterStatus.addEventListener('change', () => {
    currentPage = 1;
    renderEmployeeDirectory();
  });

  dom.sortBy.addEventListener('change', () => {
    currentPage = 1;
    renderEmployeeDirectory();
  });

  dom.emptyStateResetBtn.addEventListener('click', clearAllFilters);
  dom.addEmployeeBtn.addEventListener('click', () => openEmployeeModal());

  // Form Modals Action Listeners
  dom.employeeForm.addEventListener('submit', handleEmployeeFormSubmit);
  dom.modalCloseBtn.addEventListener('click', closeEmployeeModal);
  dom.employeeCancelBtn.addEventListener('click', closeEmployeeModal);
  
  // Detail Modal Actions
  dom.detailsDismissBtn.addEventListener('click', closeDetailsModal);
  dom.detailsCloseBtn.addEventListener('click', closeDetailsModal);

  // Delete Modal Actions
  dom.deleteConfirmBtn.addEventListener('click', handleConfirmDelete);
  dom.deleteCancelBtn.addEventListener('click', closeDeleteModal);
  dom.deleteCloseBtn.addEventListener('click', closeDeleteModal);

  // Click outside to close modals
  window.addEventListener('click', (e) => {
    if (e.target === dom.employeeModal) closeEmployeeModal();
    if (e.target === dom.detailsModal) closeDetailsModal();
    if (e.target === dom.deleteModal) closeDeleteModal();
  });
}
