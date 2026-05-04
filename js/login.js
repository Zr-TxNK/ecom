document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageContainer = document.getElementById('login-message-container');

    loginForm.addEventListener('submit', async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Clear any previous messages
        messageContainer.textContent = '';
        messageContainer.style.color = '';

        // 1. Get the input values
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Basic client-side validation: ensure fields are not empty
        if (!email || !password) {
            displayMessage('Please enter both email and password.', 'red');
            return;
        }

        try {
            // 2. Send POST request to the login endpoint
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            // 3. Parse the JSON response
            let data = {};
            try {
                data = await response.json();
            } catch (e) {
                // If response is not JSON, ignore
            }

            // 4. Handle the server response
            if (response.ok) {
                // Login successful
                displayMessage(data.message || 'Login successful! Redirecting...', 'green');

                // Store JWT token and user info in localStorage for session persistence
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                if (data.user) {
                    localStorage.setItem('loggedInUser', JSON.stringify(data.user));
                }

                // Redirect to homepage after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);

            } else if (response.status === 401) {
                // Invalid credentials
                displayMessage(data.message || 'Invalid email or password.', 'red');
            } else if (response.status === 404) {
                // User not found
                displayMessage(data.message || 'User not found. Please register first.', 'red');
            } else {
                // Other server errors
                displayMessage(data.message || 'An unexpected error occurred. Please try again.', 'red');
            }
        } catch (error) {
            // Handle network errors (e.g., server is down)
            console.error('Login error:', error);
            displayMessage('Failed to connect to the server. Is it running?', 'red');
        }
    });

    // Helper function to display messages on the UI
    function displayMessage(message, color) {
        messageContainer.textContent = message;
        messageContainer.style.color = color;
    }
});
