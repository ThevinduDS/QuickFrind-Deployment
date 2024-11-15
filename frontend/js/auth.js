// frontend/src/js/auth.js
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    function isValidEmail(email) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    }

    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];

        if (password.length < minLength) {
            errors.push("Password must be at least 8 characters long.");
        }
        // else if (!hasUpperCase) {
        //     errors.push("Password must include at least one uppercase letter.");
        // }
        // else if (!hasLowerCase) {
        //     errors.push("Password must include at least one lowercase letter.");
        // }
        // else if (!hasDigit) {
        //     errors.push("Password must include at least one number.");
        // }
        // else if (!hasSpecialChar) {
        //     errors.push("Password must include at least one special character (e.g., !@#$%^&*).");
        // }

        return errors;
    }

    function isValidPhoneNumber(phone) {
        return /^(0?77|0?76|0?74|0?71|0?72|0?75)\d{6,7}$/.test(phone);// For Sri Lankan numbers starting with 0 and 10 digits
    }

    function showAlert(title, text, icon) {
        Swal.fire({ title, text, icon });
    }

    if (loginForm) {
        // Check if there are saved credentials in localStorage
        const savedEmail = localStorage.getItem('savedEmail');
        const savedPassword = localStorage.getItem('savedPassword');

        if (savedEmail && savedPassword) {
            document.getElementById('email').value = savedEmail;
            document.getElementById('password').value = savedPassword;
            document.getElementById('remember').checked = true;
        }

        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;

            if (!isValidEmail(email)) return showAlert("Invalid Email", "Please enter a valid email.", "warning");
            if (!validatePassword(password)) return showAlert("Password too weak", "Must be at least 8 characters.", "warning");

            console.log('Login attempt:', { email, password });

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log('Login response:', data);

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Save or clear login details based on Remember Me checkbox
                    if (rememberMe) {
                        localStorage.setItem('savedEmail', email);
                        localStorage.setItem('savedPassword', password);
                    } else {
                        localStorage.removeItem('savedEmail');
                        localStorage.removeItem('savedPassword');
                    }

                    Swal.fire({
                        title: "Login Successful",
                        icon: "success"
                    });

                    if (data.user.role == "customer") {
                        window.location.href = '../index.html';
                    } else if (data.user.role == "service_provider") {
                        window.location.href = '../provider-dashboard.html';
                    }
                } else {
                    Swal.fire({
                        title: "Login failed!",
                        text: data.message,
                        icon: "warning"
                    });
                }
            } catch (error) {
                console.error('Login error:', error);
                Swal.fire({
                    title: "Login Failed!",
                    text: "Please try again later.",
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
            const service_provider = document.getElementById('service_provider').value;
            const accountType = document.querySelector('input[name="accountType"]:checked').value;

            const customer = document.getElementById('customer').value;
            if (!isValidEmail(email)) return showAlert("Invalid Email", "Please enter a valid email.", "warning");
            if (!isValidPhoneNumber(phone)) return showAlert("Invalid Phone Number", "Please enter a valid Sri Lankan number.", "warning");
            // if (!isValidPassword(password) || password !== confirmPassword) return showAlert("Passwords don't match", "Check your passwords.", "warning");

            // Clear previous error messages
            document.getElementById("passwordError").innerHTML = "";
            document.getElementById("confirmPasswordError").innerHTML = "";

            // Validate password rules
            const errors = validatePassword(password);
            if (errors.length > 0) {
                const passwordErrorContainer = document.getElementById("passwordError");
                passwordErrorContainer.innerHTML = errors.map(err => `<p class="text-red-500 text-sm">${err}</p>`).join("");
                return false;
            }

            console.log('Signup attempt:', { firstName, lastName, email, phone, password, accountType }); // Log signup attempt

            const phoneRegex = /^[0-9]{10}$/; // Example for a 10-digit phone number
            // Regular expression to validate phone number fob2rmat

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
                        // role: Add role here
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