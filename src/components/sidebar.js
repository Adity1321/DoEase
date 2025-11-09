import { createIcons, AlarmCheck, CheckSquare, BarChart2, User, LogOut } from 'lucide';

export class Sidebar {
  constructor(user, activeView, onNavigate, onLogout) {
    this.user = user;
    this.activeView = activeView;
    this.onNavigate = onNavigate;
    this.onLogout = onLogout;
    this.element = null;
  }

  render() {
    this.element = document.createElement('aside');
    this.element.className = 'sidebar';

    const initials = this.user.username.substring(0, 2).toUpperCase();

    this.element.innerHTML = `
      <div class="sidebar-header">
        <div class="logo">
          <i data-lucide="alarm-check"></i>
          <span class="logo-text">DoEase</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <a href="#" class="nav-link ${this.activeView === 'tasks' ? 'active' : ''}" data-view="tasks">
          <i data-lucide="check-square"></i>
          <span>Tasks</span>
        </a>
        <a href="#" class="nav-link ${this.activeView === 'analytics' ? 'active' : ''}" data-view="analytics">
          <i data-lucide="bar-chart-2"></i>
          <span>Analytics</span>
        </a>
        <a href="#" class="nav-link ${this.activeView === 'profile' ? 'active' : ''}" data-view="profile">
          <i data-lucide="user"></i>
          <span>Profile</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">${initials}</div>
          <div class="user-details">
            <span class="username">${this.user.username}</span>
            <span class="email">${this.user.email}</span>
          </div>
        </div>
        <button id="signOutBtn" class="btn btn-danger">
          <i data-lucide="log-out"></i>
          <span>Sign Out</span>
        </button>
      </div>
    `;

    this.element.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.onNavigate(link.dataset.view);
      });
    });

    this.element.querySelector('#signOutBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out?')) {
        this.onLogout();
      }
    });

    createIcons({
      icons: {
        AlarmCheck,
        CheckSquare,
        BarChart2,
        User,
        LogOut
      }
    });

    return this.element;
  }

  setActiveView(view) {
    if (!this.element) return;
    this.element.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.view === view) {
        link.classList.add('active');
      }
    });
  }
}
