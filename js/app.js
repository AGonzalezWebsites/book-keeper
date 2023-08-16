const bookContainer = document.querySelector(".books");
const bookSearchContainer = document.querySelector('.bookSearch');
const deleteFilter = document.querySelector(`.deleteFilter`);
const favoriteFilter = document.querySelector(`.favoriteFilter`);
const editFilter = document.querySelector(`.editFilter`);
const loader = document.createElement(`div`);
loader.classList.add('loader');

document.addEventListener(`click`, (e) => {
    if (e.target.parentElement.className.includes('bookInfo') && e.target.tagName !== `I`) {
        addMoreDetails(bookList, e.target.id, e.target.parentElement)
    }
})

document.addEventListener("DOMContentLoaded", function(){
    if (localStorage.books) {
        const tempBookList = {};
        tempBookList.books = [];
        tempBookList.books = JSON.parse(localStorage.getItem(`books`));
        tempBookList.userSettings = JSON.parse(localStorage.getItem(`userSettings`));
        addToObject(bookList, tempBookList.books, tempBookList.userSettings);
        setColorScheme(bookList.userSettings.colorScheme)
        addToPage(bookList);
    }
    //prevents submitting both forms on enter key press
    addBookForm.onkeypress = function(e) { 
        var key = e.charCode || e.keyCode || 0;     
        if (key == 13) {
            e.preventDefault();
        }
    }
    editBookForm.onkeypress = function(e) {
        var key = e.charCode || e.keyCode || 0;     
        if (key == 13) {
            e.preventDefault();
        }
    }
});


let searchTimer;
let searchBox;
let searching = false;
const bookSearch = document.querySelector(`.bookSearchInput`);
bookSearch.addEventListener("keydown", () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout( () => {
        if (bookSearch.nextElementSibling) removeAllChildren(searchBox);
        checkSearchInput()
        removeBooks('.searchedBookInfo');//remove from previous search
        if (searchBox) addLoader(searchBox);
        if (searching) {
            addSearchBox();
            searchBooks();
        }
    }, 700)
});

const myBookSearch = document.querySelector(`.myBookSearchInput`);
myBookSearch.addEventListener("keydown", (e) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout( () => {
        myfilteredBooks = {};
        myfilteredBooks.books = []
        searchFilteredBooks = bookList.books.map(book => {
            titleMatch = toString(book.title).toLowerCase().includes(e.target.value.toLowerCase())
            authorMatch = toString(book.authors).toLowerCase().includes(e.target.value.toLowerCase())
            subjectMatch = toString(replaceUndefined(book.subject)).toLowerCase().includes(e.target.value.toLowerCase())
            if (authorMatch || titleMatch || subjectMatch) myfilteredBooks.books.push(book);
        })
        addToPage(myfilteredBooks)
        //make sure to delete existing bookList elements and add these results to page
        //when search is empty, need to delete myFilteredBooks and add bookList to page again
    }, 200)
});

const checkSearchInput = () => {
    //do nothing if same value
    if (lastSearch === bookSearch.value) return;
    lastSearch = bookSearch.value;
    //remove searchBox if no value in search
    if (bookSearch.value.length === 0) {
        stopSearching()
        return;
    } else if (bookSearch.value.length <= 2) removeAllChildren(searchBox); //do nothing search has less than 2 characters
    searching = true;
}

let lastSearch;
//Book search referencing api pull
const searchedBooks = {};
const searchBooks = () => {
    let searchedList = [];
    getApiData(bookSearch.value).then((booksSearched) => {
        if (searching) {
            for (let i=0; i<7; i++) {
                searchedList.push(booksSearched.items[i])
            }
            console.log(searchedList)
        }
        styleSearchBox();
        removeLoader(searchBox)
        addToObjectFromApi(searchedBooks, searchedList) //send full searched list to function
        for (const book of searchedBooks.books) {
                appendToSearchBox(addValuesToElement(book, `thumbnail`, `title`, `authors`, 'id'));
            }
    })
};

const stopSearching = () => {
    removeSearchBox();
    removeBooks('.searchedBookInfo');
    removeAllChildren(searchBox)
    searching = false;
    if (bookSearch.value) bookSearch.value = ""
    return;
}

