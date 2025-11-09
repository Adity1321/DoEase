import { TaskManager } from '../components/task-manager.js';
import { Analytics } from '../components/analytics.js';
import { ProfileScreen } from './profile.js';
import { Sidebar } from '../components/sidebar.js';

export class DashboardScreen {
  constructor(storage, user, onLogout, onUserUpdate) {
    this.storage = storage;
    this.user = user;
    this.onLogout = onLogout;
    this.onUserUpdate = onUserUpdate;
    this.currentView = 'tasks';
    this.element = document.createElement('div');
    this.element.className = 'dashboard-container';

    this.sidebar = new Sidebar(
      this.user,
      this.currentView,
      this.handleNavigate.bind(this),
      this.onLogout
    );
  }

  render() {
    this.element.innerHTML = '';

    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-nav-toggle';
    mobileToggle.innerHTML = `<span></span><span></span><span></span>`;
    mobileToggle.addEventListener('click', () => {
      this.element.querySelector('.sidebar').classList.toggle('open');
    });

    const sidebarEl = this.sidebar.render();

    const mainContent = document.createElement('main');
    mainContent.className = 'main-content';
    mainContent.innerHTML = `
      <header class="content-header">
        <h2 id="viewTitle"></h2>
      </header>
      <div id="viewContent"></div>
    `;

    this.element.appendChild(mobileToggle);
    this.element.appendChild(sidebarEl);
    this.element.appendChild(mainContent);

    this.renderViewContent();

    return this.element;
  }

  handleNavigate(view) {
    this.currentView = view;
    this.sidebar.setActiveView(view);
    this.renderViewContent();

    const sidebarEl = this.element.querySelector('.sidebar');
    if (sidebarEl && sidebarEl.classList.contains('open')) {
      sidebarEl.classList.remove('open');
    }
  }

  renderViewContent() {
    const contentContainer = this.element.querySelector('#viewContent');
    const titleEl = this.element.querySelector('#viewTitle');
    if (!contentContainer || !titleEl) return;

    contentContainer.innerHTML = '';

    let viewComponent;
    let viewTitle = '';

    if (this.currentView === 'tasks') {
      viewComponent = new TaskManager(this.storage, this.user.id);
      viewTitle = 'Tasks Dashboard';
    } else if (this.currentView === 'analytics') {
      viewComponent = new Analytics(this.storage, this.user.id);
      viewTitle = 'Analytics';
    } else if (this.currentView === 'profile') {
      viewComponent = new ProfileScreen(this.user, () => {}, this.onUserUpdate);
      viewTitle = 'User Profile';
    }

    titleEl.textContent = viewTitle;
    if (viewComponent) {
      contentContainer.appendChild(viewComponent.render());
    }
  }
}
