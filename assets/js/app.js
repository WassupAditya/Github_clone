// adding eventlistener on multiple elements

/*
@params {NodeList} $elements
@params {String} eventType
@params {Function} callback Funcio
*/

import { fetchData } from "./api.js";
import { numbertoKilo } from "./module.js";

const addEventonElements = function ($elements, eventType, callback) {
  for (const $item of $elements) {
    $item.addEventListener(eventType, callback);
  }
};

// header scroll state

const $header = document.querySelector("[data-header]");
window.addEventListener("scroll", function () {
  $header.classList[window.scrollY > 50 ? "add" : "remove"]("active");
});

const $searchToggler = document.querySelector("[data-search-toggler]");
const $searchField = document.querySelector("[data-search-field]");

let isExpanded = false;

$searchToggler.addEventListener("click", function () {
  $header.classList.toggle("search-active");
  isExpanded = isExpanded ? false : true;
  this.setAttribute("aria-expanded", isExpanded);
  $searchField.focus();
});

// tab navigation

const $tabBtns = document.querySelectorAll("[data-tab-btn]");
const $tabPanels = document.querySelectorAll("[data-tab-panel]");

let [$lastActiveTabBtn] = $tabBtns;
let [$lastActiveTabPanel] = $tabPanels;

addEventListenerToElements($tabBtns, "click", function () {
  $lastActiveTabBtn.setAttribute("aria-selected", "false");
  $lastActiveTabPanel.setAttribute("hidden", "");

  this.setAttribute("aria-selected", "true");
  const $currentTabPanel = document.querySelector(
    `#${this.getAttribute("aria-controls")}`
  );
  $currentTabPanel.removeAttribute("hidden");

  $lastActiveTabBtn = this;
  $lastActiveTabPanel = $currentTabPanel;
});

addEventListenerToElements($tabBtns, "keydown", function (e) {
  const $nextElement = this.nextElementSibling;
  const $previousElement = this.previousElementSibling;

  if (e.key === "ArrowRight" && $nextElement) {
    this.setAttribute("tabindex", "-1");
    $nextElement.setAttribute("tabindex", "0");
    $nextElement.focus();
  } else if (e.key === "ArrowLeft" && $previousElement) {
    this.setAttribute("tabindex", "-1");
    $previousElement.setAttribute("tabindex", "0");
    $previousElement.focus();
  }
});

function addEventListenerToElements(elements, event, callback) {
  elements.forEach((element) => {
    element.addEventListener(event, callback);
  });
}

// working with the api

const $searchSubmit = document.querySelector("[data-search-submit]");
let apiUrl = "https://api.github.com/users/johnpapa";
let repoUrl,
  followerUrl,
  followingUrl = "";

const searchUser = async function () {
  if (!$searchField.value) {
    return;
  }
  apiUrl = `https://api.github.com/users/${$searchField.value}`;

  try {
    await fetchData(apiUrl, updateProfile, (error) => {
      document.body.style.overflowY = "hidden";
      $error.innerHTML = `<p class="text">${
        error.message || "Error fetching data"
      }</p>`;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    document.body.style.overflowY = "hidden";
    $error.innerHTML = `<p class="text">Error fetching data</p>`;
  }
};

$searchSubmit.addEventListener("click", searchUser);

$searchField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchUser();
});

const $profileCard = document.querySelector("[data-profile-card]");
const $repoPanel = document.querySelector("[data-repo-panel]");
const $error = document.querySelector("[data-error]");

