const bookContainer = document.querySelector(".books");

const bookSearchContainer = document.querySelector('.bookSearch');
const loader = document.createElement(`div`);
loader.classList.add('loader');

const tempBookList = {}
document.addEventListener("DOMContentLoaded", function(){
    if (localStorage.books) {
        tempBookList.books = []
        tempBookList.books = JSON.parse(localStorage.getItem(`books`))
        addToObject(bookList, tempBookList.books)
        addToPage(bookList)
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

const checkSearchInput = () => {
    //do nothing if same value
    if (lastSearch === bookSearch.value) return;
    lastSearch = bookSearch.value;
    //remove searchBox if no value in search
    if (bookSearch.value.length === 0) {
        removeSearchBox();
        removeBooks('.searchedBookInfo');
        removeAllChildren(searchBox)
        searching = false;
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
                appendToSearchBox(addValuesToElements(book, `thumbnail`, `title`, `authors`, 'id'));
            }
    })
};

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
               
            object.books.push(bookObject);
        }
    } else {
        alert(`Could not add, invalid selection`);
    }
};

//adding book data to object of books
const addToObject = (object, bookSelected) => {
    if (object === searchedBooks) object.books = [];

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
                id: book.id
            };
            object.books.push(bookObject);
        }
    } else {
        alert(`Could not add, invalid selection`);
    }
    if (object === bookList) {addObjectToLocalStorage(object)}
};

const addObjectToLocalStorage = (object) => {
    localStorage.setItem(`books`, `${JSON.stringify(object.books)}`)
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


const addValuesToElements = (object, ...keys) => {
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
            
            allElements = addValuesToElements(obj.books[i], `thumbnail`, `title`, `authors`, `averageRating`, `subject`);
            bookListNumber = document.createElement(`p`);
            bookListNumber.textContent = `${(bookNumber + 1)}`;
            tempBookItem = document.createElement(`div`);
            tempBookItem.classList.add('bookInfo');
            tempBookItem.appendChild(bookListNumber);
            for (const el of allElements) {
                tempBookItem.appendChild(el);
            }
            bookContainer.appendChild(tempBookItem);
            toggleClasses(tempBookItem, `toggleHeightSmall`, `toggleHeightNormal`);
            bookNumber++;
            }
    }
    if (coverToggled) toggleLineHeight();

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

const bookList = {};
bookList.books = [];

bookList.toggleParameters = {
    title: {
        alphabeticalOrder: {ascending: false}},
    authors: {
        alphabeticalOrder: {ascending: false}},
    subject: {
        alphabeticalOrder: {ascending: false}},
    averageRating: {
        alphabeticalOrder: {ascending: false}},
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
    removeClassesAndAddToPage(element, object) {
        removeAllClass(element)
        addToPage(object);
    },
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

const ratingTitle = document.querySelector('.ratingFilter').addEventListener('click', () => {
    bookList.toggleParameters.filterNumerically('averageRating');
    bookList.toggleParameters.removeClassesAndAddToPage(`bookInfo`, bookList)
});


const addEventToAddToObject = (objectFrom, ...element) => {
    element[0].addEventListener('click', (e) => {
        tempBook = pullBookFromObject(objectFrom, e.target.id);
        addToObject(bookList, tempBook)
        addToPage(bookList)
    });
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
    element.classList.toggle(classA);
    setTimeout(() => {
        element.classList.toggle(classB);
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
            else if (bookLine.className.includes('bookListHeader') && coverToggled === true) coverTitle.classList.remove('removeCover');
        }
    }
}
const toggleLineHeightButton = document.querySelector(`.toggleLineHeight`).addEventListener(`click`, () => {
    if (!coverToggled) coverToggled = true;
    else coverToggled = false;
    toggleLineHeight()
})

const pullBookFromObject = (object, id) => {
    selectedBookArray = []
    for (const book of object.books) {
        if (book.id === id) {
            selectedBookArray.push(book)
            return selectedBookArray;
        } 
    }
    
}

const addLoader = (parent) => {
    parent.appendChild(loader)
}

const removeLoader = (parent) => {
    parent.removeChild(loader)
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

  let undefinedString = "N/A";
  const replaceUndefined = (...texts) => {
    for (const text of texts) {
        if (!text || text === `NaN`) return undefinedString
        else return text
    } 
}
//true makes it add pulled books to webpage
// pullBooks(true);


// Fetching JSON file
// const fetchJSON = () => {
//     return fetch("./reading-list-testing.json")
//         .then((res) => {
//             return res.json();
//         })
//         .then((data) => {
//             return data;
//         });
// }

// async function getJsonData() {
//     try {
//         const fetched = await fetchJSON();
//         const bookList = fetched["Books interested in Reading "];
//         return bookList; // Returning the specific data wanted
//     } catch (error) {
//         console.error("Error while fetching data:", error);
//         throw error;
//     }
// }


///////////////////////////////////////////////////
// JSON Fetch Above ^
/////////////////////////////////////////////////
