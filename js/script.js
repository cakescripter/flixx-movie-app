const global = {
  currentPage: window.location.pathname,
  search: {
    term: '',
    type: '',
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
  api: {
    apiKey: '13d8c9a45382a1c96f94ff665d60c60b',
    apiUrl: 'https://api.themoviedb.org/3/'
  }
};

// Display 20 most popular movies or TV shows
async function displayPopularItems(endpoint, containerId, altTextProperty) {
  const { results } = await fetchAPIData(endpoint);

  results.forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <a href="${endpoint.includes('movie') ? 'movie' : 'tv'}-details.html?id=${item.id}">
        ${item.poster_path
        ? `<img
              src="https://image.tmdb.org/t/p/w500/${item.poster_path}"
              class="card-img-top"
              alt="${item[altTextProperty]}"
            />`
        : `<img
              src="../images/No-image.png"
              class="card-img-top"
              alt="${item[altTextProperty]}"
            />`
      }
      </a>
      <div class="card-body">
        <h5 class="card-title">${item[altTextProperty]}</h5>
        <p class="card-text">
          <small class="text-muted">${endpoint.includes('movie') ? 'Release' : 'Air'} Date: ${item[endpoint.includes('movie') ? 'release_date' : 'first_air_date']
      }</small>
        </p>
      </div>
    `;

    document.querySelector(containerId).appendChild(div);
  });
}

// Display Movie or Show Details
async function displayDetails(type) {
  const itemId = window.location.search.split('=')[1];
  const item = await fetchAPIData(`${type}/${itemId}`);

  //Overlay for background image
  displayBackgroundImage(type, item.backdrop_path);

  const div = document.createElement('div');
  div.innerHTML = `
    <div class="details-top">
      <div>
        ${item.poster_path
      ? `<img
              src="https://image.tmdb.org/t/p/w500/${item.poster_path}"
              class="card-img-top"
              alt="${item.title || item.name}"
            />`
      : `<img
              src="../images/No-image.png"
              class="card-img-top"
              alt="${item.title || item.name}"
            />`
    }
      </div>
      <div>
        <h2>${item.title || item.name}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${item.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">${type === 'movie' ? 'Release Date' : 'Last Air Date'}: ${item.release_date || item.last_air_date}</p>
        <p>${item.overview}</p>
        <h5>Genres</h5>
        <ul class="list-group">
          ${item.genres.map((genre) => `<li>${genre.name}</li>`).join('')}
        </ul>
        <a href="${item.homepage}" target="_blank" class="btn">Visit ${type === 'movie' ? 'Movie' : 'Show'} Homepage</a>
      </div>
    </div>
    <div class="details-bottom">
      <h2>${type === 'movie' ? 'Movie' : 'Show'} Info</h2>
      <ul>
        ${type === 'movie' ?
      `<li><span class="text-secondary">Budget:</span> $${addComas(item.budget)}</li>
           <li><span class="text-secondary">Revenue:</span> $${addComas(item.revenue)}</li>
           <li><span class="text-secondary">Runtime:</span> ${item.runtime} minutes</li>
           <li><span class="text-secondary">Status:</span> ${item.status}</li>` :
      `<li><span class="text-secondary">Number Of Episodes:</span> ${item.number_of_episodes}</li>
           <li><span class="text-secondary">Last Episode To Air:</span> ${item.last_episode_to_air.name}</li>
           <li><span class="text-secondary">Status:</span> Released</li>`
    }
      </ul>
      <h4>Production Companies</h4>
      <div class="list-group">${item.production_companies.map((company) => `<span>${company.name}</span>`).join(', ')}</div>
    </div>
  `;

  const targetContainer = type === 'movie' ? '#movie-details' : '#show-details';
  document.querySelector(targetContainer).appendChild(div);
}


// Display backgrop on details pages
function displayBackgroundImage(type, backgroundPath) {
  const overlayDiv = document.createElement('div');
  overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backgroundPath})`;
  overlayDiv.style.backgroundSize = 'cover';
  overlayDiv.style.backgroundPosition = 'center';
  overlayDiv.style.backgroundRepeat = 'no-repeat';
  overlayDiv.style.height = '100vh';
  overlayDiv.style.width = '100vw';
  overlayDiv.style.position = 'absolute';
  overlayDiv.style.top = '0';
  overlayDiv.style.left = '0';
  overlayDiv.style.zIndex = '-1';
  overlayDiv.style.opacity = '0.1';

  if (type === 'movie') {
    document.querySelector('#movie-details').appendChild(overlayDiv);
  } else {
    document.querySelector('#show-details').appendChild(overlayDiv);
  }
}

// Search Movie or Show
async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  global.search.type = urlParams.get('type');
  global.search.term = urlParams.get('search-term');

  if (global.search.term !== '' && global.search.term !== null) {
    const { results, total_pages, page, total_results } = await searchAPIData();

    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;

    if (results.length === 0) {
      showAlert('No results found');
      return;
    }

    displaySearchResults(results);
    document.querySelector('#search-term').value = '';

  } else {
    showAlert('Please enter a search term');
  }
}

function displaySearchResults(results) {
  // Clear previous results
  document.querySelector('#search-results').innerHTML = '';
  document.querySelector('#search-results-heading').innerHTML = '';
  document.querySelector('#pagination').innerHTML = '';
  results.forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <a href="${global.search.type}-details.html?id=${item.id}">
        ${item.poster_path
        ? `<img
              src="https://image.tmdb.org/t/p/w500${item.poster_path}"
              class="card-img-top"
              alt="${global.search.type === 'movie' ? item.title : item.name}"
            />`
        : `<img
              src="../images/No-image.png"
              class="card-img-top"
              alt="${global.search.type === 'movie' ? item.title : item.name}"
            />`
      }
      </a>
      <div class="card-body">
        <h5 class="card-title">${global.search.type === 'movie' ? item.title : item.name}</h5>
        <p class="card-text">
          <small class="text-muted">${global.search.type === 'movie' ? 'Release' : 'First Air'} Date: ${global.search.type === 'movie' ? item.release_date : item.first_air_date}
      </small>
        </p>
      </div>
    `;
    document.querySelector('#search-results-heading').innerHTML = `<h2>${global.search.totalResults} results for ${global.search.term}</h2>`;
    document.querySelector('#search-results').appendChild(div);
  });

  displayPagination();
}

// Create & Display Pagination For Search
function displayPagination() {
  const div = document.createElement('div');
  div.classList.add('pagination');
  div.innerHTML = `
    <button class="btn btn-primary" id="prev">Prev</button>
    <button class="btn btn-primary" id="next">Next</button>
    <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>`;

  document.querySelector('#pagination').appendChild(div);

  // Disable buttons
  if (global.search.page === 1) {
    document.querySelector('#prev').disabled = true;
  }
  if (global.search.page === global.search.totalPages) {
    document.querySelector('#next').disabled = true;
  }

  // Next page
  document.querySelector('#next').addEventListener('click', async () => {
    global.search.page++;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
  })

  // Previous page
  document.querySelector('#prev').addEventListener('click', async () => {
    global.search.page--;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
  })

}


// Display Slider
async function displaySlider(endpoint, detailsPage, altTextProperty) {
  const { results } = await fetchAPIData(endpoint);

  results.forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide');

    div.innerHTML = `
    <a href="${detailsPage}?id=${item.id}">
      <img src="https://image.tmdb.org/t/p/w500/${item.poster_path}" alt="${item[altTextProperty]}" />
    </a>
    <h4 class="swiper-rating">
      <i class="fas fa-star text-secondary"></i> ${item.vote_average.toFixed(1)} / 10
    </h4>
    `;

    document.querySelector('.swiper-wrapper').appendChild(div);
    initSwiper();
  });
}

function initSwiper() {
  const swiper = new Swiper('.swiper', {
    slidesPerView: 2,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: true
    },
    breakpoints: {
      500: {
        slidesPerView: 2
      },
      700: {
        slidesPerView: 3
      },
      1200: {
        slidesPerView: 4,
      }
    }
  })
}

// Fetch data from TMDB API
async function fetchAPIData(endpoint) {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  showSpinner();
  const response = await fetch(
    `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
  );

  const data = await response.json();
  hideSpinner();
  return data;
}