window.updateProfile = function (data) {
  $error.style.display = "none";
  document.body.style.overflowY = "visible";

  $profileCard.innerHTML = `
    <div class="profile-skeleton">
      <div class="skeleton avatar-skeleton"></div>
      <div class="skeleton title-skeleton"></div>
      <div class="skeleton text-skeleton text-1"></div>
      <div class="skeleton text-skeleton text-2"></div>
      <div class="skeleton text-skeleton text-3"></div>
    </div>
  `;
  $tabBtns[0].click();

  $repoPanel.innerHTML = `
    <div class="card repo-skeleton">
      <div class="card-body">
        <div class="skeleton title-skeleton"></div>
        <div class="skeleton text-skeleton text-1"></div>
        <div class="skeleton text-skeleton text-2"></div>
      </div>
      <div class="card-footer">
        <div class="skeleton text-skeleton"></div>
        <div class="skeleton text-skeleton"></div>
        <div class="skeleton text-skeleton"></div>
      </div>
    </div>
  `.repeat(6);
  const {
    type,
    avatar_url,
    name,
    login: username,
    html_url: githubPage,
    location,
    company,
    blog: website,
    twitter_username,
    bio,
    public_repos,
    followers,
    following,
    followers_url,
    following_url,
    repos_url
  } = data;

  repoUrl = repos_url;
  followerUrl = followers_url;
  if (following_url.includes("{/other_user}")) {
    followingUrl = following_url.replace("{/other_user}", "");
  }

  $error.style.display = "none";
  document.body.style.overflowY = "visible";

  $profileCard.innerHTML = `
    <figure class=" ${
      type === "User" ? "avatar-circle" : "avatar-rounded"
    } img-holder" style="--width: 280; --height: 280">
      <img src="${avatar_url}" width="280" height="280" alt="${username}" class="img-cover"
        style="object-fit: cover" />
    </figure>
  
    ${name ? `<h1 class="title-2">${name}</h1>` : ""}
  
    <p class="username text-primary">${username}</p>
  
    ${bio ? ` <p class="bio">${bio}</p>` : ""}
  
   
  
    <a href="${githubPage}" target="_blank" class="btn btn-secondary">
      <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
      <span class="span">See on Github</span>
    </a>
  
    <ul class="profile-meta">
    ${
      location
        ? `<li class="meta-item">
    <span class="material-symbols-rounded" aria-hidden="true">location_on</span>
    <span class="meta-text">${location}</span>
  </li>
  `
        : ""
    }
      
  ${
    company
      ? `<li class="meta-item">
  <span aria-hidden="true" class="material-symbols-rounded">apartment</span>
  <a href="#" target="_blank" class="meta-text">${company}</a>
  </li>`
      : ""
  }
  
  ${
    website
      ? `<li class="meta-item">
  <span aria-hidden="true" class="material-symbols-rounded">captive_portal</span>
  <a href="${website}" target="_blank" class="meta-text">${website.replace(
          "http://",
          ""
        )}</a>
  </li>`
      : ""
  }
  
  
  ${
    twitter_username
      ? `
  <li class="meta-item">
  <span class="icon">
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.9441 7.92638C19.9568 8.10403 19.9568 8.28173 19.9568 8.45938C19.9568 13.8781 15.8325 20.1218 8.29441 20.1218C5.97207 20.1218 3.81473 19.4492 2 18.2817C2.32996 18.3198 2.64719 18.3325 2.98984 18.3325C4.90605 18.3325 6.67004 17.6853 8.07867 16.5812C6.27664 16.5431 4.76648 15.3629 4.24617 13.7386C4.5 13.7766 4.75379 13.802 5.02031 13.802C5.38832 13.802 5.75637 13.7512 6.09898 13.6624C4.22082 13.2817 2.81215 11.632 2.81215 9.63958V9.58884C3.35781 9.89341 3.99238 10.0838 4.66492 10.1091C3.56086 9.37306 2.83754 8.11673 2.83754 6.6954C2.83754 5.93399 3.04055 5.23603 3.3959 4.62688C5.41367 7.11419 8.44668 8.73853 11.8477 8.91622C11.7842 8.61165 11.7461 8.29442 11.7461 7.97716C11.7461 5.71825 13.5736 3.87817 15.8451 3.87817C17.0253 3.87817 18.0913 4.3731 18.84 5.17259C19.7664 4.99493 20.6547 4.65228 21.4416 4.18274C21.137 5.13454 20.4898 5.93403 19.6395 6.44161C20.4644 6.35282 21.2639 6.12435 21.9999 5.80712C21.4416 6.61927 20.7436 7.34259 19.9441 7.92638Z"
        fill="var(--on-background)"></path>
    </svg>
  </span>
  <a href="https://twitter.com/${twitter_username}" target="_blank" class="meta-text">${twitter_username}</a>
  </li>
  
  `
      : ""
  }
  
    
      
    </ul>
    <ul class="profile-stats">
      <li class="stats-item"><span class="body">${public_repos}</span> Repos</li>
      <li class="stats-item">
        <span class="body">${numbertoKilo(followers)}</span> Followers
      </li>
      <li class="stats-item"><span class="body">${numbertoKilo(
        following
      )}</span>Following</li>
    </ul>
  
    <div class="footer">
      <p class="copyright">&copy; 2024 Johnpapa</p>
    </div>
    `;

  updateRepository();

  // Update other parts of the UI as needed
  // ...
};