//Fetching from Books API
const fetchBooksAPI = (text) => {
    return fetch(`https://www.googleapis.com/books/v1/volumes?q=${text}&key=AIzaSyCRN35xl_3LT3eyELbB0_NCyK9WYlFAfKY`)
    // return fetch(`https://openlibrary.org/search.json?q=${text}`)
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        return data;
    });
}

async function getApiData(text) {
    try {
        const fetched = await fetchBooksAPI(text);
        console.log(fetched)
        return fetched; // Returning the specific data wanted
    } catch (error) {
        console.error("Error while fetching data:", error);
        throw error;
    }
}

//adding book data to object of books
const addToObjectFromApi = (object, bookSelected) => {
    if (object === searchedBooks) object.books = [];

    if (Array.isArray(bookSelected)) {
        for (const book of bookSelected) {
            const bookObject = {};
            console.log(book)
            if (book.hasOwnProperty('volumeInfo')) {
                if(book.volumeInfo.hasOwnProperty(`imageLinks`)){
                    if (book.volumeInfo.imageLinks.hasOwnProperty(`thumbnail`)) bookObject.thumbnail = book.volumeInfo.imageLinks.thumbnail
                }
                if (book.volumeInfo.hasOwnProperty(`title`)) bookObject.title = book.volumeInfo.title;
                if (book.volumeInfo.hasOwnProperty(`authors`)) bookObject.authors = book.volumeInfo.authors;
                if (book.volumeInfo.hasOwnProperty(`averageRating`)) bookObject.averageRating = book.volumeInfo.averageRating;
                if (book.volumeInfo.hasOwnProperty(`categories`)) bookObject.subject = book.volumeInfo.categories;
                if (book.volumeInfo.hasOwnProperty(`publishedDate`)) bookObject.publishedDate = book.volumeInfo.publishedDate;
                if (book.volumeInfo.hasOwnProperty(`pageCount`)) bookObject.pageCount = book.volumeInfo.pageCount;
                if (book.volumeInfo.hasOwnProperty(`ratingsCount`)) bookObject.ratingsCount = book.volumeInfo.ratingsCount;
                if (book.volumeInfo.hasOwnProperty(`printType`)) bookObject.printType = book.volumeInfo.printType;
                if (book.volumeInfo.hasOwnProperty(`previewLink`)) bookObject.previewLink = book.volumeInfo.previewLink;
                if (book.volumeInfo.hasOwnProperty(`publisher`)) bookObject.publisher = book.volumeInfo.publisher;
                if (book.volumeInfo.hasOwnProperty(`description`)) bookObject.description = book.volumeInfo.description;
                if (book.volumeInfo.hasOwnProperty(`industryIdentifiers`)) bookObject.industryIdentifiers = book.volumeInfo.industryIdentifiers;
                if (book.volumeInfo.hasOwnProperty(`canonicalVolumeLink`)) bookObject.moreInfo = book.volumeInfo.canonicalVolumeLink;
            }
            if (book.hasOwnProperty('searchInfo')) {
                if (book.searchInfo.hasOwnProperty(`textSnippet`)) bookObject.textSnippet = book.searchInfo.textSnippet;
            }
            if (book.hasOwnProperty('accessInfo')) {
                if (book.accessInfo.hasOwnProperty(`accessViewStatus`)) bookObject.accessViewStatusEmbeddable = book.accessInfo.accessViewStatus;
                if (book.accessInfo.hasOwnProperty(`epub`)){
                    if (book.accessInfo.epub.hasOwnProperty(`isAvailable`)) bookObject.epubIsAvailable = book.accessInfo.epub.isAvailable;
                    if (book.accessInfo.epub.hasOwnProperty(`acsTokenLink`)) bookObject.ePubAcsTokenLink = book.accessInfo.epub.acsTokenLink;
                }
                if (book.accessInfo.hasOwnProperty(`pdf`)){
                    if (book.accessInfo.pdf.hasOwnProperty(`isAvailable`)) bookObject.pdfIsAvailable = book.accessInfo.pdf.isAvailable;
                    if (book.accessInfo.pdf.hasOwnProperty(`acsTokenLink`)) bookObject.pdfAcsTokenLink = book.accessInfo.pdf.acsTokenLink;
                }
            
            }
            bookObject.etag = book.etag;
            bookObject.id = book.id
            bookObject.favorite = false;
               
            object.books.push(bookObject);
        }
    } else {
        alert(`Could not add, invalid selection`);
    }
};

