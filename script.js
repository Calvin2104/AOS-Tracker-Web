import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAUM136UaVHKBbcvCV6LOEfG-QkSAkjtsA",
    authDomain: "aos-tracker-web.firebaseapp.com",
    projectId: "aos-tracker-web",
    storageBucket: "aos-tracker-web.firebasestorage.app",
    messagingSenderId: "75216173221",
    appId: "1:75216173221:web:9285e0cc5d87af0daf754c"
};

// Initialize Firebase if not already initialized
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

async function fetchStaff() {
    const snapshot = await getDocs(collection(db, 'staff'));
    const staffList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return staffList;
}

async function saveStaff(staff) {
    const docRef = await addDoc(collection(db, 'staff'), staff);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
}

async function updateStaff(id, staff) {
    const staffDoc = doc(db, 'staff', id);
    await updateDoc(staffDoc, staff);
    const updatedDoc = await getDoc(staffDoc);
    return { id: updatedDoc.id, ...updatedDoc.data() };
}

let staffCounters = {};

document.addEventListener('DOMContentLoaded', async () => {
    const staff = await fetchStaff();
    staff.forEach(member => {
        staffCounters[member.name] = member.sold_count;
    });
    updateCounters();
});

async function addStaff() {
    const staffName = document.getElementById('staffName').value.trim();
    if (staffName && !staffCounters.hasOwnProperty(staffName)) {
        const newStaff = await saveStaff({ name: staffName, sold_count: 0 });
        staffCounters[newStaff.name] = newStaff.sold_count;
        updateCounters();
    } else {
        alert('Please enter a unique staff name.');
    }
    document.getElementById('staffName').value = '';
}

async function incrementCounter(name) {
    if (staffCounters.hasOwnProperty(name)) {
        staffCounters[name]++;
        const staff = await fetchStaff();
        const member = staff.find(member => member.name === name);
        await updateStaff(member.id, { name, sold_count: staffCounters[name] });
        updateCounters();
    }
}

function updateCounters() {
    const staffCountersDiv = document.getElementById('staffCounters');
    staffCountersDiv.innerHTML = '';
    for (const [name, count] of Object.entries(staffCounters)) {
        const counterDiv = document.createElement('div');
        counterDiv.className = 'counter';
        counterDiv.innerHTML = `
            <span>${name}: ${count} cheeseburgers sold</span>
            <button onclick="incrementCounter('${name}')">+</button>
        `;
        staffCountersDiv.appendChild(counterDiv);
    }
}

async function editProfile() {
    const currentName = document.getElementById('editStaffName').value.trim();
    const newName = document.getElementById('newStaffName').value.trim();
    const soldCount = parseInt(document.getElementById('editSoldCount').value, 10);

    if (currentName && staffCounters.hasOwnProperty(currentName)) {
        const staff = await fetchStaff();
        const member = staff.find(member => member.name === currentName);
        
        if (!isNaN(soldCount)) {
            staffCounters[currentName] = soldCount;
        }

        if (newName && !staffCounters.hasOwnProperty(newName)) {
            delete staffCounters[currentName];
            staffCounters[newName] = soldCount;
            await updateStaff(member.id, { name: newName, sold_count: soldCount });
        } else {
            await updateStaff(member.id, { name: currentName, sold_count: soldCount });
        }
        updateCounters();
    } else {
        alert('Please enter a valid current staff name.');
    }

    document.getElementById('editStaffName').value = '';
    document.getElementById('newStaffName').value = '';
    document.getElementById('editSoldCount').value = '';
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchStaff();
    updateCounters();
    scheduleMidnightReset();
});

async function clearTallies() {
    const staff = await fetchStaff();
    for (const member of staff) {
        await updateStaff(member.id, { name: member.name, sold_count: 0 });
    }
    staffCounters = {};
    updateCounters();
    scheduleMidnightReset();
}

function scheduleMidnightReset() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    setTimeout(clearTallies, timeUntilMidnight);
}