fetchData(
  apiUrl,
  (data) => {
    // Call updateProfile only if the initial fetch is successful
    updateProfile(data);

    // Additional logic or function calls related to the initial data fetch
  },
  () => {
    document.body.style.overflowY = "hidden";
    $error.innerHTML = `<p class="text">There is no Repository with this Name</p>`;
  }
);

// repo

let forkedRepos = [];
let totalRepos = 150;

const $pagination = document.querySelector(".pagination");
const $prevButton = document.querySelector(
  ".pagination-arrow-button[aria-label='Previous']"
);
const $nextButton = document.querySelector(
  ".pagination-arrow-button[aria-label='Next']"
);

let currentPage = 1;
const reposPerPage = 10;
let maxPerPage = 100;

const updateRepository = function () {
  fetchData(
    `${repoUrl}?sort=created&per_page=${reposPerPage}&page=${currentPage}`,
    function (data) {
      $repoPanel.innerHTML = `<h2 class="sr-only">Repositories</h2>`;
      forkedRepos = data.filter((item) => item.fork);

      const repositories = data.filter((i) => !i.fork || i.fork);
      if (repositories.length) {
        for (const repo of repositories) {
          const {
            name,
            html_url,
            description,
            private: isPrivate,
            language,
            topics,
            stargazers_count: stars_count,
            forks_count
          } = repo;

          const $repoCard = document.createElement("article");
          $repoCard.classList.add("card", "repo-card");

          $repoCard.innerHTML = `
          <div class="card-body">
            <a href="${html_url}" target="_blank" class="card-title">
              <h1 class="title-3">${name}</h1>
            </a>
            ${description ? `<p class="card-text">${description}</p>` : ""}
            <span class="badge">${isPrivate ? "Private" : "Public"}</span>
          </div>
          <div class="card-footer">
            ${
              topics && topics.length > 0
                ? `<div class="meta-item-small">
                      ${topics
                        .map(
                          (topic) =>
                            `<span class="topic-badge-small">${topic}</span>`
                        )
                        .join("")}
                   </div>`
                : `<div class="meta-item-small">
                      <span class="topic-badge-small">No Topics Here</span>
                   </div>`
            }
          </div>
          <div class="card-footer">
            ${
              language
                ? `<div class="meta-item">
                    <span class="material-symbols-rounded" aria-hidden="true">code_blocks</span>
                    <span class="span">${language}</span>
                   </div>`
                : ""
            }
            <div class="meta-item">
              <span class="material-symbols-rounded" aria-hidden="true">star_rate</span>
              <span class="span">${numbertoKilo(stars_count)}</span>
            </div>
            <div class="meta-item">
              <span class="material-symbols-rounded" aria-hidden="true">family_history</span>
              <span class="span">${numbertoKilo(forks_count)}</span>
            </div>
          </div>
        `;

          $repoPanel.append($repoCard);
        }
      } else {
        $repoPanel.innerHTML = `
        <div class="error-content">
          <p class="title-1">Oops! :(</p>
          <p class="text">Doesn't have any public repositories yet.</p>
        </div>
      `;
      }
      updatePaginationButtons();
    }
  );
};

