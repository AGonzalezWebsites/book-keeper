const bookContainer = document.querySelector(".books");
const titleHeader = document.querySelector('.titleTitle').addEventListener('click', () => toggleParameters.alphabeticalOrderCheck());
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
        if (bookSearch.searchBox) bookSearch.removeAllChildren(searchBox);
        checkSearchInput()
        removeBooks('.searchedBookInfo');//remove from previous search
        if (searchBox) addLoader(searchBox);
        if (searching) {
            addSearchBox();
            searchBooks();
        }
    }, 700)
});





///////////////////////////////////////////////////
// Document Selectors Above
/////////////////////////////////////////////////

// Fetching JSON file
const fetchJSON = () => {
    return fetch("./reading-list-testing.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            return data;
        });
}

async function getJsonData() {
    try {
        const fetched = await fetchJSON();
        const bookList = fetched["Books interested in Reading "];
        return bookList; // Returning the specific data wanted
    } catch (error) {
        console.error("Error while fetching data:", error);
        throw error;
    }
}


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
        console.log(fetched)
        return fetched; // Returning the specific data wanted
    } catch (error) {
        console.error("Error while fetching data:", error);
        throw error;
    }
}

///////////////////////////////////////////////////
// JSON Fetch Above ^
/////////////////////////////////////////////////

let bookList = [];
//Pulls from JSON
const pullBooks = (toAdd) => {
    getJsonData().then((bookList) => {
        //toggling for alphabetical filter
        if (toggleParameters.title.alphabeticalOrder.clicked) {
            bookList = filterAlphabetically(bookList, title);
        } else if (toggleParameters.author.alphabeticalOrder.clicked) {
            bookList = filterAlphabetically(bookList, author);
        }
        //For adding and refreshing entire book list
        for (i=0; i < bookList.length; i++) {
            number = i + 1;
            title = bookList[i]["Title"];
            author = bookList[i]["Author "];
            kindleUnlimited = bookList[i]["Kindle Unlimited"]; 
            rating = bookList[i]["rating"]; 
            link = bookList[i]["Link"];

            //replaced undefined elements with "N/A"
            title = replaceUndefined(title);
            author = replaceUndefined(author);
            kindleUnlimited = replaceUndefined(kindleUnlimited);
            rating = replaceUndefined(rating);
            link = replaceUndefined(link);

            //toggle ading to page depending on condition
            if (toAdd) addToPage();
        }

    }).catch((error) => {
        console.error("Error in getJsonData:", error);
    });
    
}

let lastSearch;
//Book search referencing api pull
const searchBooks = () => {
    let searchedList = [];
    getApiData(bookSearch.value).then((booksSearched) => {
        if (searching) {
            for (i=0; i<5; i++) {
                searchedList.push(booksSearched.docs[i])
                title = searchedList[i].title
                author = searchedList[i].author_name;
                kindleUnlimited = searchedList[i]["Kindle Unlimited"]; 
                rating = searchedList[i].ratings_average;
                cover = `https://covers.openlibrary.org/b/id/${searchedList[i].cover_i}-M.jpg`;
                console.log(cover)
                link = searchedList[i]["link"];
                //replaced undefined elements with "N/A"
                title = replaceUndefined(title);
                cover = replaceUndefined(cover);
                author = replaceUndefined(author);
                kindleUnlimited = replaceUndefined(kindleUnlimited);
                rating = replaceUndefined(rating);
                link = replaceUndefined(link);
                //finals step
                appendToSearchBox(addValuesToElements());
                addEventListeners(tempBookItem);
                styleSearchBox();
            }
            removeLoader(searchBox)
            console.log(searchedList)
        }
    })
};

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
const addValuesToElements = () => {
    tempBookItem = document.createElement('div');    
    numberElement = document.createElement(`p`)
    numberElement.classList.add('number');
    numberElement.textContent = `${number}`;
    
    
    titleElement = document.createElement('p');
    titleElement.classList.add('title');
    titleElement.textContent = `${title}`;
    
    authorElement = document.createElement('p');
    authorElement.classList.add('author');
    authorElement.textContent = `${author}`;
    
    kindleUnlimitedElement = document.createElement('p');
    kindleUnlimitedElement.classList.add('kindleUnlimited');
    kindleUnlimitedElement.textContent = `${kindleUnlimited}`;
    
    ratingElement = document.createElement('p');
    ratingElement.classList.add('rating');
    ratingElement.textContent = `${rating}`;
    
    linkElement = document.createElement('a');
    linkElement.classList.add('link');
    linkElement.innerHTML = `${link}`;
    linkElement.href=`${link}`;
    linkElement.title="book";

    if (searching) {
        coverElement = document.createElement('img');
        coverElement.src = cover;
        coverElement.classList.add('cover');

        titleElement.textContent = `Title: ${title}`
        authorElement.textContent = `Author: ${author}`
        console.log(coverElement)
    }
}

const appendToSearchBox = () => {
    tempBookItem.classList.add('searchedBookInfo');
    tempBookItem.appendChild(coverElement)
    searchedTextContent = document.createElement('div');
    searchedTextContent.appendChild(titleElement)
    searchedTextContent.appendChild(authorElement)
    tempBookItem.appendChild(searchedTextContent)
    searchBox.appendChild(tempBookItem);
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
    console.log(`remomove items`)
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

const addToPage = (x) => {
    addValuesToElements()
    tempBookItem.classList.add('bookInfo');
    tempBookItem.appendChild(numberElement)
    tempBookItem.appendChild(titleElement)
    tempBookItem.appendChild(authorElement)
    tempBookItem.appendChild(kindleUnlimitedElement)
    tempBookItem.appendChild(ratingElement)
    tempBookItem.appendChild(linkElement)
    bookContainer.appendChild(tempBookItem);
}

const addEventListeners = (element) => {
    element.addEventListener('click', (e) => {
        console.log(`clicked ${e.target.innerHTML}`);
    });
}

const addLoader = (parent) => {
    parent.appendChild(loader)
}

const removeLoader = (parent) => {
    parent.removeChild(loader)
}

const toggleParameters = {
    title: {
        alphabeticalOrder: {
            ascending: false
        }
    },
    author: {
        alphabeticalOrder: {
            ascending: false
        },
    },
    alphabeticalOrderCheck() {
        if (!this.title.alphabeticalOrder.clicked) {
        this.title.alphabeticalOrder.clicked = true;
        removeBooks('.bookInfo');
        pullBooks(true);
    }
    },

}


const filterAlphabetically = (arr) => {
    if (!toggleParameters.title.alphabeticalOrder.ascending) {
        newArr = arr.sort((a, b) => a["Title"] > b['Title'] ? 1 : -1);
        toggleParameters.title.alphabeticalOrder.ascending = true;
        toggleParameters.title.alphabeticalOrder.clicked = false;
        return newArr
    } else if (toggleParameters.title.alphabeticalOrder.ascending) {
        newArr = arr.sort((a, b) => b["Title"] > a['Title'] ? 1 : -1);
        toggleParameters.title.alphabeticalOrder.ascending = false;
        toggleParameters.title.alphabeticalOrder.clicked = false;
        return newArr
    }

}

const removeBooks = (x) => {
    const nodes = document.querySelectorAll(`${x}`);
    nodes.forEach((node) => {
        node.parentElement.removeChild(node);
    });
}

const replaceUndefined = (text) => {
    if (!text) text = `~`;
    return text
}
//true makes it add pulled books to webpage
pullBooks(true);
