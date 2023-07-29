const bookContainer = document.querySelector(".books");
const titleHeader = document.querySelector('.titleTitle').addEventListener('click', () => {
    newList = {}
    newList = bookList.toggleParameters.filterAlphabetically();
    console.log(newList)
});

const bookSearchContainer = document.querySelector('.bookSearch');
const loader = document.createElement(`div`);
loader.classList.add('loader');

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


//Fetching from Books API
const fetchBooksAPI = (text) => {
    return fetch(`https://openlibrary.org/search.json?q=${text}`)
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
            for (i=0; i<5; i++) {
                searchedList.push(booksSearched.docs[i])
            }
        }
        styleSearchBox();
        removeLoader(searchBox)
        
        addToObject(searchedBooks, searchedList) //send full searched list to function
        appendToSearchBox(addValuesToElements(searchedBooks, `cover_i`, `title`, `author_name`));
    })
};

//adding book data to object of books
const addToObject = (object, bookSelected) => {
    if (object === searchedBooks) object.books = {};
    if (Array.isArray(bookSelected)) {
        for (const book of bookSelected) {
            const bookKeysToArray = []; // Create a new array for each book key value pair
            bookKeysToArray.push(toArray("cover_i", book.cover_i, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("title", book.title, bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("author_name", book[`author_name`], bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("first_publish_year", book.first_publish_year, bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("number_of_pages_median", book.number_of_pages_median, bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("ratings_average", book.ratings_average, bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("ratings_count", book.ratings_count, bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("subject", book.subject, bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("id_amazon", `${book.id_amazon}`, bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("id_goodreads", book.id_goodreads, bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("wikid_wikidataiID", book.id_wikidata, bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("seed", book.seed, bookKeysToArray, i)) // creates both key and value and pushed into array
            bookKeysToArray.push(toArray("key", book.key, bookKeysToArray, i)) // creates both key and value and pushed into array
            object.books[book.key] = Object.fromEntries(bookKeysToArray);
        }
    } else alert(`Could not add, invalid selection`)
};

const toArray = (a, b, array, i) => {
    array = []
    array.push(a);
    array.push(b);
    return array
}


const addValuesToElements = (object, ...keys) => {
    console.log(object)
    console.log(keys)
    tempBookItem = document.createElement('div');  
    tempBooks = Object.keys(object.books);
    let combinedTempElements = [];
    let allElements = [];
    tempBooks.forEach((id) => {
        if (id){
            tempBook = Object.keys(object.books[id]);
            combinedTempElements = []; //resetting so each iteration is fresh to append to allElements
            tempBook.forEach((key) => {
                for (i = 0 ; i < keys.length; i++) { //iterate through ...keys to match the key in each book entry
                    console.log(keys[i])
                    if (keys[i] === key) {
                    tempSelection = object.books[id][key] //tempSelection points to book object
                    if (Array.isArray(tempSelection)) tempSelection = tempSelection.join()
                    if (key === `cover_i`) {
                        tempElement = document.createElement('img');
                        tempElement.src = `https://covers.openlibrary.org/b/id/${tempSelection}-M.jpg`;
                        tempElement.setAttribute(`id`, `${id}`);
                        tempElement.classList.add(`${key}`);
                    } else if (key[0] === `i` && key[1] === 'd') {
                        tempElement = document.createElement('a');
                        tempElement.href = `https://www.amazon.com/dp/${tempSelection}`;
                        tempElement.target = `#`;
                        tempElement.setAttribute(`id`, `${id}`);
                        tempElement.classList.add(`${key}`);
                    } else if (key === `ratings_average`) {
                        tempSelection = reduceDecimal(tempSelection);
                        console.log(tempSelection);
                        tempElement = document.createElement('p');
                        tempElement.setAttribute(`id`, `${id}`);
                        tempElement.textContent = `${tempSelection}`;
                        tempElement.classList.add(`${key}`);
                    } 
                    else {
                        tempElement = document.createElement('p');
                        tempElement.setAttribute(`id`, `${id}`);
                        tempElement.textContent = `${tempSelection}`;
                        tempElement.classList.add(`${key}`);
                    }
                    console.log(tempElement)
                    combinedTempElements.push(tempElement) //add all elements for this iteration
                }
            }
        })};
        allElements.push(combinedTempElements) //Array with book elements seperated by each book
    }) 
    return allElements
}

//iterate through allElements (an array) and append them to page
const addToPage = (...object) => {
    removeAllClass(`bookInfo`)
    bookNumber = 0;
    objectCount = Object.keys(object[0].books)
    objectCount = objectCount.length
    for (i = 0; i < objectCount; i++) { //iterate through each book object
        allElements = addValuesToElements(object[i], `cover_i`, `title`, `author_name`, `ratings_average`, `subject`)
        for (const elem of allElements) {
            bookListNumber = document.createElement(`p`)
            bookListNumber.textContent = `${(bookNumber + 1)}`;
            tempBookItem = document.createElement(`div`)
            tempBookItem.classList.add('bookInfo');
            tempBookItem.appendChild(bookListNumber)
            for (const el of elem) {
                console.log(el)
                tempBookItem.appendChild(el)
                tempBookItem.appendChild(el)
            }
            bookContainer.appendChild(tempBookItem);
            toggleClasses(tempBookItem, `toggleHeightSmall`, `toggleHeightNormal`)
            bookNumber++
        }
    }
}

let coverDiv;
let titleAndAuthorDiv
const appendToSearchBox = (...elements) => {
    tempBookItem.classList.add(`searchedBookInfo`);
    for (i = 0; i < elements[0].length; i++) {
        tempBookItem = document.createElement('div');
        tempBookItem.classList.add('searchedBookInfo')
        tempElement = elements[0][i];
        tempID = tempElement[0].getAttribute('id') //identifier of the first element in the group which points to book object
        tempBookItem.setAttribute(`id`, `${tempID}`);
        titleAndAuthorDiv = document.createElement('div') //container for title and author outside of loop
        titleAndAuthorDiv.classList.add('titleAndAuthor')
        for (j = 0; j < tempElement.length; j++) { //each element appended to div container here
            if (tempElement[j].tagName === `IMG`) {
                // searchedTextContent = document.createElement('div');
                coverDiv = document.createElement('div')
                coverDiv.classList.add('coverContainer')
                coverDiv.appendChild(tempElement[j])
            }
            if (tempElement[j].tagName === `P`) {
                // searchedTextContent = document.createElement('div');
                titleAndAuthorDiv.appendChild(tempElement[j])
            }
            if (tempBookItem) tempBookItem.appendChild(coverDiv);
            if (titleAndAuthorDiv) tempBookItem.appendChild(titleAndAuthorDiv);
        }
        addEventToAddToObject(tempBookItem);
        searchBox.appendChild(tempBookItem); //div container of all searched elements appended to search box
    }
}

const bookList = {};
bookList.books = [];

bookList.toggleParameters = {
    title: {
        alphabeticalOrder: {
            ascending: false}},
    author: {
        alphabeticalOrder: {
            ascending: false},
        },
        filterAlphabetically() {
                return bookList.books.sort((a,b) => a['cover_i'] - b['cover_i'])
        },
}

        
        // addToObject(bookList, tempBook) //NOT WORKING.. SOME KEYS ARE UNDEFINED
        // addToPage(bookList)


const addEventToAddToObject = (...element) => {
    element[0].addEventListener('click', (e) => {
        tempBook = pullBookFromObject(searchedBooks, e.target.id);
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
    console.log(`removing ${clss}`)
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

const pullBookFromObject = (object, id) => {
    if (object.books[id]) {
        selectedBookArray = []
        selectedBookArray.push(object.books[id])
        return selectedBookArray;
    } else return "No Book Found"
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

const replaceUndefined = (...texts) => {
    for (const text of texts) {
        if (!text) text = `~`;
        return text
    }
}
//true makes it add pulled books to webpage
// pullBooks(true);










///////////////////////////////////////////////////
// Document Selectors Above
/////////////////////////////////////////////////

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

// let bookList = [];
// //Pulls from JSON
// const pullBooks = (toAdd) => {
//     getJsonData().then((bookList) => {
//         //toggling for alphabetical filter
//         if (toggleParameters.title.alphabeticalOrder.clicked) {
//             bookList = filterAlphabetically(bookList, title);
//         } else if (toggleParameters.author.alphabeticalOrder.clicked) {
//             bookList = filterAlphabetically(bookList, author);
//         }
//         //For adding and refreshing entire book list
//         for (i=0; i < bookList.length; i++) {
//             number = i + 1;
//             title = bookList[i]["Title"];
//             author = bookList[i]["Author "];
//             kindleUnlimited = bookList[i]["Kindle Unlimited"]; 
//             rating = bookList[i]["rating"]; 
//             link = bookList[i]["Link"];

//             //replaced undefined elements with "N/A"
//             title = replaceUndefined(title);
//             author = replaceUndefined(author);
//             kindleUnlimited = replaceUndefined(kindleUnlimited);
//             rating = replaceUndefined(rating);
//             link = replaceUndefined(link);

//             //toggle ading to page depending on condition
//             if (toAdd) addToPage();
//         }

//     }).catch((error) => {
//         console.error("Error in getJsonData:", error);
//     });
    
// }