const updatePaginationButtons = function () {
  const totalPages = Math.ceil(totalRepos / reposPerPage);
  const numButtonsToShow = 10;

  // Clear existing pagination buttons
  $pagination.innerHTML = "";

  // Create and append previous button
  const $prevButtonClone = document.createElement("button");
  $prevButtonClone.className = "pagination-arrow-button";
  $prevButtonClone.setAttribute("aria-label", "Previous");
  $prevButtonClone.textContent = "< Previous";
  $prevButtonClone.disabled = currentPage === 1;
  $pagination.appendChild($prevButtonClone);

  // Calculate the range of buttons to display
  let startPage = Math.max(currentPage - Math.floor(numButtonsToShow / 2), 1);
  let endPage = Math.min(startPage + numButtonsToShow - 1, totalPages);

  // Adjust the range if it goes beyond the total pages
  if (endPage - startPage + 1 < numButtonsToShow) {
    startPage = Math.max(endPage - numButtonsToShow + 1, 1);
  }

  // Create and append pagination buttons
  for (let i = startPage; i <= endPage; i++) {
    const $button = document.createElement("button");
    $button.className = "pagination-button";
    $button.textContent = i;

    // Set active class to the currently selected page
    if (i === currentPage) {
      $button.classList.add("active");
    }

    $pagination.appendChild($button);

    // Add event listener to handle page change on button click
    $button.addEventListener("click", function () {
      currentPage = i;
      updateRepository();
    });
  }

  // Create and append next button
  const $nextButtonClone = document.createElement("button");
  $nextButtonClone.className = "pagination-arrow-button";
  $nextButtonClone.setAttribute("aria-label", "Next");
  $nextButtonClone.textContent = "Next >";
  $nextButtonClone.disabled = currentPage === totalPages;
  $pagination.appendChild($nextButtonClone);
};

// Add event listeners to handle previous and next button clicks
$pagination.addEventListener("click", function (event) {
  if (event.target.classList.contains("pagination-arrow-button")) {
    if (event.target.getAttribute("aria-label") === "Previous") {
      if (currentPage > 1) {
        currentPage--;
        updateRepository();
      }
    } else if (event.target.getAttribute("aria-label") === "Next") {
      if (currentPage < Math.ceil(totalRepos / reposPerPage)) {
        currentPage++;
        updateRepository();
      }
    }
  }
});

// Initial update on page load
updateRepository();

// forked repos

const $forkedPanel = document.querySelector("[data-fork-panel]");
const $forkTabBtn = document.querySelector("[data-forked-tab-btn]");

const updatedForkRepo = function () {
  $forkedPanel.innerHTML = `
  <h2 class="sr-only">Forked Repositories</h2>
  `;

  if (forkedRepos.length) {
    for (const repo of forkedRepos) {
      const {
        name,
        html_url,
        description,
        private: isPrivate,
        language,
        stargazers_count: stars_count,
        forks_count
      } = repo;

      const $forkCard = document.createElement("article");
      $forkCard.classList.add("card", "repo-card");

      $forkCard.innerHTML = `
              
              <div class="card-body">
              <a href="${html_url}" target="_blank" class="card-title">
                <h3 class="title-3">
                  ${name}
                </h3>
              </a>
              
              ${
                description
                  ? `<p class="card-text">
              ${description}
            </p>`
                  : ""
              }

              
              <span class="badge">
                ${isPrivate ? "Private" : "Public"}
              </span>
            </div>

            
            <div class="card-footer">

            ${
              language
                ? `<div class="meta-item">
            <span class="material-symbols-rounded" aria-hidden="true">code_blocks</span>
            <span class="span">${language}</span>
          </div>`
                : ""
            }

              
              <div class="meta-item">
                <span class="material-symbols-rounded" aria-hidden="true">star_rate</span>
                <span class="span">${numbertoKilo(stars_count)}</span>
              </div>
              <div class="meta-item">
                <span class="material-symbols-rounded" aria-hidden="true">family_history</span>
                <span class="span">${numbertoKilo(forks_count)}</span>
              </div>
            </div>

            
              `;

      $forkedPanel.appendChild($forkCard);
    }
  } else {
    $forkedPanel.innerHTML = `
      <div class="error-content">
          <p class="title-1">Oops! :(</p>
          <p class="text">Doesn't have any forked repositories yet.</p>
        </div>
      `;
  }
};

