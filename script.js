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
        staffCounters[staffName] = {
            cheeseburgers: 0,
            applePies: 0,
            hashBrowns: 0,
            coffees: 0
        };
        saveToLocalStorage();  // Save to localStorage
        updateCounters();
        updateStaffSelect();
        updateProfileSelect();
    } else {
        alert('Please enter a unique staff name.');
    }
    document.getElementById('staffName').value = '';
}

// Function to update the display of counters
function updateCounters() {
    const profileSelect = document.getElementById('profileSelect');
    const selectedProfile = profileSelect.value;
    updateProfileDisplay(selectedProfile);
}

// Function to update the profile display
function updateProfileDisplay(selectedProfile) {
    const profileDisplay = document.getElementById('profileDisplay');
    profileDisplay.innerHTML = '';

    if (selectedProfile && staffCounters.hasOwnProperty(selectedProfile)) {
        const { cheeseburgers, applePies, hashBrowns, coffees } = staffCounters[selectedProfile];
        profileDisplay.innerHTML = `
            <div><strong>${selectedProfile}</strong></div>
            <div>Cheeseburgers: ${cheeseburgers}</div>
            <div>Apple Pies: ${applePies}</div>
            <div>Hash Browns: ${hashBrowns}</div>
            <div>Standard Coffees: ${coffees}</div>
        `;
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

// Function to update the profile selection dropdown
function updateProfileSelect() {
    const profileSelect = document.getElementById('profileSelect');
    profileSelect.innerHTML = '<option value="">Select Profile</option>';

    for (const staffName of Object.keys(staffCounters)) {
        const option = document.createElement('option');
        option.value = staffName;
        option.textContent = staffName;
        profileSelect.appendChild(option);
    }
}

// Function to update the selected staff member
function updateSelectedStaff() {
    const staffSelect = document.getElementById('staffSelect');
    const selectedStaff = staffSelect.value;

    if (selectedStaff && staffCounters.hasOwnProperty(selectedStaff)) {
        const { cheeseburgers, applePies, hashBrowns, coffees } = staffCounters[selectedStaff];
        document.getElementById('editCheeseburgersSold').value = cheeseburgers;
        document.getElementById('editApplePiesSold').value = applePies;
        document.getElementById('editHashBrownsSold').value = hashBrowns;
        document.getElementById('editCoffeesSold').value = coffees;
    } else {
        document.getElementById('editCheeseburgersSold').value = '';
        document.getElementById('editApplePiesSold').value = '';
        document.getElementById('editHashBrownsSold').value = '';
        document.getElementById('editCoffeesSold').value = '';
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
    const cheeseburgersSold = parseInt(document.getElementById('editCheeseburgersSold').value);
    const applePiesSold = parseInt(document.getElementById('editApplePiesSold').value);
    const hashBrownsSold = parseInt(document.getElementById('editHashBrownsSold').value);
    const coffeesSold = parseInt(document.getElementById('editCoffeesSold').value);

    if (selectedStaff && staffCounters.hasOwnProperty(selectedStaff)) {
        if (!isNaN(cheeseburgersSold)) {
            staffCounters[selectedStaff].cheeseburgers = cheeseburgersSold;
        }
        if (!isNaN(applePiesSold)) {
            staffCounters[selectedStaff].applePies = applePiesSold;
        }
        if (!isNaN(hashBrownsSold)) {
            staffCounters[selectedStaff].hashBrowns = hashBrownsSold;
        }
        if (!isNaN(coffeesSold)) {
            staffCounters[selectedStaff].coffees = coffeesSold;
        }

        saveToLocalStorage();  // Save to localStorage
        updateCounters();
        updateSelectedStaff();
    } else {
        alert('Please select a valid staff member and enter valid sold counts.');
    }

    document.getElementById('editCheeseburgersSold').value = '';
    document.getElementById('editApplePiesSold').value = '';
    document.getElementById('editHashBrownsSold').value = '';
    document.getElementById('editCoffeesSold').value = '';
}

// Function to show the leaderboard
function showLeaderboard() {
    const leaderboard = Object.entries(staffCounters)
        .sort((a, b) => (b[1].cheeseburgers + b[1].applePies + b[1].hashBrowns + b[1].coffees) - (a[1].cheeseburgers + a[1].applePies + a[1].hashBrowns + a[1].coffees))
        .map(([staffName, counts]) => `${staffName}: ${counts.cheeseburgers} cheeseburgers, ${counts.applePies} apple pies, ${counts.hashBrowns} hash browns, ${counts.coffees} standard coffees sold`)
        .join('\n');

    alert(`Leaderboard:\n\n${leaderboard}`);
}

// Function to clear tallies at midnight
function clearTallies() {
    for (const staffName in staffCounters) {
        if (staffCounters.hasOwnProperty(staffName)) {
            staffCounters[staffName] = {
                cheeseburgers: 0,
                applePies: 0,
                hashBrowns: 0,
                coffees: 0
            };  // Reset tallies to 0
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
    updateProfileSelect();  // Update the profile selection dropdown
    scheduleMidnightReset();  // Schedule the midnight reset
});
