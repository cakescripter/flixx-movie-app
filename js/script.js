const global = {
  currentPage: window.location.pathname,
};

// Display 20 most popular movies
async function displayPopularMovies() {
  const { results } = await fetchAPIData('movie/popular');

  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
          <a href="movie-details.html?id=${movie.id}">
            ${movie.poster_path
        ? `<img
              src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              class="card-img-top"
              alt="${movie.title}"
            />`
        : `<img
            src="../images/no-image.jpg"
            class="card-img-top"
            alt="${movie.title}"
          />`
      }
          </a>
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${movie.release_date}</small>
            </p>
          </div>
        `;

    document.querySelector('#popular-movies').appendChild(div);
  });
}

// Display 20 most popular tv shows
async function displayPopularShows() {
  const { results } = await fetchAPIData('tv/popular');

  results.forEach((show) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
          <a href="tv-details.html?id=${show.id}">
            ${show.poster_path
        ? `<img
              src="https://image.tmdb.org/t/p/w500${show.poster_path}"
              class="card-img-top"
              alt="${show.name}"
            />`
        : `<img
            src="../images/no-image.jpg"
            class="card-img-top"
            alt="${show.name}"
          />`
      }
          </a>
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">
              <small class="text-muted">Air Date: ${show.first_air_date}</small>
            </p>
          </div>
        `;

    document.querySelector('#popular-shows').appendChild(div);
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
              src="https://image.tmdb.org/t/p/w500${item.poster_path}"
              class="card-img-top"
              alt="${item.title || item.name}"
            />`
      : `<img
              src="../images/no-image.jpg"
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


// Display Slider
async function displaySlider(endpoint, detailsPage, altTextProperty) {
  const { results } = await fetchAPIData(endpoint);

  results.forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide');

    div.innerHTML = `
    <a href="${detailsPage}?id=${item.id}">
      <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item[altTextProperty]}" />
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
  // Register your key at https://www.themoviedb.org/settings/api and enter here
  // Only use this for development or very small projects. You should store your key and make requests from a server
  const API_KEY = '13d8c9a45382a1c96f94ff665d60c60b';
  const API_URL = 'https://api.themoviedb.org/3/';

  showSpinner();

  const response = await fetch(
    `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
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

function addComas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Init App
function init() {
  switch (global.currentPage) {
    case '/':
    case '/index.html':
      displayPopularMovies();
      displaySlider('trending/movie/day', 'movie-details.html', 'title');
      break;
    case '/shows.html':
      displayPopularShows();
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