//adding book data to object of books
const addToObject = (object, bookSelected, userSettings) => {
    if (object === searchedBooks) object.books = [];
    
    if (object === bookList) object.userSettings = userSettings;

    if (Array.isArray(bookSelected)) {
        for (const book of bookSelected) {
            const bookObject = {
                thumbnail: book.thumbnail,
                title: book.title,
                authors: book.authors,
                publishedDate: book.publishedDate,
                pageCount: book.pageCount,
                averageRating: book.averageRating,
                ratingsCount: book.ratingsCount,
                subject: book.subject,
                printType: book.printType,
                previewLink: book.previewLink,
                publisher: book.publisher,
                description: book.description,
                textSnippet: book.textSnippet,
                industryIdentifiers: book.industryIdentifiers,
                accessViewStatus: book.accessViewStatus,
                accessViewStatusEmbeddable: book.accessViewStatusEmbeddable,
                epubIsAvailable: book.epubIsAvailable,
                ePubAcsTokenLink: book.ePubAcsTokenLink,
                pdfIsAvailable: book.pdfIsAvailable,
                pdfAcsTokenLink: book.pdfAcsTokenLink,
                etag: book.etag,
                id: book.id,
                moreInfo: book.moreInfo,
                favorite: book.favorite,
            };
            object.books.push(bookObject);
        }
    } else {
        alert(`Could not add, invalid selection`);
    }
    if (object === bookList) {addObjectToLocalStorage(object)}
};

const addObjectToLocalStorage = (object) => {
    if (localStorage) {
        localStorage.removeItem(`books`);
    }
    if (object.books) localStorage.setItem(`books`, `${JSON.stringify(object.books)}`)
    if (object.userSettings) localStorage.setItem(`userSettings`, `${JSON.stringify(object.userSettings)}`)
}

const bookList = {};
bookList.books = [];
bookList.userSettings = {
    colorScheme: `hazlenut`
}
bookList.toggleParameters = {
    title: {
        alphabeticalOrder: {ascending: false}},
    authors: {
        alphabeticalOrder: {ascending: false}},
    subject: {
        alphabeticalOrder: {ascending: false}},
    averageRating: {
        alphabeticalOrder: {ascending: false}},
    favorites: false,
    filterAlphabetically(key) {
        if (!bookList.toggleParameters[key].ascending) {
            bookList.toggleParameters[key].ascending = true;
            bookList.books.sort((a,b) => {
                fa = a[key]
                fb = b[key]
                if (fa < fb) return -1;
                if (fa > fb) return 1;
                else return 0;
            })
        } else if (bookList.toggleParameters[key].ascending) {
            bookList.toggleParameters[key].ascending = false;
            bookList.books.sort((a,b) => {
                fa = a[key]
                fb = b[key]
                if (fa > fb) return -1;
                if (fa < fb) return 1;
                else return 0;
            })
        } else alert('Error: Unable to filter')
    },
    filterNumerically(key) {
        if (!bookList.toggleParameters[key].ascending) {
        bookList.toggleParameters[key].ascending = true;
        return bookList.books.sort((a,b) => a[key] - b[key])
        } else if (bookList.toggleParameters[key].ascending) {
        bookList.toggleParameters[key].ascending = false;
        return bookList.books.sort((a,b) => a[key] - b[key]) //toggles in the same way order for now. Will switch is utilized
        } else alert('Error: Unable to filter')
    }, 
    toggleFilterByFavorite() {
        if (!bookList.toggleParameters.favorites) {
            favoriteBooks = {};
            favoriteBooks.books = bookList.books.filter(element => (element.favorite));
            addToPage(favoriteBooks);
            bookList.toggleParameters.favorites = true;
        } else if (bookList.toggleParameters.favorites) {
            addToPage(bookList);
            bookList.toggleParameters.favorites = false;
        }
    },
    removeClassesAndAddToPage(element, object) {
        removeAllClass(element)
        addToPage(object);
    }
}

const downloadFile = (data, filename) => {
    const file = JSON.stringify(data)
    const link = document.createElement('a')
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(file))
    link.setAttribute('download', filename || 'data.json')
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const toArray = (a, b, array, i) => {
    array = []
    array.push(a);
    array.push(b);
    return array
}

