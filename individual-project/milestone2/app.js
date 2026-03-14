const API_BASE = "https://www.googleapis.com/books/v1";
const API_KEY = "";
const RESULTS_PER_PAGE = 20;
const MAX_TOTAL_RESULTS = 60;

// Google Books volume IDs from bookshelf
const MY_BOOKSHELF_IDS = [
  "r10U16kgmkwC",
  "StAWAgAAQBAJ",
  "y-9wCgAAQBAJ",
  "O4idLMoEc4wC",
  "L6IWAgAAQBAJ"
];

function apiUrl(path, params = {}) {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  if (API_KEY) {
    url.searchParams.set("key", API_KEY);
  }
  return url.toString();
}

function safeText(value) {
  return value === undefined || value === null ? "" : String(value);
}

function joinArray(arr) {
  return Array.isArray(arr) && arr.length ? arr.join(", ") : "N/A";
}

function getThumbnail(volumeInfo) {
  if (!volumeInfo || !volumeInfo.imageLinks) return "";
  return (
    volumeInfo.imageLinks.thumbnail ||
    volumeInfo.imageLinks.smallThumbnail ||
    ""
  );
}

function getPrice(saleInfo) {
  if (!saleInfo || !saleInfo.listPrice) return "Not available";
  return `${saleInfo.listPrice.amount} ${saleInfo.listPrice.currencyCode}`;
}

