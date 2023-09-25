# book-keeper

- At it's core, this website is a book list with an api search feature to import selected books into your personalized list, however, there are a many features that enable you to maintain, personalize and organize your list.

## Table of Contents

- [Searching](#searching)
- [Focus View](#focus-view)
- [Additional Details](#additional-details)
- [Filters](#filters)
- [Tags](#tags)
- [Favorites](#favorites)
- [Spotlight](#spotlight)
- [Add Custom Book](#add-custom-book)
- [Edit and Delete](#edit-and-delete)
- [Local Storage](#local-storage)
- [Download and Import](#download-and-import)


## Searching

- You can search for your book using the input box on the top right of the website. When viewing the results, you can use the "Add" button to quickly add the book to your book list. You can also click on the any other part of the book's result to display a preview box for that book. From the preview screen, you can cycle through all the books from your search results.

## Focus View

- The focus view screen shows even more information about the book. This is a good tool to determine if you are looking at the correct book or not. You can also read the `synopsis` from here, toggle `tags` you'd like to add to the book, and also visit the amazon store page for the book.

## Additional Details

- Each book you add will be displayed as a line item on your book list. If you click on a book, it will expand and show additional details for the specific book. This includes a `synopsis`, `publish date`, `Publisher`, `Page count` and a button with a `sample` of the book if available.

## Filters

- There are several ways to sort/filter your book list. You can click on `title`, `author` or `subject` to filter alphabetically, click a specific tag to filter books with that tag applied, and click on the favorites button to filter by favorites.

## Tags

- You start off with 3 tags: `#read`, `#reading`, `#readnext`. Tags can be deleted and new tags can be added, with your own specified name and color. From `Focus View` and `Additional Details`, you can apply and remove tags for each book. There is a color representation on each book in your book list to show which tags have been applied. Also, as mentioned before, you can filter your booklist by each tag.

## Favorites

- Similar to tags, from `Additional Details`, you can add and remove each book from your favorites list by clicking the star icon. You can also filter books by favorite.

## Spotlight

- There is a thin bar/panel under the navigation bar with a down arrow. Clicking this will expand the spotlight section, which shows all the covers of your books. You can use the left and right arrows to scroll through the book. This feature is intended to
work hand in hand with your book list. So, every time you filter or sort your book list, the spotlight section will update as well. Also, if you click on one of your books from either section, it will automatically scroll into view in the other section.

## Add Custom Book

- If you are unable to find the book you were searching for, you can use this form to input all the details of the book, including an image url for the covor. After submitting the form, this book will be added to your booklist.

## Edit and Delete

- Accessed from the navbar, there is an Edit button that contains the buttons `edit book` and `delete book` within. Clicking either will display their specific icons to the right of each book. `edit book` will pull up a form and import all the books information into that form. From here, you can edit the info to your liking, then save to update the book on your list. If you click on the `delete` icon, you will remove the specific book from your book list.

## Local Storage

- Any action or change to your book list is stored in the local storage, so unless cookies are cleared, the booklist and personalized settings, such as your color scheme, will remain.

## Downlaod and Import

- As a back-up to local storage, you can download your book list as a custom json file. This will a text fill with a .books extention. You can then, from any device, upload the same file to restore your booklist and personal settings.