const toString = (x) => {
    if (Array.isArray(x)) {
        return x.toString()
    } else return x
}


const addValuesToElement = (object, ...keys) => {
    tempBookItem = document.createElement('div');  
    tempBooks = Object.keys(object);
    let combinedTempElements = [];
    let tempElement = [];
            tempBook = Object.keys(object);
            combinedTempElements = []; //resetting so each iteration is fresh to append to allElements
            tempBook.forEach((key) => {
                for (let i = 0 ; i < keys.length; i++) { //iterate through ...keys to match the key in each book entry
                    if (keys[i] === key) {
                        tempSelection = object[key] //tempSelection points to book object value
                        if (Array.isArray(tempSelection)) tempSelection = tempSelection.join() //*averageRating might not be passing here
                        if (key === `thumbnail`) {
                            tempElement = document.createElement('img');
                            tempElement.src = tempSelection;
                            tempElement.setAttribute(`id`, `${object.id}`);
                            tempElement.classList.add(`${key}`);
                        } else if (key[0] === `i` && key[1] === 'd') {
                            tempElement = document.createElement('a');
                            tempElement.href = `https://www.amazon.com/dp/${tempSelection}`;
                            tempElement.target = `#`;
                            tempElement.setAttribute(`id`, `${object.id}`);
                            tempElement.classList.add(`${key}`);
                        } else if (key === `averageRating`) {
                            tempSelection = reduceDecimal(tempSelection);
                            tempSelection = replaceUndefined(tempSelection)
                            tempElement = document.createElement('p');
                            tempElement.setAttribute(`id`, `${object.id}`);
                            tempElement.textContent = `${tempSelection}`;
                            tempElement.classList.add(`${key}`);
                        } 
                        else {
                            tempElement = document.createElement('p');
                            tempElement.setAttribute(`id`, `${object.id}`);
                            tempElement.textContent = `${replaceUndefined(tempSelection)}`;
                            tempElement.classList.add(`${key}`);
                        }
                        combinedTempElements.push(tempElement) //add all elements for this iteration
                        return combinedTempElements
                    }
                }
            });
    return combinedTempElements
}

//iterate through allElements (an array) and append them to page
const addToPage = (...object) => { //using ...objects to potentially combine objects and append to page
    removeAllClass(`bookInfo`);
    bookNumber = 0;
    for (const obj of object) {
        objectCount = Object.keys(obj.books);
        objectCount = objectCount.length;
        for (let i = 0; i < objectCount; i++) { //iterate through each book object
            
            allElements = addValuesToElement(obj.books[i], `thumbnail`, `title`, `authors`, `averageRating`, `subject`);
            bookListNumber = document.createElement(`p`); //bookListNumber is for the visual number on the list. No additional value.
            bookListNumber.textContent = `${(bookNumber + 1)}`;
            firstLineDiv = document.createElement(`div`);
            tempBookItem = document.createElement(`div`); //the container div for the link item
            tempBookItem.classList.add('bookInfo');
            firstLineDiv.setAttribute('id', `${obj.books[i].id}`);
            tempBookItem.setAttribute('id', `${obj.books[i].id}`);
            firstLineDiv.appendChild(bookListNumber);
            for (const el of allElements) {
                firstLineDiv.appendChild(el);
            }
            tempBookItem.appendChild(firstLineDiv);
            bookContainer.appendChild(tempBookItem);
            toggleClasses(tempBookItem, `toggleHeightSmall`, `toggleHeightNormal`);
            bookNumber++;
            }
    }
    if (coverToggled) toggleLineHeight();

}

const removeElement = (element) => {
    element.parentNode.removeChild(element)
}