// Make Request to Search
async function searchAPIData() {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  showSpinner();
  const response = await fetch(
    `${API_URL}search/${global.search.type}?api_key=${API_KEY}&language=en-US&query=${global.search.term}&page=${global.search.page}`
  );

  const data = await response.json();
  hideSpinner();
  return data;
}

function showSpinner() {
  document.querySelector('.spinner').classList.add('show');
}

function hideSpinner() {
  document.querySelector('.spinner').classList.remove('show');
}

// Highlight active link
function highlightActiveLink() {
  const links = document.querySelectorAll('.nav-link');
  links.forEach((link) => {
    if (link.getAttribute('href') === global.currentPage) {
      link.classList.add('active');
    }
  });
}

// Show Alert
function showAlert(message, className = 'alert-error') {
  const alertEl = document.createElement('div');
  alertEl.classList.add('alert', className);
  alertEl.appendChild(document.createTextNode(message));
  document.querySelector('#alert').appendChild(alertEl);

  setTimeout(() => alertEl.remove(), 3000);
}

function addComas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Init App
function init() {
  switch (global.currentPage) {
    case '/':
    case '/index.html':
      displayPopularItems('movie/popular', '#popular-movies', 'title');
      displaySlider('trending/movie/day', 'movie-details.html', 'title');
      break;
    case '/shows.html':
      displayPopularItems('tv/popular', '#popular-shows', 'name');
      displaySlider('trending/tv/week', 'tv-details.html', 'name');
      break;
    case '/movie-details.html':
      displayDetails('movie');
      break;
    case '/tv-details.html':
      displayDetails('tv');
      break;
    case '/search.html':
      search();
      break;
  }

  highlightActiveLink();
}

document.addEventListener('DOMContentLoaded', init);
