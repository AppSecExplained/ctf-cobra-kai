document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/schedule')
        .then(response => response.json())
        .then(data => {
            const scheduleTable = document.getElementById('scheduleTable');
            data.forEach(item => {
                const row = scheduleTable.insertRow(-1);
                const dayCell = row.insertCell(0);
                const timeCell = row.insertCell(1);
                const classCell = row.insertCell(2);
                dayCell.textContent = item.day;
                timeCell.textContent = item.time;
                classCell.textContent = item.class;
            });
        })
        .catch(error => console.error('Error:', error));
});

// regsitration & login

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Function to switch from registration form to login form
function switchToLoginForm() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
}

// Function to switch from login form to registration form
function switchToRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

// Handle the registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const account = 'student';

    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, account })
    });

    const data = await response.json();
    const message = document.getElementById('message');

    if (response.ok) {
        // registration successful, display success message and switch to login form
        message.textContent = "Registration successful. Please log in.";
        message.style.color = "green"; // Add some color to the success message
        switchToLoginForm();
    } else {
        // registration failed, display error message
        message.textContent = data.error;
        message.style.color = "red"; // Add some color to the error message
    }
});


// Handle the login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    
    if (response.ok) {
        // Store the JWT in local storage
        localStorage.setItem('jwt', data.token);
    
        // Redirect to the dashboard
        window.location.href = "/dashboard";
        
    } else {
        // login failed, display error message
        message.textContent = data.error;
        message.style.color = 'red';
    }
});

// Handle the login button
document.getElementById('loginButton').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent form submission
    switchToLoginForm();
});

