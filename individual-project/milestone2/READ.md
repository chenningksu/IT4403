Overview
In this milestone, you will continue developing your individual project by working with a real-world web API. You will use the Google Books API to build a small web application that allows users to search for books, view detailed book information, and display books from a public Google Books bookshelf.

Instructions 
Step 1: Set Up Your Milestone #2 Project
Create a new, separate folder for Milestone #2.

Design this milestone as a standalone web application with its own layout and styling.

Use only HTML, CSS, JavaScript, and jQuery. Do not use any other libraries or frameworks.

Ensure all files work correctly from your public, live website.

Step 2: Create the Application Navigation
Add a main navigation menu to your application.

The navigation menu must include:

Home – Book Search page

My Bookshelf – Public bookshelf page

Ensure navigation links work correctly across all pages.

Step 3: Build the Book Search Page (Home)
Create a webpage that allows users to search for books using keywords.

Add a textbox for users to enter search terms.

Add a Search button to trigger the search.

When the search button is clicked:

Dynamically construct the Google Books API request URL using the search term.

Call the API and retrieve the response in JSON format.

Process the JSON response and display the search results:

Display up to 60 results.

Implement pagination (you choose how many results per page).

Use a dropdown menu or radio buttons to select page numbers.

For each book in the results:

Display the book title

Display a small cover image

Make the book title clickable, linking to the Book Details page

Step 4: Build the Book Details Page
Create a webpage that displays detailed information for a single book.

Pass the book ID to this page using:

URL parameters, or

Another clearly documented method

Use the book ID to dynamically construct the Google Books API request URL.

Retrieve and at minimum show:

Title

Authors

Publisher

Description

Cover image(s)

Price (if available)

Organize the content using a clean, readable, and professional layout.

Step 5: Build the My Bookshelf Page
Log in to your Google Books account at: https://books.google.com

Create a public bookshelf and manually add several books.

From your public bookshelf, copy the Volume IDs of the books you added (the value after id= in the book URL).
Use the Google Books API (Volumes endpoint) and the Volume IDs of books from your public bookshelf to dynamically retrieve each book’s data.

Display the bookshelf books in a layout similar to your search results.

Ensure each book links to the Book Details page.

Step 6: Final Checks
Verify that:

All images display correctly

All links work as expected

All API calls return valid results

Ensure your code is clean, organized, and readable.

Test your entire application from the live public website, not just locally.

Additional Requirements
Create a separate folder and styling for Milestone #2

This milestone should function as a standalone web application

Images and URLs must display and function correctly

Code should be clean, organized, and readable

Submission Instructions
Submit the following 02 items to D2L:

1. Source Code Archive
Compress all source code files into a single .zip file

Folder Naming Convention: FirstnameLastname_CourseNumber_Milestone#
2. Project Report (PDF)
Your PDF report must include:

The URL to your website on the project title page
A brief report overview (discuss what you have built, what technology and data you worked with, and how your work meets the milestone goals, no tech essay, no code dump)
Screenshots of each webpage:

Capture the top portion of the page if it is very long

Screenshots must be meaningfully labelled, visible, and not cropped or edited

Include brief explanations for each screenshot

File Naming Convention: FirstnameLastname_CourseNumber_Milestone#
The PDF report should be approximately 4-6 pages in length (including screenshots). The title page and reference page are not included in this page count.
Grading Guide
Your grade will be based on:

How well you satisfy the stated requirements and demonstrate creativity

Website and page design quality

Well-formed, clean, and readable code

Do not use code generators or unedited copied code

Adherence to submission requirements

Rubric
Table 1. Grading Rubric describing performance levels and expectations for Milestone 2
Score Range	Rating	Description
10	Outstanding	Correctly retrieves and displays data from all required Google Books API endpoints. Fully satisfies all requirements. Excellent, clean, and professional website design. Files and code are very well organized, readable, and clean. Live website works correctly.
8–9	Good	Correctly retrieves and displays most API data with minor mistakes or missing elements. Mostly satisfies requirements with small issues. Good website/page design that is neat and organized. Code is well organized and readable. Live website works.
6–7	Adequate	Retrieves and displays API data with noticeable mistakes or missing items. Missing one or two major requirements. Very simple web page design with missing or incorrectly displayed images or links. Code organization issues. Some required submission items may be missing.
Below 6	Lack of Effort	Fails to retrieve or display API data correctly. Poor or unorganized webpage design. Poor coding practices. Live website does not work. Submission requirements are not followed or are missing.
Please note that expectations increase from this milestone onward. Later milestones place greater emphasis on dynamic data retrieval, user interaction, and application-level design.
