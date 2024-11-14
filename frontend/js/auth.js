// frontend/src/js/auth.js
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('Login attempt:', { email, password }); // Log login attempt

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log('Login response:', data); // Log the response

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    // alert(JSON.stringify(data));
                    Swal.fire({
                        title: "Login Succesfull",
                        // text: "That thing is still around?",
                        icon: "success"
                    });
                    if (data.user.role == "customer") {
                        window.location.href = '../index.html'
                    } else if (data.user.role == "service_provider") {
                        window.location.href = '../provider-dashboard.html'

                    }


                } else {
                    // alert(data.message || 'Login failed');
                    Swal.fire({
                        title: "Login failed!",
                        text: data.message,
                        icon: "warning"
                    });
                }
            } catch (error) {
                console.error('Login error:', error);
                // alert('Login failed. Please try again.');
                Swal.fire({
                    title: "Login Failed!",
                    text: "Please try Again Later.",
                    icon: "warning"
                });
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const accountType = document.querySelector('input[name="accountType"]:checked').value;
    
            console.log('Signup attempt:', { firstName, lastName, email, phone, password, accountType }); // Log signup attempt
    
            // Regular expression to validate phone number format
            const phoneRegex = /^[0-9]{10}$/; // Example for a 10-digit phone number
    
            if (!phoneRegex.test(phone)) {
                Swal.fire({
                    title: "Invalid Phone Number!",
                    text: "Please enter a valid 10-digit phone number.",
                    icon: "warning"
                });
                return;
            }
    
            if (password !== confirmPassword) {
                Swal.fire({
                    title: "Passwords don't match!",
                    text: "Please recheck your passwords.",
                    icon: "warning"
                });
                return;
            }
    
            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        phone,
                        password,
                        role: accountType
                    })
                });
    
                const data = await response.json();
                console.log('Registration response:', data); // Log the response
    
                if (response.ok) {
                    Swal.fire({
                        title: "Registration successful!",
                        text: "Please log in.",
                        icon: "success"
                    });
                    window.location.href = 'login.html';
                } else {
                    Swal.fire({
                        title: "Registration failed.",
                        text: data.message,
                        icon: "warning"
                    });
                }
            } catch (error) {
                console.error('Registration error:', error);
                Swal.fire({
                    title: "Registration failed. Please try again",
                    icon: "warning"
                });
            }
        });
    }
    
});