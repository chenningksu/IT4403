const API_KEY = "YOUR_API_KEY_HERE";

const MY_BOOKSHELF_IDS = [
  "r10U16kgmkwC",
  "pQ4Uil0Nml0C",
  "y-9wCgAAQBAJ",
  "O4idLMoEc4wC",
  "L6IWAgAAQBAJ"
];

const SEARCH_RESULTS_PER_PAGE = 10;
const MAX_RESULTS = 40;

let currentSearchResults = [];
let currentPage = 1;

function buildUrl(base, params = {}) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

function getThumbnail(volumeInfo) {
  return volumeInfo?.imageLinks?.thumbnail
    || volumeInfo?.imageLinks?.smallThumbnail
    || "https://via.placeholder.com/128x190?text=No+Cover";
}

function safeText(value, fallback = "Not available") {
  return value ? value : fallback;
}

function truncate(text, maxLength = 110) {
  if (!text) return "No description available.";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

function renderCards(items, targetSelector) {
  const $target = $(targetSelector);
  $target.empty();

  if (!items || !items.length) {
    $target.html('<div class="empty">No books found.</div>');
    return;
  }

  items.forEach(item => {
    const info = item.volumeInfo || {};
    const card = $(`
      <article class="book-card" data-id="${item.id}">
        <img src="${getThumbnail(info)}" alt="Book cover for ${safeText(info.title, 'Untitled book')}" />
        <div class="info">
          <h3>${safeText(info.title, 'Untitled')}</h3>
          <div class="small-text">${safeText((info.authors || []).join(', '), 'Unknown author')}</div>
        </div>
      </article>
    `);

    card.on('click', function () {
      loadBookDetails(item.id);
    });

    $target.append(card);
  });
}

function renderPagination() {
  const totalPages = Math.ceil(currentSearchResults.length / SEARCH_RESULTS_PER_PAGE);
  const $pagination = $('#searchPagination');
  $pagination.empty();

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = $(`<button class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`);
    btn.on('click', function () {
      currentPage = i;
      renderSearchPage();
    });
    $pagination.append(btn);
  }
}

function renderSearchPage() {
  const start = (currentPage - 1) * SEARCH_RESULTS_PER_PAGE;
  const end = start + SEARCH_RESULTS_PER_PAGE;
  const pageItems = currentSearchResults.slice(start, end);

  renderCards(pageItems, '#searchResults');
  renderPagination();
  $('#searchStatus').text(`Showing page ${currentPage} of ${Math.max(1, Math.ceil(currentSearchResults.length / SEARCH_RESULTS_PER_PAGE))}`);
}

function searchBooks() {
  const query = $('#searchInput').val().trim();

  if (!query) {
    $('#searchStatus').text('Please enter a search term.');
    $('#searchResults').empty();
    $('#searchPagination').empty();
    return;
  }

  $('#searchSummary').text(`Searching for "${query}"...`);
  $('#searchStatus').text('Loading search results...');

  const request1 = $.getJSON(buildUrl('https://www.googleapis.com/books/v1/volumes', {
    q: query,
    startIndex: 0,
    maxResults: 40,
    key: API_KEY
  }));

  const request2 = $.getJSON(buildUrl('https://www.googleapis.com/books/v1/volumes', {
    q: query,
    startIndex: 40,
    maxResults: 10,
    key: API_KEY
  }));

  $.when(request1, request2)
    .done(function (response1, response2) {
      const items1 = response1[0].items || [];
      const items2 = response2[0].items || [];

      currentSearchResults = [...items1, ...items2];
      currentPage = 1;
      renderSearchPage();
      $('#searchSummary').text(`Results for "${query}"`);

      if (!currentSearchResults.length) {
        $('#searchStatus').text('No results found for that search.');
      }
    })
    .fail(function () {
      $('#searchSummary').text('Search failed');
      $('#searchStatus').text('Error loading search results.');
      $('#searchResults').empty();
      $('#searchPagination').empty();
    });
}

function loadBookDetails(volumeId) {
  $('#detailsContent').html('<p class="small-text">Loading details...</p>');

  $.getJSON(buildUrl(`https://www.googleapis.com/books/v1/volumes/${volumeId}`, {
    key: API_KEY
  }))
  .done(function (data) {
    const info = data.volumeInfo || {};
    const authors = info.authors ? info.authors.join(', ') : 'Unknown author';
    const categories = info.categories ? info.categories.join(', ') : 'Not available';
    const publishedDate = info.publishedDate || 'Not available';
    const description = info.description || 'No description available.';

    $('#detailsContent').html(`
      <img src="${getThumbnail(info)}" alt="Book cover for ${safeText(info.title, 'Untitled book')}" />
      <h3>${safeText(info.title, 'Untitled')}</h3>
      <div class="detail-meta"><strong>Author(s):</strong> ${authors}</div>
      <div class="detail-meta"><strong>Published:</strong> ${publishedDate}</div>
      <div class="detail-meta"><strong>Categories:</strong> ${categories}</div>
      <div class="detail-meta"><strong>Publisher:</strong> ${safeText(info.publisher)}</div>
      <div class="detail-meta"><strong>Page Count:</strong> ${safeText(info.pageCount, 'Not available')}</div>
      <p>${description}</p>
    `);
  })
  .fail(function (xhr) {
    $('#detailsContent').html(`<p class="small-text">Could not load details: ${xhr.status} ${xhr.statusText}</p>`);
  });
}

function loadBookshelf() {
  $('#bookshelfStatus').text('Loading bookshelf...');

  const requests = MY_BOOKSHELF_IDS.map(id =>
    $.getJSON(`https://www.googleapis.com/books/v1/volumes/${id}?key=${API_KEY}`)
  );

  $.when(...requests)
    .done(function () {
      let results = [];

      for (let i = 0; i < arguments.length; i++) {
        results.push(arguments[i][0]);
      }

      renderCards(results, '#bookshelfResults');
      $('#bookshelfStatus').text('Custom bookshelf loaded.');
    })
    .fail(function () {
      $('#bookshelfStatus').text('Error loading bookshelf.');
      $('#bookshelfResults').html('<div class="empty">Unable to load bookshelf.</div>');
    });
}

$(document).ready(function () {
  $('#searchBtn').on('click', searchBooks);

  $('#searchInput').on('keypress', function (e) {
    if (e.which === 13) {
      searchBooks();
    }
  });

  loadBookshelf();
});
