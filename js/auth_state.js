document.addEventListener('DOMContentLoaded', () => {
    // Target the specific setting menu list for authentication
    const authMenuLists = document.querySelectorAll('.setting.ht-setting .ht-setting-list');
    
    // Check if user is logged in via localStorage
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('loggedInUser');
    
    if (token && userJson) {
        let user = null;
        try {
            user = JSON.parse(userJson);
        } catch(e) {}

        if (user) {
            authMenuLists.forEach(menu => {
                const links = menu.querySelectorAll('a');
                links.forEach(link => {
                    const text = link.textContent.trim();
                    
                    // Change "Sign In" to "Logout"
                    if (text === 'Sign In' || text === 'Login') {
                        link.textContent = 'Logout';
                        link.href = '#';
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            // Handle Logout
                            localStorage.removeItem('token');
                            localStorage.removeItem('loggedInUser');
                            // Redirect to login page or reload
                            window.location.href = 'login-register.html';
                        });
                    }
                    
                    // Change "My Account" to show the user's name
                    if (text === 'My Account') {
                        link.textContent = `Hi, ${user.name}`;
                        link.href = '#'; 
                    }
                });
            });
        }
    }
});
