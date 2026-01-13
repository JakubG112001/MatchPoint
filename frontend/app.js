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

function login() {
  console.log("Login clicked");
  window.location.href = "swipe.html";
}

function signup() {
  console.log("Signup clicked");
  window.location.href = "swipe.html";
}

function swipe(direction) {
  const profile = profiles[current];

  const swipes = JSON.parse(localStorage.getItem("swipes")) || [];
  swipes.push({
    name: profile.name,
    direction: direction
  });

  localStorage.setItem("swipes", JSON.stringify(swipes));

  console.log("Saved swipes:", swipes);

  current++;

  if (current >= profiles.length) {
    alert("No more profiles!");
    return;
  }

  loadProfile();
}

function loadProfile() {
  const profile = profiles[current];

  document.getElementById("profile-name").innerText =
    `${profile.name}, ${profile.age}`;

  document.getElementById("profile-bio").innerText =
    profile.bio;
}

window.onload = () => {
  if (document.getElementById("name")) {
    loadProfile();
  }
}

if (window.location.pathname.includes("swipe.html")) {
  loadProfile();
};
