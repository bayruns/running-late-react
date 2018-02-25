
import LandingPage from '../Pages/LandingPage.jsx';
import NotFoundPage from '../Pages/NotFoundPage.jsx';
import LoginPage from '../Pages/LoginPage.jsx';
import SignupPage from '../Pages/SignupPage.jsx';
import DashboardPage from '../Pages/DashboardPage.jsx';
import ConfirmInvitePage from '../Pages/ConfirmInvitePage.jsx';

//import PasswordResetPage from '../Pages/PasswordResetPage.jsx';

//Constants for pages to be used across any page that has routes or redirects
export const PAGES = {
    LANDING: {
        URL: '/',  
        DISPLAY_NAME: 'Landing',
        COMPONENT: LandingPage,
        IS_EXACT: true,        
        IS_NAV: false
    },  
    LOGIN: {
        URL: '/login',  
        DISPLAY_NAME: 'Login',
        COMPONENT: LoginPage,
        IS_EXACT: false,                
        IS_NAV: false        
    },
    SIGNUP: {
        URL: '/signup',  
        DISPLAY_NAME: 'Signup',
        COMPONENT: SignupPage,
        IS_EXACT: false,                
        IS_NAV: false        
    },
    DASHBOARD: {
        URL: '/dashboard',  
        DISPLAY_NAME: 'Dashboard',
        COMPONENT: DashboardPage,
        IS_EXACT: false,
        IS_NAV: false        
    },
    CONFIRM_INVITE: {
        URL: '/confirm-invite/:address/:id',  
        DISPLAY_NAME: 'Confirm Invite',
        COMPONENT: ConfirmInvitePage,
        IS_EXACT: false,
        IS_NAV: false        
    },
    PASSWORD_RESET: {
        URL: '/reset',  
        DISPLAY_NAME: 'Password Reset',
        IS_EXACT: false,
        IS_NAV: false        
    },
    NOT_FOUND: {
        URL: '*',
        DISPLAY_NAME: 'File Not Found',
        COMPONENT: NotFoundPage,
        IS_EXACT: true,
        IS_NAV: false        
    }
}