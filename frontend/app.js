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
    if (typeof Amplify === 'undefined') return;
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

    const nameElement = document.getElementById("profile-name");
    const bioElement = document.getElementById("profile-bio");
    const imgElement = document.getElementById("profile-img");
    
    console.log('Elements found:', {
        nameElement: !!nameElement,
        bioElement: !!bioElement,
        imgElement: !!imgElement
    });
    
    if (nameElement) {
        nameElement.innerText = `${profile.name}, ${profile.age}`;
        console.log('Set name to:', `${profile.name}, ${profile.age}`);
    } else {
        console.error('nameElement not found!');
    }
    
    if (bioElement) {
        bioElement.innerText = profile.bio;
        console.log('Set bio to:', profile.bio);
    } else {
        console.error('bioElement not found!');
    }
    
    if (imgElement) {
        imgElement.src = profile.photo;
        console.log('Set image to:', profile.photo);
    } else {
        console.error('imgElement not found!');
    }
}

async function initializePage() {
    console.log('initializePage started');
    console.log('Current path:', window.location.pathname);
    
    const isAuthenticated = await handleAuthRedirect();
    console.log('Authentication result:', isAuthenticated);
    
    if (window.location.pathname.includes('swipe.html')) {
        console.log('On swipe.html page');
        
        console.log('Loading profile (authentication check skipped for testing)...');
        setTimeout(() => loadProfile(), 100);
        
        if (!document.getElementById('logout-btn')) {
            console.log('Adding logout button');
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.onclick = logout;
            logoutBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 5px 10px; background: #333; color: white; border: none; border-radius: 5px;';
            document.body.appendChild(logoutBtn);
        }
    }
    
    if (window.location.pathname.includes('index.html') && isAuthenticated) {
        console.log('User is authenticated on index page');
    }
    
    console.log('initializePage completed');
}

window.addEventListener('DOMContentLoaded', initializePage);