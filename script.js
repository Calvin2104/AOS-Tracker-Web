let staffCounters = JSON.parse(localStorage.getItem('staffCounters')) || {};
let adminUnlocked = false;  // Track if admin menu is unlocked

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
        updateStaffSelect();
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

// Function to update the staff selection dropdown
function updateStaffSelect() {
    const staffSelect = document.getElementById('staffSelect');
    staffSelect.innerHTML = '<option value="">Select Staff Member</option>';

    for (const staffName of Object.keys(staffCounters)) {
        const option = document.createElement('option');
        option.value = staffName;
        option.textContent = staffName;
        staffSelect.appendChild(option);
    }
}

// Function to update the selected staff member
function updateSelectedStaff() {
    const staffSelect = document.getElementById('staffSelect');
    const selectedStaff = staffSelect.value;
    const editSoldCount = document.getElementById('editSoldCount');

    if (selectedStaff) {
        editSoldCount.value = staffCounters[selectedStaff];
    } else {
        editSoldCount.value = '';
    }
}

// Function to toggle the admin menu visibility
function toggleAdminMenu() {
    const adminMenu = document.getElementById('adminMenu');
    adminMenu.style.display = adminMenu.style.display === 'none' ? 'block' : 'none';

    if (adminMenu.style.display === 'none') {
        adminUnlocked = false;  // Lock admin menu when closed
        document.getElementById('adminControls').style.display = 'none';
        document.getElementById('adminPassword').value = '';
    }
}

// Function to verify the admin password
function verifyPassword() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'admin') {
        adminUnlocked = true;  // Unlock admin menu
        document.getElementById('adminControls').style.display = 'block';
        document.getElementById('adminPassword').value = '';
    } else {
        alert('Incorrect password');
    }
}

// Function to edit a profile
function editProfile() {
    const staffSelect = document.getElementById('staffSelect');
    const selectedStaff = staffSelect.value;
    const soldCount = parseInt(document.getElementById('editSoldCount').value);

    if (selectedStaff && !isNaN(soldCount)) {
        staffCounters[selectedStaff] = soldCount;
        saveToLocalStorage();  // Save to localStorage
        updateCounters();
        updateSelectedStaff();
    } else {
        alert('Please select a valid staff member and enter a valid sold count.');
    }

    document.getElementById('editSoldCount').value = '';
}

// Function to show the leaderboard
function showLeaderboard() {
    const leaderboard = Object.entries(staffCounters)
        .sort((a, b) => b[1] - a[1])
        .map(([staffName, count]) => `${staffName}: ${count} cheeseburgers sold`)
        .join('\n');

    alert(`Leaderboard:\n\n${leaderboard}`);
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
    updateStaffSelect();  // Update the staff selection dropdown
    scheduleMidnightReset();  // Schedule the midnight reset
});