let coverDiv;
let titleAndAuthorDiv
const appendToSearchBox = (...elements) => {
    tempBookItem.classList.add(`searchedBookInfo`);
    tempBookItem = document.createElement('div');
    tempBookItem.classList.add('searchedBookInfo')
    titleAndAuthorDiv = document.createElement('div') //container for title and author outside of loop
    titleAndAuthorDiv.classList.add('titleAndAuthor')
    for (let i = 0; i < elements[0].length; i++) { //each element appended to div container here
        if (elements[0][i].tagName === `IMG`) {
            // searchedTextContent = document.createElement('div');
            coverDiv = document.createElement('div')
            coverDiv.classList.add('coverContainer')
            coverDiv.appendChild(elements[0][i])
        }
        if (elements[0][i].tagName === `P`) {
            // searchedTextContent = document.createElement('div');
            titleAndAuthorDiv.appendChild(elements[0][i])
        }
        if (elements[0][i].tagName === 'A') {
            tempBookItem.setAttribute(`id`, `${elements[0][i].id}`);

        }
    }
    if (tempBookItem) tempBookItem.appendChild(coverDiv);
    if (titleAndAuthorDiv) tempBookItem.appendChild(titleAndAuthorDiv);
    addEventToAddToObject(searchedBooks, tempBookItem);
    searchBox.appendChild(tempBookItem); //div container of all searched elements appended to search box
}

let moreDetailsExpanded = false
const addMoreDetails = (object, id, existingElement) => {
    newElements = []
    if (moreDetailsExpanded === true && lastElement === existingElement) {
        moreDetailsExpanded = false
        lastElement.classList.remove(`selectedBook`)
        lastElement.removeChild(moreDetailsContainer);
        return
    } else if (moreDetailsExpanded === true && lastElement !== existingElement) {
        lastElement.classList.remove(`selectedBook`)
        lastElement.removeChild(moreDetailsContainer);
    }
    for (const book of object.books) {
        if (book.id === id ) {
            moreDetailsContainer = document.createElement(`div`);
            moreDetailsContainer.classList.add(`moreDetails`);

            moreDetailsFirstItems = document.createElement(`div`);
            moreDetailsFirstItems.classList.add(`additionInfo`);
            
            if (book.publishedDate) {
                publishedDate = document.createElement(`div`);
                publishedDateTextHeader = document.createElement(`h2`);
                publishedDateTextHeader.innerText = (`Released`);
                publishedDateText = document.createElement(`p`);
                publishedDateText.innerText = (book.publishedDate);
                publishedDate.appendChild(publishedDateTextHeader);
                publishedDate.appendChild(publishedDateText);
                moreDetailsFirstItems.appendChild(publishedDate);
            }
            
            if (book.publisher) {
                publisher = document.createElement(`div`);
                publisherTextHeader = document.createElement(`h2`);
                publisherTextHeader.innerText = (`Publisher`);
                publisherText = document.createElement(`p`);
                publisherText.innerText = (book.publisher);
                publisher.appendChild(publisherTextHeader);
                publisher.appendChild(publisherText);
                moreDetailsFirstItems.appendChild(publisher);
            }
            
            
            if (book.pageCount) {
                pageCount = document.createElement(`div`);
                pageCountTextHeader = document.createElement(`h2`);
                pageCountTextHeader.innerText = (`Page Count`);
                pageCountText = document.createElement(`p`);
                pageCountText.innerText = (book.pageCount);
                pageCount.appendChild(pageCountTextHeader);
                pageCount.appendChild(pageCountText);
                moreDetailsFirstItems.appendChild(pageCount);
            }
            
            if (!book.favorite) book.favorite = false;

            favorite = document.createElement(`div`);
            favoriteHeader = document.createElement(`h2`);
            favoriteHeader.classList.add(`favoriteHeader`)
            favoriteHeader.innerText = `Favorite?`;
            icon = document.createElement(`i`);
            icon.classList.add(`fa-solid`)
            icon.classList.add(`fa-star`)
            icon.setAttribute('id', `${book.id}`); 
            addEventToAddToFavorite(icon)
            if (book.favorite) icon.classList.add(`favorite`)
            favorite.appendChild(favoriteHeader)
            favorite.appendChild(icon)
            moreDetailsFirstItems.appendChild(favorite);

            previewButton = document.createElement(`button`);
            if (book.accessViewStatusEmbeddable && book.accessViewStatusEmbeddable === `SAMPLE`) {
                previewLink = document.createElement(`a`);
                previewLink.href = book.previewLink;
                previewLink.target = `#`;
                previewLink.innerText = `Preview`;
                previewButton.appendChild(previewLink)
            } else previewButton.innerText = `Preview Unavailable`;
            moreDetailsFirstItems.appendChild(previewButton);
            
            descriptionTitle = document.createElement(`p`);
            descriptionTitle.classList.add(`descriptionTitle`)
            descriptionTitle.innerText = `Description`;
            description = document.createElement(`p`);
            description.innerText = `${book.description}`;
            
            moreDetailsContainer.appendChild(descriptionTitle)
            moreDetailsContainer.appendChild(description)
            moreDetailsContainer.appendChild(moreDetailsFirstItems);
            existingElement.appendChild(moreDetailsContainer)
            existingElement.classList.add(`selectedBook`)
            moreDetailsContainer.classList.add(`toggleHeightSmall`)
            setTimeout(() =>{
                moreDetailsContainer.classList.remove(`toggleHeightSmall`);
                moreDetailsContainer.classList.add(`toggleHeightNormal`);
                moreDetailsContainer.classList.remove(`toggleHeightNormal`);

            }, 10)
        }
    }
    lastElement = existingElement; //used to reference element to be closed even if new element is clicked
    moreDetailsExpanded = true;
}

