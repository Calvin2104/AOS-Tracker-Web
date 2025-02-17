 // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBymaGL4LjaAdHRQhW2a8uM7xQq9sgqRak",
    authDomain: "aos-tracker.firebaseapp.com",
    projectId: "aos-tracker",
    storageBucket: "aos-tracker.firebasestorage.app",
    messagingSenderId: "503355104840",
    appId: "1:503355104840:web:0d2225fd45e755982d427d"
  };
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Function to register a new user
function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('User registered:', userCredential.user);
            alert('Registration successful. Please log in.');
            toggleAuthForms();
        })
        .catch(error => {
            console.error('Error registering user:', error);
            alert('Error registering user: ' + error.message);
        });
}

// Function to log in
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('User logged in:', userCredential.user);
            showUserContent();
        })
        .catch(error => {
            console.error('Error logging in:', error);
            alert('Error logging in: ' + error.message);
        });
}

// Function to log out
function logout() {
    auth.signOut()
        .then(() => {
            console.log('User logged out');
            hideUserContent();
        })
        .catch(error => {
            console.error('Error logging out:', error);
            alert('Error logging out: ' + error.message);
        });
}

// Function to toggle between login and register forms
function toggleAuthForms() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Function to show user-specific content after login
function showUserContent() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('staffMenu').style.display = 'block';
    document.getElementById('adminMenuButton').style.display = 'block';
    document.getElementById('leaderboardButton').style.display = 'block';
    document.getElementById('historicalDataButton').style.display = 'block';
    document.getElementById('logoutButton').style.display = 'block';
    loadUserData();
}

// Function to hide user-specific content after logout
function hideUserContent() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('staffMenu').style.display = 'none';
    document.getElementById('adminMenuButton').style.display = 'none';
    document.getElementById('leaderboardButton').style.display = 'none';
    document.getElementById('historicalDataButton').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'none';
}

// Function to load user-specific data from Firestore
function loadUserData() {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        db.collection('users').doc(userId).get()
            .then(doc => {
                if (doc.exists) {
                    staffData = doc.data().staffData;
                    updateCounters();
                    updateStaffSelect();
                    updateProfileSelect();
                } else {
                    console.log('No such document!');
                }
            })
            .catch(error => {
                console.error('Error getting document:', error);
            });
    }
}

// Function to save user-specific data to Firestore
function saveToFirestore() {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        db.collection('users').doc(userId).set({
            staffData: staffData
        })
        .then(() => {
            console.log('Document successfully written!');
        })
        .catch(error => {
            console.error('Error writing document:', error);
        });
    }
}

// Override saveToLocalStorage to use Firestore
function saveToLocalStorage() {
    console.log('Saving to Firestore:', staffData);
    saveToFirestore();
}

