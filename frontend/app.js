if (typeof Amplify !== 'undefined') {
    Amplify.configure({
        Auth: window.COGNITO_CONFIG 
    });
}



function redirectToCognito() {
    const config = window.COGNITO_CONFIG;
    const clientId = config.userPoolWebClientId;
    const domain = config.oauth.domain;
    const redirectUri = encodeURIComponent(config.oauth.redirectSignIn);
    const cognitoUrl = `https://${domain}/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    
    console.log('Attempting redirect to:', cognitoUrl);
    window.location.href = cognitoUrl;
}

async function handleAuthRedirect() {
    if (typeof Amplify === 'undefined') {
        console.log('Amplify not loaded, skipping auth');
        return false;
    }
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');

        if (authCode) {
            console.log('Processing redirect from Cognito with code:', authCode);
            
            await Amplify.Auth.currentSession();
            
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const user = await Amplify.Auth.currentAuthenticatedUser();
        console.log('User authenticated:', user.username);

        if (window.location.pathname.includes('signup.html') || 
            window.location.pathname === '/frontend/' ||
            window.location.pathname.endsWith('/')) {
            window.location.href = 'swipe.html';
        }
        return true;
    } catch (error) {
        console.log('Authentication error:', error.message);
        
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        
        if (authCode) {
            console.log('Failed to exchange code, redirecting to signup');
            window.location.href = 'signup.html';
        }
        
        return false;
    }
}

async function logout() {
    console.log('Logout function called');
    try {
        if (typeof Amplify !== 'undefined') {
            console.log('Signing out with Amplify');
            await Amplify.Auth.signOut();
        }
        console.log('Redirecting to signup page');
        window.location.href = 'signup.html';
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if logout fails
        window.location.href = 'signup.html';
    }
}

function saveProfile() {
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const bio = document.getElementById('bio').value;
    const photoInput = document.getElementById('photo');
    
    if (!name || !age || !bio) {
        alert('Please fill all fields');
        return;
    }
    
    const currentUser = getCurrentUserId();
    const profile = { id: currentUser, name, age, bio, photo: 'https://via.placeholder.com/300' };
    
    if (photoInput && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profile.photo = e.target.result;
            saveProfileData(profile);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveProfileData(profile);
    }
}

function saveProfileData(profile) {
    const profiles = JSON.parse(localStorage.getItem('profiles')) || [];
    const existing = profiles.findIndex(p => p.id === profile.id);
    
    if (existing >= 0) profiles[existing] = profile;
    else profiles.push(profile);
    
    localStorage.setItem('profiles', JSON.stringify(profiles));
    alert('Profile saved!');
    window.location.href = 'swipe.html';
}

async function getCurrentUserId() {
    try {
        const user = await Amplify.Auth.currentAuthenticatedUser();
        return user.username;
    } catch {
        // Fallback for local testing
        let userId = localStorage.getItem('currentUserId');
        if (!userId) {
            userId = 'user_' + Date.now();
            localStorage.setItem('currentUserId', userId);
        }
        return userId;
    }
}

let profiles = [];
let current = 0;

function swipe(direction) {
    const profile = profiles[current];
    const card = document.querySelector('.card');
    
    // Add swipe animation
    if (direction === 'left') {
        card.classList.add('swipe-left');
    } else {
        card.classList.add('swipe-right');
    }
    
    // Wait for animation to complete before loading next profile
    setTimeout(() => {
        const currentUser = getCurrentUserId();
        const swipes = JSON.parse(localStorage.getItem('swipes')) || {};
        
        if (!swipes[currentUser]) swipes[currentUser] = [];
        
        swipes[currentUser].push({
            targetId: profile.id || profile.userId,
            direction: direction,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('swipes', JSON.stringify(swipes));
        
        if (direction === 'right') {
            checkMatch(profile.id || profile.userId);
        }
        
        current++;
        
        // Remove animation classes
        card.classList.remove('swipe-left', 'swipe-right');
        
        if (current >= profiles.length) {
            card.innerHTML = '<h2 class="no-profiles">No more profiles!</h2><p>Check back later for more matches.</p>';
        } else {
            loadProfile();
        }
    }, 600); // Match animation duration
}

function checkMatch(targetId) {
    const currentUser = getCurrentUserId();
    const swipes = JSON.parse(localStorage.getItem('swipes')) || {};
    
    const mySwipes = swipes[currentUser] || [];
    const theirSwipes = swipes[targetId] || [];
    
    const iLikedThem = mySwipes.some(s => s.targetId === targetId && s.direction === 'right');
    const theyLikedMe = theirSwipes.some(s => s.targetId === currentUser && s.direction === 'right');
    
    if (iLikedThem && theyLikedMe) {
        const matches = JSON.parse(localStorage.getItem('matches')) || [];
        if (!matches.some(m => (m.user1 === currentUser && m.user2 === targetId) || (m.user1 === targetId && m.user2 === currentUser))) {
            matches.push({ user1: currentUser, user2: targetId, timestamp: new Date().toISOString() });
            localStorage.setItem('matches', JSON.stringify(matches));
            alert('🎉 It\'s a match!');
        }
    }
}

function loadProfile() {
    if (current >= profiles.length) {
        document.querySelector('.card').innerHTML = '<h2>No more profiles</h2><p>Check back later!</p>';
        return;
    }
    
    const profile = profiles[current];
    const nameElement = document.getElementById('profile-name');
    const bioElement = document.getElementById('profile-bio');
    const imgElement = document.getElementById('profile-img');
    
    if (nameElement) nameElement.innerText = `${profile.name}, ${profile.age}`;
    if (bioElement) bioElement.innerText = profile.bio;
    if (imgElement) imgElement.src = profile.photo;
}

const API_BASE_URL = 'https://45kvervq65.execute-api.us-east-1.amazonaws.com/prod';

function loadProfiles() {
    fetch(`${API_BASE_URL}/profiles`)
        .then(response => response.json())
        .then(data => {
            profiles = data || [];
            console.log('Loaded profiles from API:', profiles);
            current = 0;
            loadProfile();
        })
        .catch(error => {
            console.error('Error loading profiles:', error);
            profiles = [];
            current = 0;
            loadProfile();
        });
}

function loadMatches() {
    const currentUser = getCurrentUserId();
    const matches = JSON.parse(localStorage.getItem('matches')) || [];
    const allProfiles = JSON.parse(localStorage.getItem('profiles')) || [];
    const container = document.getElementById('matches-container');
    
    if (!container) return;
    
    const myMatches = matches.filter(m => m.user1 === currentUser || m.user2 === currentUser);
    
    if (myMatches.length === 0) {
        container.innerHTML = '<p>No matches yet. Keep swiping!</p>';
        return;
    }
    
    container.innerHTML = myMatches.map(match => {
        const matchedUserId = match.user1 === currentUser ? match.user2 : match.user1;
        const matchedProfile = allProfiles.find(p => p.id === matchedUserId);
        if (!matchedProfile) return '';
        return `
            <div class="match-card">
                <img src="${matchedProfile.photo}" alt="${matchedProfile.name}">
                <h3>${matchedProfile.name}, ${matchedProfile.age}</h3>
                <p>${matchedProfile.bio}</p>
            </div>
        `;
    }).join('');
}

async function initializePage() {
    console.log('initializePage called on:', window.location.pathname);
    
    const isAuthenticated = await handleAuthRedirect();
    console.log('Authentication result:', isAuthenticated);
    
    // Force logout button creation on all pages except signup
    if (!window.location.pathname.includes('signup.html')) {
        console.log('Adding logout button...');
        
        // Remove existing button if any
        const existingBtn = document.getElementById('logout-btn');
        if (existingBtn) existingBtn.remove();
        
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.onclick = async () => {
            console.log('Logout clicked');
            await logout();
        };
        logoutBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 5px 10px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; z-index: 1000;';
        document.body.appendChild(logoutBtn);
        console.log('Logout button added');
    }
    
    if (window.location.pathname.includes('swipe.html')) {
        console.log('Loading profiles...');
        loadProfiles();
    }
    
    if (window.location.pathname.includes('matches.html')) {
        loadMatches();
    }
}

window.addEventListener('DOMContentLoaded', initializePage);