function createBookCard(item) {
  const v = item.volumeInfo || {};
  const a = item.accessInfo || {};
  const img = getThumbnail(v);

  let html = `
    <div class="book-card">
      <div class="book-body">
        <div>
          ${
            img
              ? `<img class="thumb" src="${img}" alt="Cover image for ${safeText(v.title)}">`
              : `<div class="thumb small" style="display:flex;align-items:center;justify-content:center;padding:8px;">No image</div>`
          }
        </div>
        <div>
          <h3 class="book-title">
            <a href="details.html?id=${encodeURIComponent(item.id)}">${safeText(v.title) || "Untitled"}</a>
          </h3>
          <div class="meta"><strong>Authors:</strong> ${joinArray(v.authors)}</div>
          <div class="meta"><strong>Publisher:</strong> ${safeText(v.publisher) || "N/A"}</div>
          <div class="meta"><strong>Published:</strong> ${safeText(v.publishedDate) || "N/A"}</div>
          <div class="actions">
  `;

  if (v.previewLink) {
    html += `<a href="${v.previewLink}" target="_blank" rel="noopener">Preview</a>`;
  }
  if (v.infoLink) {
    html += `<a href="${v.infoLink}" target="_blank" rel="noopener">Info</a>`;
  }
  if (a.webReaderLink) {
    html += `<a href="${a.webReaderLink}" target="_blank" rel="noopener">Web Reader</a>`;
  }

  html += `
          </div>
        </div>
      </div>
    </div>
  `;

  return html;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function buildPageOptions(totalItems, currentPage) {
  const capped = Math.min(totalItems || 0, MAX_TOTAL_RESULTS);
  const pageCount = Math.ceil(capped / RESULTS_PER_PAGE);
  let html = "";

  for (let i = 1; i <= pageCount; i++) {
    html += `<option value="${i}" ${i === currentPage ? "selected" : ""}>Page ${i}</option>`;
  }

  return html;
}

function runSearch(page = 1) {
  const q = $("#searchTerm").val().trim();
  if (!q) {
    $("#results").html(`<div class="error">Enter a search term first.</div>`);
    $("#pageSelect").html("");
    $("#resultSummary").text("");
    return;
  }

  $("#results").html(`<div class="small">Loading results...</div>`);

  const startIndex = (page - 1) * RESULTS_PER_PAGE;

  $.getJSON(
    apiUrl("/volumes", {
      q,
      startIndex,
      maxResults: RESULTS_PER_PAGE
    })
  )
    .done(function (data) {
      const items = data.items || [];
      const totalItems = Math.min(data.totalItems || 0, MAX_TOTAL_RESULTS);

      $("#resultSummary").text(`Showing page ${page}. Up to ${MAX_TOTAL_RESULTS} results are displayed.`);
      $("#pageSelect").html(buildPageOptions(totalItems, page));

      if (!items.length) {
        $("#results").html(`<div class="error">No results found.</div>`);
        return;
      }

      let html = `<div class="results-grid">`;
      items.forEach(item => {
        html += createBookCard(item);
      });
      html += `</div>`;

      $("#results").html(html);
    })
    .fail(function () {
      $("#results").html(`<div class="error">Search request failed. Try again.</div>`);
    });
}

function loadBookDetails() {
  const id = getQueryParam("id");
  if (!id) {
    $("#detailsContainer").html(`<div class="error">No book ID was provided.</div>`);
    return;
  }

  $("#detailsContainer").html(`<div class="small">Loading book details...</div>`);

  $.getJSON(apiUrl(`/volumes/${encodeURIComponent(id)}`))
    .done(function (data) {
      const v = data.volumeInfo || {};
      const s = data.saleInfo || {};
      const a = data.accessInfo || {};
      const img =
        (v.imageLinks && (v.imageLinks.large || v.imageLinks.medium || v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) || "";

      let html = `
        <div class="card">
          <div class="section-pad">
            <div class="details-grid">
              <div>
                ${
                  img
                    ? `<img class="cover" src="${img}" alt="Cover image for ${safeText(v.title)}">`
                    : `<div class="cover small" style="display:flex;align-items:center;justify-content:center;padding:12px;">No image</div>`
                }
                <div class="actions" style="margin-top:12px;">
                  ${v.previewLink ? `<a href="${v.previewLink}" target="_blank" rel="noopener">Preview</a>` : ""}
                  ${v.infoLink ? `<a href="${v.infoLink}" target="_blank" rel="noopener">Info</a>` : ""}
                  ${a.webReaderLink ? `<a href="${a.webReaderLink}" target="_blank" rel="noopener">Web Reader</a>` : ""}
                </div>
              </div>
              <div>
                <h2>${safeText(v.title) || "Untitled"}</h2>
                ${v.subtitle ? `<p class="small">${safeText(v.subtitle)}</p>` : ""}
                <div class="kv">
                  <div class="k">Authors</div><div>${joinArray(v.authors)}</div>
                  <div class="k">Publisher</div><div>${safeText(v.publisher) || "N/A"}</div>
                  <div class="k">Published Date</div><div>${safeText(v.publishedDate) || "N/A"}</div>
                  <div class="k">Price</div><div>${getPrice(s)}</div>
                  <div class="k">Page Count</div><div>${safeText(v.pageCount) || "N/A"}</div>
                  <div class="k">Language</div><div>${safeText(v.language) || "N/A"}</div>
                </div>
                <div style="margin-top:16px;">
                  <h3>Description</h3>
                  <div>${v.description || "<span class='small'>No description available.</span>"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      $("#detailsContainer").html(html);
    })
    .fail(function () {
      $("#detailsContainer").html(`<div class="error">Could not load book details.</div>`);
    });
}

function loadBookshelf() {
  if (!MY_BOOKSHELF_IDS.length) {
    $("#bookshelfResults").html(`<div class="error">Add your public bookshelf volume IDs in app.js first.</div>`);
    return;
  }

  $("#bookshelfResults").html(`<div class="small">Loading bookshelf books...</div>`);

  let completed = 0;
  let html = `<div class="results-grid">`;

  MY_BOOKSHELF_IDS.forEach(function (id) {
    $.getJSON(apiUrl(`/volumes/${encodeURIComponent(id)}`))
      .done(function (item) {
        html += createBookCard(item);
      })
      .fail(function (jqxhr, textStatus, error) {
        console.log("Bookshelf load failed for ID:", id, textStatus, error);
        html += `
          <div class="book-card">
            <div class="book-body">
              <div class="small">Could not load book ID: ${id}</div>
            </div>
          </div>
        `;
      })
      .always(function () {
        completed++;

        if (completed === MY_BOOKSHELF_IDS.length) {
          html += `</div>`;
          $("#bookshelfResults").html(html);
        }
      });
  });
}