const titleTitle = document.querySelector('.titleTitle').addEventListener('click', () => {
    bookList.toggleParameters.filterAlphabetically('title');
    bookList.toggleParameters.removeClassesAndAddToPage(`bookInfo`, bookList)
});

const authorTitle = document.querySelector('.authorTitle').addEventListener('click', () => {
    bookList.toggleParameters.filterAlphabetically('authors');
    bookList.toggleParameters.removeClassesAndAddToPage(`bookInfo`, bookList)
});

const subjectTitle = document.querySelector('.subjectTitle').addEventListener('click', () => {
    bookList.toggleParameters.filterAlphabetically('subject');
    bookList.toggleParameters.removeClassesAndAddToPage(`bookInfo`, bookList)

});


const addEventToAddToObject = (objectFrom, ...element) => { //For added elements to be given the listener to be added to the bookList object on click and close searchbox
    element[0].addEventListener('click', (e) => {
        selectedBook = pullBookFromObject(objectFrom, e.target.id);
        result = checkForDublicates(bookList, selectedBook)
        if (result) {
            alert(`${selectedBook[0].title} by ${selectedBook[0].authors} is already in your collection`)
            return
        }
        addToObject(bookList, selectedBook)
        addToPage(bookList)
        stopSearching()
    });
}

const addEventToAddToFavorite = (icon) => {
    icon.addEventListener(`click`, (e) => {
        for (const book of bookList.books)
            if (book.id === e.target.id) {
                if (!book.favorite) {
                    book.favorite = true;
                    icon.classList.add(`favorite`);
                } else if (book.favorite) {
                    book.favorite = false;
                    icon.classList.remove(`favorite`);
                }
                addObjectToLocalStorage(bookList)
            }
    })
}

submitAddBookForm = () => {
    let addBookForm = document.querySelector('#addBookForm');
    let tempFormBook = {}
    tempFormBook.books = []
    let bookItem = {}
    for (let i = 0; i < addBookForm.elements.length; i++) {
        bookItem[addBookForm.elements[i].name] = addBookForm.elements[i].value;
    }
    bookItem.id = giveBookNewID();
    tempFormBook.books.push(bookItem);
    tempFormBook.books[0].favorite = false;
    addToObject(bookList, tempFormBook.books)
    addToPage(bookList)
}

const closeAddBookForm = () => {
    addBookContainer.classList.add(`toggleHidden`);
}

const addBookContainer = document.querySelector(`.addBookContainer`);
const addBookButton = document.querySelector(`.addBookButton`);
let addBookButtonToggled = false;
addBookButton.addEventListener(`click`, () => {
    if (!addBookButtonToggled) {
        addBookContainer.classList.remove(`toggleHidden`);
        addBookButtonToggled = true;
        return
    }
    if (addBookButtonToggled) {
        addBookContainer.classList.add(`.toggleHidden`)
        addBookButtonToggled = false;
        return
    }
})

let favoriteIconToggled = false;
const toggleFavoriteButton = (e) => {

    if (!favoriteIconToggled) {
        addHighlightButton(e.target);
        bookList.toggleParameters.toggleFilterByFavorite()
        favoriteIconToggled = true;
    } else if (favoriteIconToggled) {
        removeHighlightButton(e.target);
        bookList.toggleParameters.toggleFilterByFavorite()
        favoriteIconToggled = false;
    }

}
favoriteFilter.addEventListener(`click`, toggleFavoriteButton)

