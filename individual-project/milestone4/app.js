const API_KEY = "key";

const MY_BOOKSHELF_IDS = [
  "r10U16kgmkwC",
  "pQ4Uil0Nml0C",
  "y-9wCgAAQBAJ",
  "O4idLMoEc4wC",
  "L6IWAgAAQBAJ"
];

const SEARCH_RESULTS_PER_PAGE = 10;

let currentSearchResults = [];
let currentBookshelfResults = [];
let currentPage = 1;
let currentView = 'grid';
let activeTab = 'search';

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

function formatBook(item) {
  const info = item.volumeInfo || {};

  return {
    id: item.id,
    title: info.title || "Untitled",
    authors: (info.authors || ["Unknown author"]).join(", "),
    publisher: info.publisher || "Not available",
    publishedDate: info.publishedDate || "Not available",
    thumbnail: getThumbnail(info),
    description: info.description || "No description available.",
    categories: (info.categories || ["Not available"]).join(", "),
    pageCount: info.pageCount || "Not available",
    language: info.language || "Not available",
    viewClass: currentView === "grid" ? "grid-item" : "list-item",
    isListView: currentView === "list"
  };
}

function renderCards(items, targetSelector) {
  const $target = $(targetSelector);
  $target.empty();

  if (!items || !items.length) {
    $target.html('<div class="empty">No books found.</div>');
    return;
  }

  const template = $('#book-card-template').html();

  const viewData = {
    books: items.map(item => formatBook(item))
  };

  const rendered = Mustache.render(template, viewData);
  $target.html(rendered);

  $target.find('.book-card').on('click', function () {
    const volumeId = $(this).data('id');
    loadBookDetails(volumeId);
  });

  $target.removeClass('grid list').addClass(currentView);
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

  $('#searchStatus').text(
    `Showing page ${currentPage} of ${Math.max(1, Math.ceil(currentSearchResults.length / SEARCH_RESULTS_PER_PAGE))}`
  );
}

function renderBookshelf() {
  renderCards(currentBookshelfResults, '#bookshelfResults');
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
      showTab('search');
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

function showTab(tabName) {
  activeTab = tabName;

  if (tabName === 'search') {
    $('#searchSection').show();
    $('#bookshelfSection').hide();
    $('#showSearchTab').addClass('active-tab');
    $('#showBookshelfTab').removeClass('active-tab');
  } else {
    $('#searchSection').hide();
    $('#bookshelfSection').show();
    $('#showBookshelfTab').addClass('active-tab');
    $('#showSearchTab').removeClass('active-tab');
  }
}

function setView(viewName) {
  currentView = viewName;

  $('#gridViewBtn').toggleClass('active-view', viewName === 'grid');
  $('#listViewBtn').toggleClass('active-view', viewName === 'list');

  renderSearchPage();
  renderBookshelf();
}

function loadBookDetails(volumeId) {
  $('#detailsContent').html('<p class="small-text">Loading details...</p>');

  $.getJSON(buildUrl(`https://www.googleapis.com/books/v1/volumes/${volumeId}`, {
    key: API_KEY
  }))
    .done(function (data) {
      const template = $('#book-details-template').html();
      const rendered = Mustache.render(template, formatBook(data));
      $('#detailsContent').html(rendered);
    })
    .fail(function (xhr) {
      $('#detailsContent').html(
        `<p class="small-text">Could not load details: ${xhr.status} ${xhr.statusText}</p>`
      );
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

      currentBookshelfResults = results;
      renderBookshelf();
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

  $('#showSearchTab').on('click', function () {
    showTab('search');
  });

  $('#showBookshelfTab').on('click', function () {
    showTab('bookshelf');
  });

  $('#gridViewBtn').on('click', function () {
    setView('grid');
  });

  $('#listViewBtn').on('click', function () {
    setView('list');
  });

  showTab('search');
  loadBookshelf();
});
