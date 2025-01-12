let staffCounters = JSON.parse(localStorage.getItem('staffCounters')) || {};

// Function to save the current state of staffCounters to localStorage
function saveToLocalStorage() {
    localStorage.setItem('staffCounters', JSON.stringify(staffCounters));
}

// Function to add a new staff member
function addStaff() {
    const staffName = document.getElementById('staffName').value.trim();
    if (staffName && !staffCounters.hasOwnProperty(staffName)) {
        staffCounters[staffName] = 0;
        saveToLocalStorage();  // Save to localStorage
        updateCounters();
    } else {
        alert('Please enter a unique staff name.');
    }
    document.getElementById('staffName').value = '';
}

// Function to increment the counter for a staff member
function incrementCounter(staffName) {
    if (staffCounters.hasOwnProperty(staffName)) {
        staffCounters[staffName]++;
        saveToLocalStorage();  // Save to localStorage
        updateCounters();
    }
}

// Function to update the display of counters
function updateCounters() {
    const staffCountersDiv = document.getElementById('staffCounters');
    staffCountersDiv.innerHTML = '';
    for (const [staffName, count] of Object.entries(staffCounters)) {
        const counterDiv = document.createElement('div');
        counterDiv.className = 'counter';
        counterDiv.innerHTML = `
            <span>${staffName}: ${count} cheeseburgers sold</span>
            <button onclick="incrementCounter('${staffName}')">+</button>
        `;
        staffCountersDiv.appendChild(counterDiv);
    }
}

// Function to toggle the admin menu visibility
function toggleAdminMenu() {
    const adminMenu = document.getElementById('adminMenu');
    adminMenu.style.display = adminMenu.style.display === 'none' ? 'block' : 'none';
}

// Function to verify the admin password
function verifyPassword() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'admin') {
        document.getElementById('adminControls').style.display = 'block';
        document.getElementById('adminPassword').value = '';
    } else {
        alert('Incorrect password');
    }
}

// Function to edit a profile
function editProfile() {
    const currentStaffName = document.getElementById('editStaffName').value.trim();
    const newStaffName = document.getElementById('newStaffName').value.trim();
    const soldCount = parseInt(document.getElementById('editSoldCount').value);

    if (currentStaffName && staffCounters.hasOwnProperty(currentStaffName)) {
        if (!isNaN(soldCount)) {
            staffCounters[currentStaffName] = soldCount;
        }

        if (newStaffName && !staffCounters.hasOwnProperty(newStaffName)) {
            staffCounters[newStaffName] = staffCounters[currentStaffName];
            delete staffCounters[currentStaffName];
        }

        saveToLocalStorage();  // Save to localStorage
        updateCounters();
    } else {
        alert('Please enter a valid current staff name.');
    }

    document.getElementById('editStaffName').value = '';
    document.getElementById('newStaffName').value = '';
    document.getElementById('editSoldCount').value = '';
}

// Function to clear tallies at midnight
function clearTallies() {
    for (const staffName in staffCounters) {
        if (staffCounters.hasOwnProperty(staffName)) {
            staffCounters[staffName] = 0;  // Reset tally to 0
        }
    }
    saveToLocalStorage();  // Save the changes to localStorage
    updateCounters();  // Update the display
    scheduleMidnightReset();  // Schedule the next reset
}

// Function to schedule the reset at midnight
function scheduleMidnightReset() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);  // Set to next midnight

    const timeUntilMidnight = midnight.getTime() - now.getTime();  // Calculate time until midnight

    setTimeout(clearTallies, timeUntilMidnight);  // Schedule the reset
}

// Schedule the first reset when the script is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateCounters();  // Ensure counters are updated on page load
    scheduleMidnightReset();  // Schedule the midnight reset
});
