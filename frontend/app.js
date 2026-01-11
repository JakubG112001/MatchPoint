function goTo(page) {
  window.location.href = page;
}

function login() {
  console.log("Login clicked");
  goTo("swipe.html");
}

function signup() {
  console.log("Signup clicked");
  goTo("swipe.html");
}


function swipe(direction) {
  console.log("Swiped:", direction);

}


function saveProfile() {
  const name = document.getElementById("name")?.value;
  const age = document.getElementById("age")?.value;
  const bio = document.getElementById("bio")?.value;

  console.log("Profile saved:", { name, age, bio });
}

