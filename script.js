document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    alert(result.message || result.error);
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    alert(result.message || result.error);
    if (result.message) {
        document.getElementById('post-section').style.display = 'block'; 
        loadPosts(); 
    }
});

async function loadPosts() {
    const response = await fetch('/api/posts');
    const posts = await response.json();
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <p>${post.content}</p>
            <button class="delete-button" data-id="${post.id}">Delete</button>
        `;
        postsContainer.appendChild(postElement);
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async () => {
            const postId = button.getAttribute('data-id');
            const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            const result = await response.json();
            alert(result.message);
            loadPosts(); 
        });
    });
}

document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('post-content').value;

    const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });

    const result = await response.json();
    alert(result.message);
    document.getElementById('post-content').value = ''; 
    loadPosts(); 
});


loadPosts();