// Function to add a new staff member
function addStaff() {
    const staffName = document.getElementById('staffName').value.trim();
    if (staffName && !staffData.current.hasOwnProperty(staffName)) {
        staffData.current[staffName] = {
            cheeseburgers: 0,
            applePies: 0,
            hashBrowns: 0,
            coffees: 0
        };
        saveToFirestore();  // Save to Firestore
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
function updateProfileDisplay() {
    const profileSelect = document.getElementById('profileSelect');
    const selectedProfile = profileSelect.value;
    const profileDisplay = document.getElementById('profileDisplay');
    profileDisplay.innerHTML = '';

    if (selectedProfile && staffData.current.hasOwnProperty(selectedProfile)) {
        const { cheeseburgers, applePies, hashBrowns, coffees } = staffData.current[selectedProfile];
        profileDisplay.innerHTML = `
            <div><strong>${selectedProfile}</strong></div>
            <div>Cheeseburgers: ${cheeseburgers} <button onclick="incrementProduct('${selectedProfile}', 'cheeseburgers')">+</button></div>
            <div>Apple Pies: ${applePies} <button onclick="incrementProduct('${selectedProfile}', 'applePies')">+</button></div>
            <div>Hash Browns: ${hashBrowns} <button onclick="incrementProduct('${selectedProfile}', 'hashBrowns')">+</button></div>
            <div>Standard Coffees: ${coffees} <button onclick="incrementProduct('${selectedProfile}', 'coffees')">+</button></div>
        `;
    }
}

// Function to increment the counter for a product
function incrementProduct(staffName, product) {
    if (staffData.current.hasOwnProperty(staffName) && staffData.current[staffName].hasOwnProperty(product)) {
        staffData.current[staffName][product]++;
        saveToFirestore();  // Save to Firestore
        updateProfileDisplay();
    }
}

// Function to update the staff selection dropdown
function updateStaffSelect() {
    const staffSelect = document.getElementById('staffSelect');
    staffSelect.innerHTML = '<option value="">Select Staff Member</option>';

    for (const staffName of Object.keys(staffData.current)) {
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

    for (const staffName of Object.keys(staffData.current)) {
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

    if (selectedStaff && staffData.current.hasOwnProperty(selectedStaff)) {
        const { cheeseburgers, applePies, hashBrowns, coffees } = staffData.current[selectedStaff];
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

// Function to show the leaderboard modal
function showLeaderboardMenu() {
    const leaderboardModal = document.getElementById('leaderboardModal');
    leaderboardModal.style.display = 'block';
}

// Function to close the leaderboard modal
function closeLeaderboard() {
    const leaderboardModal = document.getElementById('leaderboardModal');
    leaderboardModal.style.display = 'none';
}

// Function to show credits
function showCredits() {
    const creditsModal = document.getElementById('creditsModal');
    creditsModal.style.display = 'block';
}

// Function to close credits
function closeCredits() {
    const creditsModal = document.getElementById('creditsModal');
    creditsModal.style.display = 'none';
}

// Function to verify the admin password
function verifyPassword() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'admin') {
        adminUnlocked = true;  // Unlock admin menu
        document.getElementById('adminControls').style.display = 'block';
        document.getElementById('adminPassword').value = '';
    } else if (password === 'Reset0733') {
        clearAllData();  // Clear all names and scores
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

    if (selectedStaff && staffData.current.hasOwnProperty(selectedStaff)) {
        if (!isNaN(cheeseburgersSold)) {
            staffData.current[selectedStaff].cheeseburgers = cheeseburgersSold;
        }
        if (!isNaN(applePiesSold)) {
            staffData.current[selectedStaff].applePies = applePiesSold;
        }
        if (!isNaN(hashBrownsSold)) {
            staffData.current[selectedStaff].hashBrowns = hashBrownsSold;
        }
        if (!isNaN(coffeesSold)) {
            staffData.current[selectedStaff].coffees = coffeesSold;
        }

        saveToFirestore();  // Save to Firestore
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
    const leaderboardMode = document.getElementById('leaderboardMode').value;
    let leaderboardContent = document.getElementById('leaderboardContent');
    leaderboardContent.innerHTML = ''; // Clear previous content

    let leaderboard = '';
    if (leaderboardMode === 'total') {
        leaderboard = Object.entries(staffData.current)
            .sort((a, b) => (b[1].cheeseburgers + b[1].applePies + b[1].hashBrowns + b[1].coffees) - (a[1].cheeseburgers + a[1].applePies + a[1].hashBrowns + a[1].coffees))
            .map(([staffName, counts]) => `${staffName}: ${counts.cheeseburgers + counts.applePies + counts.hashBrowns + counts.coffees} items sold`)
            .join('<br>');
    } else {
        leaderboard = Object.entries(staffData.current)
            .sort((a, b) => b[1][leaderboardMode] - a[1][leaderboardMode])
            .map(([staffName, counts]) => `${staffName}: ${counts[leaderboardMode]} ${leaderboardMode}`)
            .join('<br>');
    }

    leaderboardContent.innerHTML = `Leaderboard (${leaderboardMode.charAt(0).toUpperCase() + leaderboardMode.slice(1)}):<br><br>${leaderboard}`;
}

// Function to clear all names and scores
function clearAllData() {
    staffData = { current: {}, history: {} };
    saveToFirestore();
    updateCounters();
    updateStaffSelect();
    updateProfileSelect();
    alert('All names and scores have been cleared.');
}

// Function to clear tallies at midnight and save to history
function clearTallies() {
    console.log('Clearing tallies at midnight and saving to history');
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];  // Get current date in YYYY-MM-DD format

    // Save current tallies to history
    staffData.history[dateStr] = JSON.parse(JSON.stringify(staffData.current));

    // Clear current tallies
    for (const staffName in staffData.current) {
        if (staffData.current.hasOwnProperty(staffName)) {
            staffData.current[staffName] = {
                cheeseburgers: 0,
                applePies: 0,
                hashBrowns: 0,
                coffees: 0
            };  // Reset tallies to 0
        }
    }

    saveToFirestore();  // Save the changes to Firestore
    updateCounters();  // Update the display
    scheduleMidnightReset();  // Schedule the next reset
}

// Function to schedule the reset at midnight
function scheduleMidnightReset() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);  // Set to the start of the next day (midnight)

    const timeUntilMidnight = midnight.getTime() - now.getTime();  // Calculate time until midnight
    console.log(`Current time: ${now}`);
    console.log(`Midnight time: ${midnight}`);
    console.log(`Time until midnight: ${timeUntilMidnight} ms`);

    setTimeout(clearTallies, timeUntilMidnight);  // Schedule the reset
}

// Function to show historical data
function showHistoricalData() {
    const dateStr = prompt("Enter the date (YYYY-MM-DD) for which you want to view the data:");
    if (staffData.history.hasOwnProperty(dateStr)) {
        const data = staffData.history[dateStr];
        let displayData = `Data for ${dateStr}:\n\n`;
        for (const staffName in data) {
            if (data.hasOwnProperty(staffName)) {
                const { cheeseburgers, applePies, hashBrowns, coffees } = data[staffName];
                displayData += `${staffName}:\n  Cheeseburgers: ${cheeseburgers}\n  Apple Pies: ${applePies}\n  Hash Browns: ${hashBrowns}\n  Coffees: ${coffees}\n\n`;
            }
        }
        alert(displayData);
    } else {
        alert("No data found for the specified date.");
    }
}

// Event listener for Firebase authentication state changes
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('User is signed in:', user);
        showUserContent();
    } else {
        console.log('No user is signed in.');
        hideUserContent();
    }
});

// Schedule the first reset when the script is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateCounters();  // Ensure counters are updated on page load
    updateStaffSelect();  // Update the staff selection dropdown
    updateProfileSelect();  // Update the profile selection dropdown
    scheduleMidnightReset();  // Schedule the midnight reset
});
