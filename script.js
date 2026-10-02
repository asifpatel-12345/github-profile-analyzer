const searchBtn = document.getElementById("search-btn");
const usernameInput = document.getElementById("username-input");
const dashboard = document.getElementById("dashboard");
const errorMsg = document.getElementById("error-msg");

let chartInstance = null;

searchBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (username) {
    fetchUserData(username);
  }
});

usernameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

async function fetchUserData(username) {
  errorMsg.classList.add("hidden");
  
  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error("User not found");
    const userData = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    const reposData = await reposRes.json();

    renderProfile(userData);
    renderCharts(reposData);
    renderRepos(reposData);

    dashboard.classList.remove("hidden");
  } catch (err) {
    dashboard.classList.add("hidden");
    errorMsg.textContent = err.message;
    errorMsg.classList.remove("hidden");
  }
}

function renderProfile(user) {
  document.getElementById("avatar").src = user.avatar_url;
  document.getElementById("user-name").textContent = user.name || user.login;
  document.getElementById("user-bio").textContent = user.bio || "No bio available.";
  document.getElementById("stat-repos").textContent = user.public_repos;
  document.getElementById("stat-followers").textContent = user.followers;
  document.getElementById("stat-following").textContent = user.following;
  document.getElementById("profile-link").href = user.html_url;
}

function renderCharts(repos) {
  const langCounts = {};

  repos.forEach((repo) => {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
  });

  const labels = Object.keys(langCounts);
  const data = Object.values(langCounts);

  const ctx = document.getElementById("language-chart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            "#58a6ff", "#3fb950", "#d29922", "#f85149", "#a371f7", "#8b949e"
          ],
          borderWidth: 1,
          borderColor: "#161b22"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#c9d1d9" }
        }
      }
    }
  });
}

function renderRepos(repos) {
  const container = document.getElementById("repos-container");
  container.innerHTML = "";

  // Filter top 6 repos based on stargazers count
  const topRepos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);

  topRepos.forEach((repo) => {
    const card = document.createElement("div");
    card.className = "repo-card";
    card.innerHTML = `
      <h4><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h4>
      <p>${repo.description || "No description provided."}</p>
      <div class="repo-meta">
        <span>${repo.language || "Plain Text"}</span>
        <span>★ ${repo.stargazers_count}</span>
      </div>
    `;
    container.appendChild(card);
  });
}