let deleteIconToggled = false;
const toggleDeleteButton = (e) => {
    if (!deleteIconToggled) {
        addHighlightButton(e.target);
        for (i = 0; i < bookContainer.children.length; i++) {
            if (bookContainer.children[i].className.includes(`bookInfo`)) {
                deleteIcon = document.createElement(`i`) //icon for book deletion
                deleteIcon.setAttribute(`class`, `deleteIcon fa-regular fa-trash-can`);
                deleteIcon.setAttribute('id', `${bookContainer.children[i].id}`);
                bookContainer.children[i].appendChild(deleteIcon);
                deleteIcon.addEventListener(`click`, deleteBook);
            }
        }
        deleteIconToggled = true;
    } else if (deleteIconToggled) {
        removeHighlightButton(e.target);
        for (i = 0; i < bookContainer.children.length; i++) {
            if (bookContainer.children[i].className.includes(`bookInfo`)) {
                deleteIcon = document.querySelector(`.deleteIcon`)
                if (bookContainer.children[i].deleteIcon) bookContainer.children[i].removeChild(deleteIcon);
            }
        }
        deleteIconToggled = false;
        addToPage(bookList)
    }
}
deleteFilter.addEventListener(`click`, toggleDeleteButton);

const deleteBook = (e) => {
    bookList.books = bookList.books.filter(book => book.id !== e.target.id)
    toggleClasses(e.target.parentNode, `toggleSlideIn`, `toggleSlideOut`);
    setTimeout(() => {
        removeElement(e.target.parentNode)
        addObjectToLocalStorage(bookList)
    }, 500)
}


let editIconToggled = false;
const toggleEditButton = (e) => {
    if (!editIconToggled) {
        addHighlightButton(e.target);
        for (i = 0; i < bookContainer.children.length; i++) {
            if (bookContainer.children[i].className.includes(`bookInfo`)) {
                editIcon = document.createElement(`i`) //icon for book deletion
                editIcon.setAttribute(`class`, `editIcon fa-regular fa-pen-to-square`);
                editIcon.setAttribute('id', `${bookContainer.children[i].id}`);
                bookContainer.children[i].appendChild(editIcon);
                editIcon.addEventListener(`click`, openEditBookForm);
            }
        }
        editIconToggled = true;
    } else if (editIconToggled) {
        if (e.target) removeHighlightButton(e.target);
        else removeHighlightButton(e);
        for (i = 0; i < bookContainer.children.length; i++) {
            if (bookContainer.children[i].className.includes(`bookInfo`)) {
                editIcon = document.querySelector(`.editIcon`)
                if (editIcon) bookContainer.children[i].removeChild(editIcon);
            }
        }
        editIconToggled = false;
    }
}
editFilter.addEventListener(`click`, toggleEditButton);


const editBookContainer = document.querySelector(`.editBookContainer`);
let bookToEdit;
let editBookButtonToggled = false;
const openEditBookForm = (e) => {
    if (e.target) bookToEdit = bookList.books.filter(book => book.id === e.target.id) //if from event listener
    let editBookForm = document.querySelector('#editBookForm');
    if (!editBookButtonToggled) {
        addValuesToForm(bookToEdit, editBookForm)
        editBookContainer.classList.remove(`toggleHidden`);
        editBookButtonToggled = true;
    } else if (editBookButtonToggled) {
        editBookContainer.classList.add(`toggleHidden`)
        editBookButtonToggled = false;
        return
    }
}

const addValuesToForm = (book, form) => {
    for (let i = 0; i < form.elements.length; i++) {
        form.elements[i].value = replaceUndefined(book[0][form.elements[i].name]);
    }
}

submitEditBookForm = (book, form) => {
    for (let i = 0; i < form.elements.length; i++) {
        book[0][form.elements[i].name] = form.elements[i].value;
    }

    for(const toReplace of bookList.books) {
        if(toReplace.id === book[0].id) {
            for (let i = 0; i < form.elements.length; i++) {
                toReplace[form.elements[i].name] = form.elements[i].value;
            }
        }
    }
    addObjectToLocalStorage(bookList);
    addToPage(bookList);
    toggleEditButton(editFilter)
    openEditBookForm(editBookContainer)
};

submitEditBookButton = document.querySelector(`.submitEditBookButton`);
submitEditBookButton.addEventListener(`click`, () => {
    submitEditBookForm(bookToEdit, editBookForm);
})

