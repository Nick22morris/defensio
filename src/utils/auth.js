export const isUserLoggedIn = () => {
    // Example: check for a token in localStorage
    return Boolean(localStorage.getItem('idToken'));
};