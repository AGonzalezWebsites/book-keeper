const bookContainer = document.querySelector(".books");
const titleHeader = document.querySelector('.titleTitle').addEventListener('click', () => toggleParameters.alphabeticalOrderCheck());




///////////////////////////////////////////////////
// Document Selectors Above
/////////////////////////////////////////////////

// Fetching JSON file
const fetchJSON = () => {
    return fetch("./reading-list.json")
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

//
let bookList = [];
const extractBooks = () => {
    for (i=0; i < books.length; i++) {
        bookList[i] = books[i];
    }
}

//main function that pulls books
const pullBooks = () => {
    getJsonData().then((bookList) => {
        console.log(bookList)

        //toggling for alphabetical filter
        if (toggleParameters.alphabeticalOrder.clicked) {
            console.log(true)
            bookList = filterAlphabetically(bookList);
        }
        //For adding and refreshing entire book list
        for (i=0; i < bookList.length; i++) {
            number = i + 1;
            title = bookList[i]["Title"];
            author = bookList[i]["Author "];
            kindleUnlimited = bookList[i]["Kindle Unlimited"]; 
            link = bookList[i]["Link"];
            //replaced undefined elements with "N/A"
            title = replaceUndefined(title);
            author = replaceUndefined(author);
            kindleUnlimited = replaceUndefined(kindleUnlimited);
            link = replaceUndefined(link);

            //finals step
            addToPage();
        }

    }).catch((error) => {
        console.error("Error in getJsonData:", error);
    });
    
}

const addToPage = () => {
    bookItem = document.createElement('div');
    bookItem.classList.add('bookInfo');
    
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
    
    linkElement = document.createElement('a');
    linkElement.classList.add('link');
    linkElement.innerHTML = `${link}`;
    linkElement.href=`${link}`;
    linkElement.title="book";
    
    bookItem.appendChild(numberElement)
    bookItem.appendChild(titleElement)
    bookItem.appendChild(authorElement)
    bookItem.appendChild(kindleUnlimitedElement)
    bookItem.appendChild(linkElement)
    bookContainer.appendChild(bookItem);
}

const toggleParameters = {
    alphabeticalOrder: {
        clicked: false, 
        ascending: false, 
        descending: false}, 
        alphabeticalOrderCheck() {
        if (!this.alphabeticalOrder.clicked) {
            this.alphabeticalOrder.clicked = true;
            removeBooks();
            pullBooks();
        }
    },

}

//Book search referencing api pull
const bookSearch = document.querySelector(`.bookSearch`);
bookSearch.addEventListener("keydown", function (e){
    if (e.code === 'Enter'){
    getApiData(bookSearch.value).then((booksSearched) => {
        let searchedList = [];
        console.log(booksSearched.docs[0])

        for (i=0; i<10; i++) {
            searchedList.push(booksSearched.docs[i])
            tempTitle = searchedList[i].title;
            console.log(title)
        }




    })}
});

const filterAlphabetically = (arr) => {
    newArr = arr.sort((a, b) => a["Title"] > b['Title'] ? 1 : -1);
    return newArr
}

const removeBooks = () => {
    const nodes = document.querySelectorAll(`.bookInfo`);
    console.log(nodes)
    nodes.forEach((node) => {
        node.parentElement.removeChild(node);
    });
}

const replaceUndefined = (text) => {
    if (!text) text = `N/A`;
    return text
}
    
pullBooks();