const cancelEditBookForm = () => {
    toggleEditButton(editFilter)
    openEditBookForm(editBookContainer);
}

cancelEditBookButton = document.querySelector(`.cancelEditBookButton`);
cancelEditBookButton.addEventListener(`click`, () => {
    cancelEditBookForm(editBookForm);
})

const checkForDublicates = (object, ...objectToAdd) => {
    for (const book of object.books) {
        if (book.id === objectToAdd[0][0].id) { //objectToAdd[0][0] need to iterate through this if checking multiple
            return true
        }
    }
    return false
}

const addHighlightButton = (element) => {
    element.classList.add(`highlightButton`);
}

const removeHighlightButton = (element) => {
    if (element) element.classList.remove(`highlightButton`);
}

const styleSearchBox = () => {
    searchBox.setAttribute('id', 'toggleSearchStyle'); 
}

const addSearchBox = () => {
    if (!searchBox) {
        searchBox = document.createElement('div');
        searchBox.classList.add('searchResults');
        addLoader(searchBox);
        bookSearchContainer.appendChild(searchBox)
    } else {
        bookSearchContainer.appendChild(searchBox)
    }
}

const removeSearchBox = () => {
    searchBox.remove(searchBox);
}

const removeAllChildren = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

const removeAllClass = (clss) => {
    const boxes = document.querySelectorAll(`.${clss}`);
    boxes.forEach(box => {
      box.remove();
    });
}

const toggleClasses = (element, classA, classB) => {
    element.classList.add(classA);
    setTimeout(() => {
        element.classList.remove(classA);
        element.classList.add(classB);
        setTimeout(() => {
            element.classList.remove(classB);
        }, 500)
    }, 10);
}

const coverTitle = document.querySelector(`.coverTitle`);
let coverToggled = false;
const toggleLineHeight = () => {
    bookLines = bookContainer.childNodes
    for (const bookLine of bookLines) { 
        if (typeof(bookLine.className) === 'string') {
            if (bookLine.className.includes('bookInfo')) {
                bookLine.classList.toggle('removeCover');
            }
            if (bookLine.className.includes('bookListHeader') && coverToggled === true) coverTitle.classList.add('removeCover'); 
            else if (bookLine.className.includes('bookListHeader') && coverToggled === false) coverTitle.classList.remove('removeCover');
        }
    }
}
const toggleLineHeightButton = document.querySelector(`.toggleLineHeight`).addEventListener(`click`, () => {
    if (!coverToggled) coverToggled = true;
    else coverToggled = false;
    toggleLineHeight();
})

const pullBookFromObject = (object, id) => {
    selectedBookArray = []
    for (const book of object.books) {
        if (book.id === id) {
            selectedBookArray.push(book);
            return selectedBookArray;
        } 
    }
    
}

const grabBookByID = (object, bookID) => {
    for (const book of object.books) {
        if (book.id === bookID) return book;
        else return "Book not found";
    }
}

let customBookID = `custom`;
const giveBookNewID = () => {
    let idValue = Math.floor(Math.random() * 10);
    customBookID = `${customBookID}${idValue}`;
    for (const book of bookList.books) {
        if (book.id === customBookID) {
            return giveBookNewID();
        }
    }
    return customBookID;
}

const addLoader = (parent) => {
    parent.appendChild(loader);
}

const removeLoader = (parent) => {
    parent.removeChild(loader);
}

const removeBooks = (x) => {
    const nodes = document.querySelectorAll(`${x}`);
    nodes.forEach((node) => {
        node.parentElement.removeChild(node);
    });
}

const reduceDecimal = (x) => {
    return Number.parseFloat(x).toFixed(2);
  }

  const replaceUndefined = (...texts) => {
    for (const text of texts) {
        if (!text || text === `NaN`) return 'N/A'
        else return text
    } 
}

///////////////////////////////////////////////////
// uploading JSON below
/////////////////////////////////////////////////


const input = document.querySelector(`#file-selector`)
input.type = "file";
input.addEventListener("change", async event => {
    const json = JSON.parse(await input.files[0].text());

    console.log(json);
    addObjectToLocalStorage(json)
    bookList.books = [];
    addToObject(bookList, json.books, json.userSettings);
    location.reload();
    addToPage(bookList);
});