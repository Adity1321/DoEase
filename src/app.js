import { StorageService } from './services/storage.js';
import { LandingScreen } from './screens/landing.js';
import { SignInScreen } from './screens/signin.js';
import { SignUpScreen } from './screens/signup.js';
import { DashboardScreen } from './screens/dashboard.js';

export class App {
  constructor(container) {
    this.container = container;
    this.storage = new StorageService();
    this.currentUser = null;
    this.currentScreen = null;
    this.authView = 'landing'; // 'landing', 'signin', or 'signup'
  }

  init() {
    this.currentUser = this.storage.getCurrentUser();
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    if (this.currentUser) {
      const dashboard = new DashboardScreen(
        this.storage, 
        this.currentUser, 
        () => this.handleLogout(),
        (userData) => this.handleUserUpdate(userData)
      );
      this.container.appendChild(dashboard.render());
      this.currentScreen = dashboard;
    } else {
      const authContainer = document.createElement('div');
      authContainer.className = 'auth-screens-container';
      
      if (this.authView === 'landing') {
        const landingScreen = new LandingScreen(
          () => this.handleSwitchToSignUp(),
          () => this.handleSwitchToSignIn()
        );
        authContainer.appendChild(landingScreen.render());
        this.currentScreen = landingScreen;
      } else {
        authContainer.classList.add('form-view');
        if (this.authView === 'signup') {
          const signUpScreen = new SignUpScreen(
            (userData) => this.handleSignUp(userData),
            () => this.handleSwitchToSignIn()
          );
          authContainer.appendChild(signUpScreen.render());
          this.currentScreen = signUpScreen;
        } else { // 'signin'
          const signInScreen = new SignInScreen(
            (credentials) => this.handleSignIn(credentials),
            () => this.handleSwitchToSignUp()
          );
          authContainer.appendChild(signInScreen.render());
          this.currentScreen = signInScreen;
        }
      }
      this.container.appendChild(authContainer);
    }
  }

  handleSwitchToSignUp() {
    this.authView = 'signup';
    this.render();
  }

  handleSwitchToSignIn() {
    this.authView = 'signin';
    this.render();
  }

  handleSignIn(credentials) {
    const user = this.storage.loginUser(credentials.email, credentials.password);
    if (user) {
      this.currentUser = user;
      this.render();
    } else {
      alert('Invalid email or password. Please try again.');
    }
  }

  handleSignUp(userData) {
    const data = this.storage.getData();
    if (data.users.some(u => u.email === userData.email)) {
      alert('An account with this email already exists. Please sign in.');
      this.handleSwitchToSignIn();
      return;
    }
    this.storage.createUser(userData);
    this.currentUser = this.storage.getCurrentUser();
    this.render();
  }

  handleLogout() {
    this.storage.logout();
    this.currentUser = null;
    this.authView = 'landing';
    this.render();
  }

  handleUserUpdate(userData) {
    if (this.currentUser) {
      this.storage.updateUser(this.currentUser.id, userData);
      this.currentUser = this.storage.getCurrentUser();
      this.render();
    }
  }
}
