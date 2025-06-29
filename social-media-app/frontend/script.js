const API = "http://localhost:3000/api";

async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    return alert("Username and password are required.");
  }

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.error) {
    return alert("Error: " + data.error);
  }

  alert("Registered: " + data.username);
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    return alert("Username and password are required.");
  }

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.error) {
    return alert("Login failed: " + data.error);
  }

  localStorage.setItem("user", JSON.stringify(data));
  alert("Welcome, " + data.username + "!");
  loadPosts();
}

async function addPost() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return alert("Please log in to post.");
  }

  const content = document.getElementById("postContent").value.trim();
  if (!content) {
    return alert("Post content cannot be empty.");
  }

  const res = await fetch(`${API}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author: user._id, content }),
  });

  const post = await res.json();
  if (post.error) {
    return alert("Post error: " + post.error);
  }

  document.getElementById("postContent").value = "";
  loadPosts();
}

async function loadPosts() {
  const res = await fetch(`${API}/posts`);
  const posts = await res.json();

  const container = document.getElementById("posts");
  container.innerHTML = "";

  posts.forEach((p) => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `<strong>${p.author.username}</strong>: ${p.content}`;
    container.appendChild(div);
  });
}

// Auto-load posts if logged in
if (localStorage.getItem("user")) {
  loadPosts();
}
