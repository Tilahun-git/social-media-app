const API = "https://social-media-app-4-45pu.onrender.com/api";
let allPosts = [];

async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Username and password required");

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.error) return alert("Error: " + data.error);
  alert("Registered: " + data.username);
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Username and password required");

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.error) return alert("Login failed: " + data.error);
  localStorage.setItem("user", JSON.stringify(data));
  alert("Welcome, " + data.username);
  showPostSection(true);
  loadPosts();
}

function logout() {
  localStorage.removeItem("user");
  alert("Logged out");
  showPostSection(false);
  document.getElementById("posts").innerHTML = "";
  document.getElementById("searchInput").style.display = "none";
}

function showPostSection(show) {
  document.getElementById("post-section").style.display = show
    ? "block"
    : "none";
  document.getElementById("auth-section").style.display = show
    ? "none"
    : "block";
  document.getElementById("searchInput").style.display = show
    ? "block"
    : "none";
}

async function addPost() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Please log in");

  const content = document.getElementById("postContent").value.trim();
  const imageFile = document.getElementById("postImage").files[0];
  if (!content && !imageFile) return alert("Content or image required");

  const formData = new FormData();
  formData.append("author", user._id);
  formData.append("content", content);
  if (imageFile) formData.append("image", imageFile);

  const res = await fetch(`${API}/posts`, {
    method: "POST",
    body: formData,
  });

  const post = await res.json();
  if (post.error) return alert("Post error: " + post.error);

  document.getElementById("postContent").value = "";
  document.getElementById("postImage").value = null;

  loadPosts();
}

async function loadPosts() {
  const user = JSON.parse(localStorage.getItem("user"));
  const res = await fetch(`${API}/posts`);
  allPosts = await res.json();
  filterPosts();
}

function filterPosts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const user = JSON.parse(localStorage.getItem("user"));
  const container = document.getElementById("posts");
  container.innerHTML = "";

  const filtered = allPosts.filter(
    (p) =>
      p.author?.username?.toLowerCase().includes(query) ||
      p.content?.toLowerCase().includes(query)
  );

  filtered.forEach((p) => {
    const liked = p.likes?.includes(user?._id);
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <strong>${p.author?.username || "Unknown"}</strong>: ${p.content}
      ${
        p.image
          ? `<br><img src="${API.replace("/api", "")}/uploads/${p.image}" ${
              user._id === p.author?._id
                ? `onclick="editImage('${p._id}')"`
                : ""
            }>`
          : ""
      }
      <div>
        <button onclick="toggleLike('${p._id}')">${
      liked ? "❤️ Unlike" : "🤍 Like"
    } (${p.likes?.length || 0})</button>
        ${
          user._id !== p.author?._id
            ? `<button onclick="followUser('${p.author?._id}')">➕ Follow</button>`
            : `<button onclick="editPost('${p._id}', \`${p.content}\`)">✏️ Edit</button>
               <button onclick="deletePost('${p._id}')" class="delete-btn">🗑️ Delete</button>`
        }
      </div>
      <div class="comments" id="comments-${p._id}"></div>
      <div class="comment-input">
        <input type="text" id="comment-input-${
          p._id
        }" placeholder="Write a comment..." />
        <button onclick="addComment('${p._id}')">Comment</button>
      </div>
    `;
    container.appendChild(div);
    loadComments(p._id);
  });
}

async function followUser(userId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Please log in");

  try {
    const resFollow = await fetch(`${API}/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ follower: user._id, following: userId }),
    });

    const resClone = resFollow.clone();
    let data;
    try {
      data = await resFollow.json();
    } catch {
      const text = await resClone.text();
      console.error("Response not JSON from /follow:", text);
      return alert("Follow error: server returned invalid response");
    }

    if (data.error) return alert("Follow error: " + data.error);
    alert(data.unfollowed ? `Unfollowed user` : `Followed user`);
    loadPosts();
  } catch (err) {
    alert("Fetch error: " + err.message);
  }
}

async function editPost(postId, currentContent) {
  const newContent = prompt("Edit your post:", currentContent);
  if (newContent === null) return;

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.onchange = async () => {
    const formData = new FormData();
    formData.append("content", newContent);
    if (fileInput.files[0]) {
      formData.append("image", fileInput.files[0]);
    }

    const res = await fetch(`${API}/posts/${postId}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    if (data.error) return alert("Edit failed: " + data.error);
    loadPosts();
  };

  fileInput.click();
}

async function editImage(postId) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.onchange = async () => {
    const formData = new FormData();
    formData.append("content", ""); // keep existing content
    if (fileInput.files[0]) {
      formData.append("image", fileInput.files[0]);
    }

    const res = await fetch(`${API}/posts/${postId}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    if (data.error) return alert("Edit image failed: " + data.error);
    loadPosts();
  };

  fileInput.click();
}

async function deletePost(postId) {
  if (!confirm("Delete this post?")) return;

  const res = await fetch(`${API}/posts/${postId}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (data.error) return alert("Delete error: " + data.error);
  loadPosts();
}

async function toggleLike(postId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Log in to like");

  const res = await fetch(`${API}/posts/${postId}/like`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user._id }),
  });

  const data = await res.json();
  if (data.error) return alert("Like error: " + data.error);
  loadPosts();
}

async function addComment(postId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Log in to comment");

  const input = document.getElementById(`comment-input-${postId}`);
  const content = input.value.trim();
  if (!content) return alert("Empty comment");

  const res = await fetch(`${API}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author: user._id, post: postId, content }),
  });

  const data = await res.json();
  if (data.error) return alert("Comment error: " + data.error);

  input.value = "";
  loadComments(postId);
}

async function loadComments(postId) {
  const res = await fetch(`${API}/comments/post/${postId}`);
  const comments = await res.json();

  const container = document.getElementById(`comments-${postId}`);
  container.innerHTML = "";

  comments.forEach((c) => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `${c.author.username}: ${c.content}`;
    container.appendChild(div);
  });
}

if (localStorage.getItem("user")) {
  showPostSection(true);
  loadPosts();
}