$forkTabBtn.addEventListener("click", updatedForkRepo);

// follower

const $followerTabBtn = document.querySelector("[data-follower-tab-btn]");
const $followerPanel = document.querySelector("[data-follower-panel]");

const updatedFollower = function () {
  // Display loading skeletons while fetching data
  $followerPanel.innerHTML = `
    <div class="card follower-skeleton">
      <div class="skeleton avatar-skeleton"></div>
      <div class="skeleton title-skeleton"></div>
    </div>
  `.repeat(12);

  fetchData(followerUrl, function (data) {
    // Clear the loading skeletons
    $followerPanel.innerHTML = `
      <h2 class="sr-only">Followers</h2>
    `;

    if (data.length) {
      for (const item of data) {
        const { login: username, avatar_url, url } = item;

        const $followerCard = document.createElement("article");
        $followerCard.classList.add("card", "follower-card");

        $followerCard.innerHTML = `
          <figure class="avatar-circle img-holder">
            <img src="${avatar_url}" width="56px" height="56px" loading="lazy" alt="${username}" class="img-cover">
          </figure>

          <h3 class="card-title">${username}</h3>

          <button class="icon-btn"  onclick="window.open('https://github.com/${username}', '_blank')"  aria-label="Go to ${username} profile">
            <span class="material-symbols-rounded" aria-hidden="true">link</span>
          </button>
        `;

        $followerPanel.appendChild($followerCard);
      }
    } else {
      // Display an error message when there are no followers
      $followerPanel.innerHTML = `
        <div class="error-content">
          <p class="title-1">Oops :(</p>
          <p class="text">
            Doesn't have any followers yet.
          </p>
        </div>
      `;
    }
  });
};

$followerTabBtn.addEventListener("click", updatedFollower);

// following

const $followingTabBtn = document.querySelector("[data-following-tab-btn]");

const $followingPanel = document.querySelector("[data-following-panel]");

const updateFollowing = function () {
  $followingPanel.innerHTML = `
    <div class="card follower-skeleton">
      <div class="skeleton avatar-skeleton"></div>
      <div class="skeleton title-skeleton"></div>
    </div>
  `.repeat(12);

  fetchData(followingUrl, function (data) {
    $followingPanel.innerHTML = `
    <h2 class="sr-only">Followings</h2>

    `;
    if (data.length) {
      for (const item of data) {
        const { login: username, avatar_url, url } = item;

        const $followingCard = document.createElement("article");
        $followingCard.classList.add("card", "follower-card");

        $followingCard.innerHTML = `
          <figure class="avatar-circle img-holder-small">
            <img src="${avatar_url}" width="56px" height="56px" loading="lazy" alt="${username}" class="img-cover-small">
          </figure>

          <h3 class="card-title">${username}</h3>

          <button class="icon-btn"  onclick="window.open('https://github.com/${username}', '_blank')"  aria-label="Go to ${username} profile">
            <span class="material-symbols-rounded" aria-hidden="true">link</span>
          </button>
        `;

        $followingPanel.appendChild($followingCard);
      }
    } else {
      // Display an error message when there are no followers
      $followingPanel.innerHTML = `
      <div class="error-content">
      <p class="title-1">Opps :(</p>
      <p class="text">
        Doesn't have any following yet.
      </p>
    </div>
      `;
    }
  });
};

$followingTabBtn.addEventListener("click", updateFollowing);
