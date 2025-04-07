let usersData = [];
let sortAsc = true;

document.addEventListener("DOMContentLoaded", () => {
  const loadBtn = document.getElementById("load-btn");
  const searchInput = document.getElementById("search");
  const sortBtn = document.getElementById("sort-btn");

  loadBtn.addEventListener("click", loadUsers);
  searchInput.addEventListener("input", filterUsers);
  sortBtn.addEventListener("click", sortUsers);
});

async function fetchData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  return await res.json();
}


async function loadUsers() {
  try {
    const users = await fetchData("https://jsonplaceholder.typicode.com/users");
    usersData = users;
    renderUsers(usersData);
  } catch {
    alert("Failed to load users.");
  }
}

function renderUsers(users) {
  const list = document.getElementById("users-list");
  list.innerHTML = "";
  const postsContainer = document.getElementById("posts-container");
  postsContainer.innerHTML = "";

  users.forEach(user => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${user.name}</strong> (${user.email})
      <div class="user-actions">
        <button class="view-posts-btn" data-userid="${user.id}">👁 View Posts</button>
      </div>
    `;
    list.appendChild(li);

    li.querySelector(".view-posts-btn").addEventListener("click", () => {
      showPosts(user.id);
    });
  });
}

function filterUsers() {
  const value = document.getElementById("search").value.toLowerCase();
  const filtered = usersData.filter(user =>
    user.name.toLowerCase().includes(value)
  );
  renderUsers(filtered);
}

function sortUsers() {
  sortAsc = !sortAsc;
  const sorted = [...usersData].sort((a, b) => {
    return sortAsc
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });
  renderUsers(sorted);
}

async function showPosts(userId) {
  try {
    const posts = await fetchData(
      `https://jsonplaceholder.typicode.com/posts?userId=${userId}`
    );
    const container = document.getElementById("posts-container");
    container.innerHTML = "<h2>📝 Posts</h2>";

    for (const post of posts.slice(0, 3)) {
      const postDiv = document.createElement("div");
      postDiv.classList.add("post");
      postDiv.innerHTML = `<strong>${post.title}</strong><br>${post.body}<br>
        <button class="view-comments-btn" data-postid="${post.id}">💬 View Comments</button>
        <div id="comments-${post.id}" class="comments"></div>`;
      container.appendChild(postDiv);

      postDiv.querySelector(".view-comments-btn").addEventListener("click", () => {
        loadComments(post.id);
      });
    }
  } catch {
    alert("Failed to load posts.");
  }
}

async function loadComments(postId) {
  try {
    const comments = await fetchData(
      `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
    );
    const commentsDiv = document.getElementById(`comments-${postId}`);
    commentsDiv.innerHTML = comments
      .map(
        c => `<div class="comment"><strong>${c.name}</strong>: ${c.body}</div>`
      )
      .join("");
  } catch {
    alert("Failed to load comments.");
  }
}

const ws = new WebSocket(`ws://${location.host}`);

const messages = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", () => {
  const msg = msgInput.value.trim();
  if (msg !== "") {
    addMessage(`🧑‍💻 You: ${msg}`);
    ws.send(msg); // Відправка повідомлення на сервер
    msgInput.value = ""; // Очистити поле
  }
});

ws.addEventListener("message", async (event) => {
  let messageText;

  if (event.data instanceof Blob) {
    messageText = await event.data.text(); // перетворити Blob у текст
  } else {
    messageText = event.data;
  }

  addMessage(`👤 Stranger: ${messageText}`);
});


function addMessage(text) {
  const li = document.createElement("li");
  li.textContent = text;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight; // Прокрутка до останнього повідомлення
}
