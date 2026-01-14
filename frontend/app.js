const COGNITO_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_xxxxxxxxx',
    userPoolWebClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    oauth: {
        domain: 'your-domain.auth.us-east-1.amazoncognito.com',
        scope: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
        redirectSignIn: 'http://localhost:5500/frontend/',
        redirectSignOut: 'http://localhost:5500/frontend/',
        responseType: 'code'
    }
};

Amplify.configure({
    Auth: COGNITO_CONFIG
});

function redirectToCognito() {
    const clientId = COGNITO_CONFIG.userPoolWebClientId;
    const domain = COGNITO_CONFIG.oauth.domain;
    const redirectUri = encodeURIComponent(COGNITO_CONFIG.oauth.redirectSignIn);
    const cognitoUrl = `https://${domain}/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    window.location.href = cognitoUrl;
}

async function handleAuthRedirect() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');

        if (authCode) {
            console.log('Processing redirect from Cognito...');
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
        console.log('User not authenticated:', error.message);
        return false;
    }
}

async function logout() {
    try {
        await Amplify.Auth.signOut();
        window.location.href = 'signup.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

const profiles = [
    {
        name: "Alex",
        age: 24,
        bio: "Loves gym, tech, and late-night food.",
        photo: "https://via.placeholder.com/300x300"
    },
    {
        name: "Sam",
        age: 27,
        bio: "Coffee addict and night owl.",
        photo: "https://via.placeholder.com/300x300"
    },
    {
        name: "Jamie",
        age: 22,
        bio: "Into hiking and photography.",
        photo: "https://via.placeholder.com/300x300"
    }
];

let current = 0;

function swipe(direction) {
    const profile = profiles[current];
    const swipes = JSON.parse(localStorage.getItem("swipes")) || [];
    
    swipes.push({
        name: profile.name,
        direction: direction,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem("swipes", JSON.stringify(swipes));
    console.log("Saved swipes:", swipes);
    
    current++;
    
    if (current >= profiles.length) {
        alert("No more profiles!");
        current = 0;
    }
    
    loadProfile();
}

function loadProfile() {
    if (current >= profiles.length) return;
    
    const profile = profiles[current];
    
    if (document.getElementById("profile-name")) {
        document.getElementById("profile-name").innerText = `${profile.name}, ${profile.age}`;
        document.getElementById("profile-bio").innerText = profile.bio;
    }
}

async function initializePage() {
    const isAuthenticated = await handleAuthRedirect();
    
    if (window.location.pathname.includes('swipe.html')) {
        if (!isAuthenticated) {
            window.location.href = 'signup.html';
            return;
        }
        
        loadProfile();
        
        if (!document.getElementById('logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.onclick = logout;
            logoutBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 5px 10px;';
            document.body.appendChild(logoutBtn);
        }
    }
}

window.addEventListener('DOMContentLoaded', initializePage);