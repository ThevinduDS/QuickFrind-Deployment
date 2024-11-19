// dashboard.js

// Authentication Check
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Fetch Provider Info
    loadProviderData();

    // Load default section
    showSection('overview');

    // Navigation click handler
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });
});

// Function to show a specific section
function showSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');

    const sectionTitle = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    document.getElementById('sectionTitle').innerText = sectionTitle;
}

// Function to fetch provider data
function loadProviderData() {
    // Simulating a fetch from an API
    const provider = {
        name: "John Doe",
        role: "Service Provider",
        stats: {
            activeServices: 5,
            pendingBookings: 3,
            totalReviews: 12
        },
        recentActivity: [
            { action: "Service 'Plumbing Fix' booked", timestamp: "2 hours ago" },
            { action: "Review received: 'Great work!'", timestamp: "1 day ago" },
        ]
    };

    // Update provider info
    document.getElementById('providerName').innerText = provider.name;
    document.getElementById('providerRole').innerText = provider.role;

    // Update dashboard stats
    document.getElementById('activeServicesCount').innerText = provider.stats.activeServices;
    document.getElementById('pendingBookingsCount').innerText = provider.stats.pendingBookings;
    document.getElementById('totalReviewsCount').innerText = provider.stats.totalReviews;

    // Update recent activity
    const recentActivity = document.getElementById('recentActivity');
    recentActivity.innerHTML = '';
    provider.recentActivity.forEach(activity => {
        const div = document.createElement('div');
        div.classList.add('p-4', 'bg-gray-50', 'rounded', 'flex', 'justify-between');
        div.innerHTML = `<span>${activity.action}</span><span class="text-sm text-gray-400">${activity.timestamp}</span>`;
        recentActivity.appendChild(div);
    });
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Add Service Modal Functions
function showAddServiceModal() {
    document.getElementById('addServiceModal').classList.remove('hidden');
}

function hideAddServiceModal() {
    document.getElementById('addServiceModal').classList.add('hidden');
}

// Add New Service Handler
document.getElementById('addServiceForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Simulate form data submission
    const formData = new FormData(e.target);
    const serviceData = {};
    formData.forEach((value, key) => {
        if (key === 'availableDays') {
            serviceData[key] = serviceData[key] || [];
            serviceData[key].push(value);
        } else {
            serviceData[key] = value;
        }
    });

    console.log('New Service Data:', serviceData);

    // Reset form
    e.target.reset();
    hideAddServiceModal();

    // Show success message
    Swal.fire({
        icon: 'success',
        title: 'Service Added',
        text: 'Your new service has been added successfully!',
    });
});
