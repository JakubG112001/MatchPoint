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
  console.log("Swiped:", direction, profiles[current]);

  current++;

  if (current >= profiles.length) {
    alert("No more profiles!");
    return;
  }

  loadProfile();
}

function loadProfile() {
  document.getElementById("name").innerText =
    profiles[current].name + ", " + profiles[current].age;

  document.getElementById("bio").innerText =
    profiles[current].bio;

  document.getElementById("photo").src =
    profiles[current].photo;
}

window.onload = () => {
  if (document.getElementById("name")) {
    loadProfile();
  }
};
