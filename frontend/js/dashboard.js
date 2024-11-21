// dashboard.js

// Authentication Check
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/loginpage';
        return;
    }

    // Fetch Provider Info            showAddServiceModal
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

// public/js/addService.js (or wherever your JS is for the form)
document.addEventListener('DOMContentLoaded', async () => {
    const categorySelect = document.getElementById('serviceCategory');
  
    try {
      // Fetch categories from the API
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const categories = await response.json();
  
      // Populate the select element with options
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  });
  

//Show the Add Service model
document.addEventListener('DOMContentLoaded', () => {
    const addServiceButton = document.getElementById('addServiceButton');
    addServiceButton.addEventListener('click', showAddServiceModal);
});

//Close the Add Service model
document.addEventListener('DOMContentLoaded', () => {
    const closebtn = document.getElementById('closebtn');
    closebtn.addEventListener('click', hideAddServiceModal);
});
//Cancel the Add Service model
document.addEventListener('DOMContentLoaded', () => {
    const cancel = document.getElementById('cancel');
    cancel.addEventListener('click', hideAddServiceModal);
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
document.getElementById('addServiceForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData();

    // Collect available days
    const availableDays = Array.from(
        document.querySelectorAll('input[name="availableDays"]:checked')
    ).map((checkbox) => checkbox.value);
    formData.append('availableDays', JSON.stringify(availableDays));

    // Collect service images
    const serviceImages = document.getElementById('serviceImages').files;
    Array.from(serviceImages).forEach((file) => {
        formData.append('serviceImages', file);
    });

    // Collect other form data
    formData.append('title', document.getElementById('serviceTitle').value);
    formData.append('description', document.getElementById('serviceDescription').value);
    formData.append('categoryId', document.getElementById('serviceCategory').value);
    formData.append('serviceArea', document.getElementById('serviceArea').value);
    formData.append('location', document.getElementById('serviceLocation').value);
    formData.append('price', document.getElementById('servicePrice').value);
    formData.append('priceType', document.getElementById('servicePriceType').value);
    formData.append('workingHoursStart', document.getElementById('workingHoursStart').value);
    formData.append('workingHoursEnd', document.getElementById('workingHoursEnd').value);

    try {
        const response = await fetch('http://localhost:3000/api/service/add', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            Swal.fire({
                icon: 'success',
                title: 'Service Added',
                text: result.message,
            });

            // Hide the modal and reset the form
            hideAddServiceModal();
            e.target.reset();

            // Add a delay before reloading the page
            setTimeout(() => {
                console.log('Reloading after delay...');
                window.location.reload(); // Reload the page after 2 seconds
            }, 2000);
        } else {
            const error = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to add service',
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to communicate with the server',
        });
        console.error('Error:', error);
    }
});

