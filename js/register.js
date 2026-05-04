document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const messageContainer = document.getElementById('register-message-container');

    registerForm.addEventListener('submit', async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Clear any previous messages
        messageContainer.textContent = '';
        messageContainer.style.color = '';

        // Extract inputs from the form
        const firstName = document.getElementById('reg-first-name').value.trim();
        const lastName = document.getElementById('reg-last-name').value.trim();
        const email = document.getElementById('reg-email').value.trim(); // Used as username
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        // Combine first name and last name
        const name = `${firstName} ${lastName}`.trim();

        // Check if passwords match
        if (password !== confirmPassword) {
            displayMessage('Passwords do not match.', 'red');
            return;
        }

        // Frontend Validation: Password requirements
        // 1. At least 8 characters long
        // 2. Contains at least one uppercase letter
        // 3. Contains at least one special character (!, @, #, $, %, ^, &, *)
        const lengthRegex = /.{8,}/;
        const uppercaseRegex = /[A-Z]/;
        const specialCharRegex = /[!@#$%^&*]/;

        if (!lengthRegex.test(password)) {
            displayMessage('Password must be at least 8 characters long.', 'red');
            return;
        }

        if (!uppercaseRegex.test(password)) {
            displayMessage('Password must contain at least one uppercase letter.', 'red');
            return;
        }

        if (!specialCharRegex.test(password)) {
            displayMessage('Password must contain at least one special character (!, @, #, $, %, ^, &, *).', 'red');
            return;
        }

        try {
            // Prepare the payload
            const payload = {
                name: name,
                email: email,
                password: password
            };

            // Send POST request to the server
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // Parse the JSON response if possible
            let data = {};
            try {
                data = await response.json();
            } catch (e) {
                // If response is not JSON, ignore
            }

            // Handle the server response
            if (response.ok || response.status === 201) {
                // Success
                displayMessage(data.message || 'Registration successful! You can now log in.', 'green');
                registerForm.reset(); // Clear the form fields
            } else if (response.status === 409 || response.status === 400) {
                // User already exists or bad request
                displayMessage(data.message || 'Username already exists.', 'red');
            } else {
                // Other server errors
                displayMessage('An unexpected error occurred. Please try again.', 'red');
            }
        } catch (error) {
            // Handle network errors (e.g., server is down)
            console.error('Registration error:', error);
            displayMessage('Failed to connect to the server. Is it running?', 'red');
        }
    });

    // Helper function to display messages on the UI
    function displayMessage(message, color) {
        messageContainer.textContent = message;
        messageContainer.style.color = color;
    }
});
