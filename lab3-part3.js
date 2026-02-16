var jsonObject = {
  "title": "Fantastic Mr. Fox",
  "publish_date": "October 1, 1988",
  "publishers": ["Puffin"],
  "number_of_pages": 96,
  "authors": [
    { "key": "/authors/OL34184A" }
  ],
  "identifiers": {
    "goodreads": ["1507552"],
    "librarything": ["6446"]
  },
  "first_sentence": {
    "type": "/type/text",
    "value": "Down in the valley there were three farms."
  },
  "isbn_10": ["0140328726"],
  "isbn_13": ["9780140328721"]
};

$(document).ready(function () {

    var title = jsonObject.title;
    var publisher = jsonObject.publishers[0];
    var publishDate = jsonObject.publish_date;
    var pages = jsonObject.number_of_pages;
    var firstSentence = jsonObject.first_sentence.value;
    var isbn10 = jsonObject.isbn_10[0];
    var isbn13 = jsonObject.isbn_13[0];
    var goodreads = jsonObject.identifiers.goodreads[0];
    var librarything = jsonObject.identifiers.librarything[0];

    $("#output").html(
        "<h2>" + title + "</h2>" +
        "<p><strong>Publisher:</strong> " + publisher + "</p>" +
        "<p><strong>Publish Date:</strong> " + publishDate + "</p>" +
        "<p><strong>Pages:</strong> " + pages + "</p>" +
        "<p><strong>First Sentence:</strong> " + firstSentence + "</p>" +
        "<p><strong>ISBN-10:</strong> " + isbn10 + "</p>" +
        "<p><strong>ISBN-13:</strong> " + isbn13 + "</p>" +
        "<p><strong>Goodreads ID:</strong> " + goodreads + "</p>" +
        "<p><strong>LibraryThing ID:</strong> " + librarything + "</p>"
    );

});
