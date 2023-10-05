const alertBox = document.querySelector(`.alertBox`)
const bookListContainer = document.querySelector(".bookListContainer");
const bookContainer = document.querySelector(".books");
const bookSearchContainer = document.querySelector('.bookSearch');
const spotlightContainer = document.querySelector(`.spotlightContainer`);
const welcomeContainer = document.querySelector(`.welcomeContainer`);
const closeWelcomeButton = document.querySelector(`.closeWelcomeButton`);
const toggleSpotlightIcon = document.querySelector(`.toggleSpotlightIcon`);
const deleteFilter = document.querySelector(`.deleteFilter`);
const favoriteFilter = document.querySelector(`.favoriteFilter`);
const editFilter = document.querySelector(`.editFilter`);
const newListButton = document.querySelector(`.newList`);
const tagButtons = document.querySelector(`.tagButtons`);
const readTag = document.querySelector(`.readTag`);
const readingTag = document.querySelector(`.readingTag`);
const notReadTag = document.querySelector(`.notReadTag`);
const newTag = document.querySelector(`.newTag`);
const addTagContainer = document.querySelector(`.addTagContainer`);
const addTagForm = document.querySelector(`#addTagForm`);
const cancelTagButton = document.querySelector(`.cancelTagButton`);
const randomBookButton = document.querySelector(`.randomBookButton`);

document.addEventListener("DOMContentLoaded", function(){

    if(!localStorage.getItem("visited")){
        localStorage.setItem("visited", true);
        let tempBookList = demoBookList;
        addObjectToLocalStorage(tempBookList)
        welcomeContainer.classList.remove(`toggleHidden`)
    }

    if (localStorage.books) {
        const tempBookList = {};
        tempBookList.books = [];
        tempBookList.books = JSON.parse(localStorage.getItem(`books`));
        tempBookList.userSettings = JSON.parse(localStorage.getItem(`userSettings`));
        addToObject(bookList, tempBookList.books, tempBookList.userSettings);
        if (!bookList.userSettings) {
            bookList.userSettings = {}
            if (!bookList.userSettings.colorScheme) bookList.userSettings.colorScheme = "hazlenut"
        }
        if (!bookList.userSettings.allTags) bookList.userSettings.allTags = [[`read`, `#890000`], [`reading`, `#009016`], [`readnext`, `#b3aa00`]]
        if (Array.isArray(bookList.userSettings.allTags)) {
            let indexOfNone = bookList.userSettings.allTags.findIndex(tag => tag[0] === 'none');
            if (typeof(indexOfNone) === `number` && indexOfNone >= 0) bookList.userSettings.allTags.splice(indexOfNone, 1)
        }
        
        for (const book of bookList.books) {
            if (!Array.isArray(book.tag)) book.tag = [];
        }

        initializeTags()
        addObjectToLocalStorage(bookList)
        setColorScheme(bookList.userSettings.colorScheme)
        addToPage(bookList.books);
        addAllTagsToPage()
    }

    for (const book of bookList.books) {
        if (!book.tag) book.tag = [];
        if (typeof(book.tag) === `string`) book.tag = []
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

    toggleSpotlightIcon.addEventListener(`click`, () => {
        if (bookList.toggleParameters.favorites) toggleSpotlight(favoriteBooks)   
        else if (bookList.toggleParameters.tag) toggleSpotlight(tagBooks)   
        else if (filteringByKeyword) toggleSpotlight(myfilteredBooks)   
        else toggleSpotlight(bookList);
    })
});

//*******/ INITIALIZATION ABOVE /*******//

window.addEventListener(`click`, (e) => {
    console.log(e.target)
    if (searching) { // to close search box on click away
        if (!bookSearchContainer.contains(e.target)) {
            if (typeof(previewContainer) === `object` && document.contains(previewContainer)) return
            if (e.target.classList.contains(`submitPreviewButton`)) return
            else stopSearching()
        }
    }

    if(bookList.toggleParameters.tag) {
        if (!bookContainer.contains(e.target) && !spotlightContainer.contains(e.target)) bookList.toggleParameters.toggleFilterByTag();
    }

    if (deleteIconToggled) {
        if (!bookContainer.contains(e.target) && !e.target.classList.contains(`deleteFilter`) && !e.target.classList.contains(`deleteIcon`)) toggleDeleteButton(deleteFilter)
    }

    if (editIconToggled) {
        if (!bookContainer.contains(e.target) && !e.target.classList.contains(`editFilter`)) toggleEditButton(editFilter)
    }

if (favoriteIconToggled) {
    let tempElA;
    let tempElB;
    if (typeof previewContainer !== 'undefined') tempElA = previewContainer;
    else tempElA = bookContainer //if doesn't exist, make it bookContainer so it's safe check
    if (typeof spotlightBooks !== 'undefined') tempElB = spotlightBooks;
    else tempElB = bookContainer //if doesn't exist, make it bookContainer so it's safe check

    if (!bookContainer.contains(e.target) && !tempElA.contains(e.target) && !tempElB.contains(e.target) && !toggleSpotlightIcon.contains(e.target) && e.target !== favoriteFilter) removeToggleManunally()
    if (e.target.parentElement.classList.contains(`bookListHeader`)) removeToggleManunally()
}
})

closeWelcomeButton.addEventListener(`click`, () => {
    welcomeContainer.classList.add(`toggleHidden`)
})

const newBookList = () => {
    bookList.books = [];
    bookList.userSettings.allTags = false;
    bookList.userSettings.colorScheme = `hazlenut`;
    addObjectToLocalStorage(bookList)
    location.reload()
}
newListButton.addEventListener(`click`, () => {
confirmCustom(`Are you sure you want to create a new booklist? This will erase the currect booklist.`, newBookList)
})

const loader = document.createElement(`div`);
loader.classList.add('loader');

const addMoreDetailsEvent = (element) => {
    element.addEventListener(`click`, (e) => {
        if (e.target.parentElement.className.includes('bookInfo') && e.target.tagName !== `I`) {
            addMoreDetails(bookList, e.target.id, e.target.parentElement)
        }
    })
}

let searchTimer;
let searchBox;
let searching = false;
const bookSearch = document.querySelector(`.bookSearchInput`);
bookSearch.addEventListener("keydown", (e) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout( () => {
        let cancelCurrentSearch = false;
        cancelCurrentSearch = checkSearchInput(e)
        if (cancelCurrentSearch) return
        if (bookSearch.nextElementSibling) removeAllChildren(searchBox);
        removeBooks('.searchedBookInfo'); //remove from previous search
        if (searchBox) addLoader(searchBox);
        if (searching) {
            addSearchBox();
            searchBooks();
        }
    }, 700)
});

const checkSearchInput = (e) => {
    //do nothing if same value
    if ((e.keyCode === 32 || e.keyCode === 8 && lastSearch === bookSearch.value)) {
        cancelCurrentSearch = true
        return cancelCurrentSearch
    } else cancelCurrentSearch = false
    lastSearch = bookSearch.value;
    //remove searchBox if no value in search
    if (bookSearch.value.length === 0) {
        stopSearching()
        return;
    } else if (bookSearch.value.length <= 2) removeAllChildren(searchBox); //do nothing search has less than 2 characters
    searching = true;
}

const removeBooks = (x) => {
    const nodes = document.querySelectorAll(`${x}`);
    nodes.forEach((node) => {
        node.parentElement.removeChild(node);
    });
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

const styleSearchBox = () => {
    searchBox.setAttribute('id', 'toggleSearchStyle'); 
}

let lastSearch;
//Book search referencing api pull
const searchedBooks = {};
const searchBooks = () => {
    let searchedList = [];
    getApiData(bookSearch.value).then((booksSearched) => {
        if (searching) {
            for (let i=0; i<10; i++) {
                searchedList.push(booksSearched.items[i])
            }
            console.log(searchedList)
        }
        styleSearchBox();
        removeElement(loader)
        addToObjectFromApi(searchedBooks, searchedList) //send full searched list to function

        for (const book of searchedBooks.books) {
                book.tag = []
                appendToSearchBox(book, addValuesToElement(book, `thumbnail`, `title`, `authors`));
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

let coverDiv;
let titleAndAuthorDiv
const appendToSearchBox = (book, ...elements) => {
    tempBookItem = createElementWithClassOrID(`div`, `class`, `searchedBookInfo`)
    tempBookItem.setAttribute(`id`, `${book.id}`);
    titleAndAuthorDiv = createElementWithClassOrID(`div`, `class`, `titleAndAuthor`) //container for title and author outside of loop
    
    searchedBookButtons = createElementWithClassOrID(`div`, `class`, `searchedBookButtons`) //container for title and author outside of loop
    addFromSearchButton = document.createElement(`button`)
    addFromSearchButton.classList.add(`addFromSearchButton`)
    addFromSearchButton.innerText = `Add`;
    searchedBookButtons.appendChild(addFromSearchButton)


    for (let i = 0; i < elements[0].length; i++) { //each element appended to div container here
        if (elements[0][i].tagName === `IMG`) {
            coverDiv = createElementWithClassOrID(`div`, `class`, `coverContainer`)
            coverDiv.appendChild(elements[0][i])
        }
        if (elements[0][i].tagName === `P`) {
            titleAndAuthorDiv.appendChild(elements[0][i])
        }
        if (elements[0][i].tagName === 'A') {
            tempBookItem.setAttribute(`id`, `${elements[0][i].id}`);
        }
    }
    if (tempBookItem) tempBookItem.appendChild(coverDiv);
    if (titleAndAuthorDiv) tempBookItem.appendChild(titleAndAuthorDiv);
    if (titleAndAuthorDiv) tempBookItem.appendChild(titleAndAuthorDiv);
    if (searchedBookButtons) tempBookItem.appendChild(searchedBookButtons)
    addEventToAddToObject(searchedBooks, searchedBookButtons);
    addEventToAddToPreview(searchedBooks, tempBookItem);
    searchBox.appendChild(tempBookItem); //div container of all searched elements appended to search box
    
    let cantFindBook = createElementWithClassOrID(`p`, `class`, `cantFindBook`)
    cantFindBook.innerText = `Can't find book? Add manually here`
    cantFindBook.addEventListener(`click`, submitAddBookForm)

    closeSearch = createElementWithClassOrID(`i`, `class`, `fa-solid fa-x`)
    closeSearch.addEventListener(`click`, stopSearching)

    searchBox.appendChild(closeSearch);
    searchBox.appendChild(cantFindBook);
    
}

const addEventToAddToObject = (objectFrom, ...element) => { //For added elements to be given the listener to be added to the bookList object on click and close searchbox
    element[0].addEventListener('click', (e) => {
        selectedBook = pullBookFromObject(objectFrom, e.target.parentElement.parentElement.id);
        result = checkForDublicates(bookList, selectedBook)
        if (result) {
            notification(`${selectedBook[0].title} by ${selectedBook[0].authors} is already in your collection`)
            return
        }
        notification(`Added ${selectedBook[0].title} by ${selectedBook[0].authors}!`)
        addToObject(bookList, selectedBook)
        addSingleBookToPage(selectedBook)
        // stopSearching() //add back if I want to stop searching after adding a book
        if (typeof(previewContainerHolder) === `object`) previewContainerHolder.parentNode.removeChild(previewContainerHolder);
    });
}




randomBookButton.addEventListener(`click`, () => {
    confirmCustom(`A random book from your list will be chosen. Are you sure you're ready to commit to this book?`, ChooseRandomBook)
})

const ChooseRandomBook = () => {
    if (bookList.books.length < 10) {
        notification(`Add at least 10 books to use this feature`)
        return
    }

    let totalBooks = bookList.books.length;
    let randomNum = Math.floor(Math.random() * totalBooks) + 1;
    let bookSelected = bookList.books[randomNum];
    document.body.classList.add(`unclickable`)

    scrollToBook(bookSelected);

    setTimeout(() => {
        addToPreview(bookList, bookSelected)
        document.body.classList.remove(`unclickable`)
    }, 1800)
}

const scrollToBook = (book) => {
    let nodeSelected;
    if (spotlightOpen) {
        spotlightBooks.childNodes.forEach(element => {
            if (element.id === book.id) nodeSelected = element
        })
        let nodePositionLeft = nodeSelected.offsetLeft;
        let elementWidth = spotlightBooks.offsetWidth;
        spotlightBooks.scrollTo(`${nodePositionLeft - (elementWidth / 2 - 37.5)}`, 0);
    }
    
    bookContainer.childNodes.forEach(element => {
        if (element.id === book.id) nodeSelected = element
    })

    let nodePositionTop = nodeSelected.offsetTop;
    let elementHeight = bookContainer.offsetHeight;

    if (nodeSelected) bookContainer.scrollTo(0, `${nodePositionTop - (elementHeight / 2 - 30)}`);
    else return
}



let previewIterationModifier;
const addEventToAddToPreview = (obj, element, cycle) => {
    element.addEventListener(`click`, (e) => {
        addToPreview(obj, element, cycle, e)
        });
    }

const addToPreview = (obj, element, cycle, e) => {
    if (e) if (e.target.className === `addFromSearchButton`) return
    if (!cycle) previewIterationModifier = 0
    if (cycle) {
        if (previewContainerHolder) previewContainerHolder.parentNode.removeChild(previewContainerHolder);
        if (cycle === 'last') previewIterationModifier = -1;
        if (cycle === 'next') previewIterationModifier = 1;
    }

    if (obj.toggleParameters) { 
        if (obj.toggleParameters.favorites) obj = favoriteBooks;
        else if (obj.toggleParameters.tag) obj = tagBooks;
    }

    for (let i = 0; i < obj.books.length; i++) {
        if(obj.books[i].id === element.id) {
            try {
                newIteration = i + previewIterationModifier;
                let currentBook = obj.books[newIteration]
                let h1;
                let combinedElements = addValuesToElement(currentBook, `tag`, `thumbnail`, `title`, `authors`, `subject`, `description`, `publishedDate`, `publisher`, `averageRating`, `ratingsCount`, `industryIdentifiers`);
                
                previewContainerHolder = createElementWithClassOrID(`div`, `class`, `previewContainerHolder flex justify-center items-center align-center fixed top-0 min-h-max min-w-max`)
                previewContainer = createElementWithClassOrID(`div`, `class`, `previewContainer flex flex-col h-auto w-auto`)
                previewContainer.setAttribute('id', `${currentBook.id}`);
                previewContainerHolder.appendChild(previewContainer)
                
                if (combinedElements.some(element => element.className === `thumbnail`)) {
                    previewCoverAuthorTitle = createElementWithClassOrID(`div`, `class`, `previewCoverAuthorTitle flex flex-row`)
                    previewCoverAuthorTitle.appendChild(combinedElements.find(element => element.className === `thumbnail`))
                }
                
                
                previewauthorAndTitle = createElementWithClassOrID(`div`, `class`, `authorAndTitle`);
                h1 = createElementWithInnerText(`h1`, `Title`);
                previewauthorAndTitle.appendChild(h1)
                if (combinedElements.some(element => element.className === `title`)) previewauthorAndTitle.appendChild(combinedElements.find(element => element.className === `title`))

                h1 = createElementWithInnerText(`h1`, `Author`);
                previewauthorAndTitle.appendChild(h1)
                if (combinedElements.some(element => element.className === `authors`)) previewauthorAndTitle.appendChild(combinedElements.find(element => element.className === `authors`))
                previewCoverAuthorTitle.appendChild(previewauthorAndTitle)
                
                previewSubjectDatePublisher = createElementWithClassOrID(`div`, `class`, `previewSubjectDatePublisher flex flex-row`)

                h1 = createElementWithInnerText(`h1`, `Subject`);
                previewSubject = createElementWithClassOrID(`div`, `class`, `previewSubject`)
                previewSubject.appendChild(h1)
                if (combinedElements.some(element => element.className === `subject`)) previewSubject.appendChild(combinedElements.find(element => element.className === `subject`))
                
                h1 = createElementWithInnerText(`h1`, `Published`);
                previewPublishedDate = createElementWithClassOrID(`div`, `class`, `previewPublishedDate`)
                previewPublishedDate.appendChild(h1)
                if (combinedElements.some(element => element.className === `publishedDate`)) previewPublishedDate.appendChild(combinedElements.find(element => element.className === `publishedDate`))
                
                h1 = createElementWithInnerText(`h1`, `Publisher`);
                previewPublisher = createElementWithClassOrID(`div`, `class`, `previewPublisher`)
                previewPublisher.appendChild(h1)
                if (combinedElements.some(element => element.className === `publisher`)) previewPublisher.appendChild(combinedElements.find(element => element.className === `publisher`))

                h1 = createElementWithInnerText(`h1`, `Rating`);
                previewAverageRating = createElementWithClassOrID(`div`, `class`, `previewRating`)
                previewAverageRating.appendChild(h1)
                if (combinedElements.some(element => element.className === `averageRating`)) {
                    averageRating = combinedElements.find(element => element.className === `averageRating`)
                    totalRatings = combinedElements.find(element => element.className === `ratingsCount`);
                    if (averageRating.innerText !== "N/A") {
                        averageRating.innerText = `${averageRating.innerText}/5 (${totalRatings.innerText})`
                    } else {
                        averageRating.innerText = `N/A`
                    }
                    previewAverageRating.appendChild(averageRating)
                }
                
                previewSubjectDatePublisher.appendChild(previewSubject)
                previewSubjectDatePublisher.appendChild(previewPublishedDate)
                previewSubjectDatePublisher.appendChild(previewPublisher)
                previewSubjectDatePublisher.appendChild(previewAverageRating)
                
                previewDescription = createElementWithClassOrID(`div`, `class`, `previewDescription`)
                if (combinedElements.some(element => element.className === `description`)) {
                    previewDescription.appendChild(combinedElements.find(element => element.className === `description`))
                }


                tagTextHeader = document.createElement(`h2`);
                tagTextHeader.innerText = `Tags`;
                booksTags = createElementWithClassOrID(`div`, `class`, `booksTags`)
                bookList.userSettings.allTags.forEach(element => {
                    tempTag = createElementWithClassOrID(`h1`, `id`, `${currentBook.id}`)
                    tempTag.innerText = `${element[0]}`
                    tempTag.addEventListener(`click`, (e) => {
                        if (searching) addTagToBook(e, obj)
                        else addTagToBook(e, bookList)
                    })
                    colorTag(checkTagMatch(currentBook.tag, element))
                    booksTags.appendChild(tempTag)
                })

                tagsContainer = createElementWithClassOrID(`div`, `class`, `additionalInfoTagsContainer`)
                tagsContainer.appendChild(tagTextHeader)
                tagsContainer.appendChild(booksTags)



                let allElements = [previewCoverAuthorTitle, previewSubjectDatePublisher, tagsContainer, previewDescription]
                allElements.forEach(element => previewContainer.appendChild(element))
                
                previewButtons = createElementWithClassOrID(`div`, `class`, `previewButtons`);
                cancelPreviewButton = createElementWithClassOrID(`button`, `class`, `submitPreviewButton`);
                cancelPreviewButton.innerText = "Close";
                cancelPreviewButton.addEventListener(`click`, () => {if (previewContainerHolder) previewContainerHolder.parentNode.removeChild(previewContainerHolder);})
                previewButtons.appendChild(cancelPreviewButton);
                
                lastPreviewButton = createElementWithClassOrID(`button`, `class`, `lastPreviewButton`);
                if (obj.books[newIteration] === obj.books[0]) lastPreviewButton.innerText = "";
                lastPreviewButton.innerText = "Last";
                lastPreviewButton.setAttribute('id', `${obj.books[newIteration].id}`);
                addEventToAddToPreview(obj, lastPreviewButton, `last`);
                previewButtons.appendChild(lastPreviewButton)
                
                nextPreviewButton = createElementWithClassOrID(`button`, `class`, `nextPreviewButton`)
                nextPreviewButton.innerText = "Next";
                nextPreviewButton.setAttribute('id', `${obj.books[newIteration].id}`);
                addEventToAddToPreview(obj, nextPreviewButton, `next`);
                previewButtons.appendChild(nextPreviewButton)
                
                
                previewBoxTitle = createElementWithClassOrID(`p`, `class`, `previewBoxTitle`)
                if (searchedBooks) {
                    if (obj === searchedBooks) {
                        submitPreviewButton = createElementWithClassOrID(`button`, `class`, `submitPreviewButton`)
                        submitPreviewButton.innerText = "Add";
                        addEventToAddToObject(obj, submitPreviewButton);                
                        previewButtons.appendChild(submitPreviewButton)
                        previewBoxTitle.innerText = `From Searched Books`;
                    } 
                }
                if (obj === bookList) previewBoxTitle.innerText = `From My Books`;
                if (typeof(favoriteBooks) === `object`) if (obj === favoriteBooks) previewBoxTitle.innerText = `From My Favorites`;
                if (typeof(tagBooks) === `object`) if (obj === tagBooks) previewBoxTitle.innerText = `From Selected Tag`;
                
                previewBoxTitleDiv = createElementWithClassOrID(`div`, `class`, `previewBoxTitleContainer`)
                previewBoxTitleDiv.appendChild(previewBoxTitle)
                
                sampleButton = document.createElement(`p`);
                if (currentBook.accessViewStatusEmbeddable && currentBook.accessViewStatusEmbeddable === `SAMPLE`) {
                    previewLink = document.createElement(`a`);
                    previewLink.href = currentBook.previewLink;
                    previewLink.target = `#`;
                    previewLink.innerText = `Read Sample`;
                    sampleButton.appendChild(previewLink)
                    previewBoxTitleSpacing = createElementWithClassOrID(`i`, `class`, `previewBoxTitleSpacing fa-solid fa-minus`)
                    previewBoxTitleDiv.appendChild(previewBoxTitleSpacing)
                    previewBoxTitleDiv.appendChild(sampleButton)
                } else {
                    sampleButton.innerText = `No Sample`;
                    previewBoxTitleSpacing = createElementWithClassOrID(`i`, `class`, `previewBoxTitleSpacing fa-solid fa-minus`)
                    previewBoxTitleDiv.appendChild(previewBoxTitleSpacing)
                    previewBoxTitleDiv.appendChild(sampleButton)
                }
                
                if (typeof currentBook.industryIdentifiers === `object`) {
                    if (combinedElements.some(element => element.className === `industryIdentifiers`)) {
                        let amazonLinks = combinedElements.find(element => element.className === `industryIdentifiers`)
                        amazonLinks.setAttribute(`class`, `flex flex-row`)
                        previewBoxTitleSpacing = createElementWithClassOrID(`i`, `class`, `previewBoxTitleSpacing fa-solid fa-minus`)
                        previewBoxTitleDiv.appendChild(previewBoxTitleSpacing)
                        previewBoxTitleDiv.appendChild(amazonLinks)
                    }
                }
            
                previewContainer.appendChild(previewBoxTitleDiv)
                previewContainer.appendChild(previewButtons)
                document.body.appendChild(previewContainerHolder)
                if (cycle === 'last') previewContainer.classList.add(`toggleSlideOut`)
                if (cycle === 'next') previewContainer.classList.add(`toggleSlideOutRight`)
                
                if (obj !== searchedBooks) scrollToBook(currentBook);

                setTimeout(() => {
                    if (cycle === 'next') previewContainer.classList.remove(`toggleSlideOutRight`);
                    if (cycle === 'last') previewContainer.classList.remove(`toggleSlideOut`);
                }, 100)
            } 
            catch(syntaxError) {
                console.log(syntaxError)
                console.error("Syntax error:", syntaxError.message);
                if (cycle === 'last') {
                    notification(`Reached beginning of list`);
                    addToPreview(obj, element)
                }
                if (cycle === 'next') {
                    notification(`Reached end of list`);
                    addToPreview(obj, element)
                }
            }   
        }
    }
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
                } else bookObject.thumbnail = `img/noCover.jpeg`
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
    
    if (userSettings) if (object === bookList) object.userSettings = userSettings;

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
                tag: book.tag,
            };
            object.books.push(bookObject);
        }
    } else {
        alert(`Could not add, invalid selection`);
    }
    if (object === bookList) {addObjectToLocalStorage(object)}
};

const addObjectToLocalStorage = (object) => {
    if (localStorage) localStorage.removeItem(`books`);
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
    tag: false,
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
            addToPage(favoriteBooks.books);
            closeAndOpenSpotlight(favoriteBooks);
            bookList.toggleParameters.favorites = true;
        } else if (bookList.toggleParameters.favorites) {
            addToPage(bookList.books);
            closeAndOpenSpotlight(bookList);
            bookList.toggleParameters.favorites = false;
        }
    },
    toggleFilterByTag(tagGiven) {
        if (!bookList.toggleParameters.tag) {
            tagBooks = {};
            tagBooks.books = []
            bookList.books.forEach(book => {
                for (const tag of book.tag)
                if (tag[0] === tagGiven) tagBooks.books.push(book)
            });
            addToPage(tagBooks.books);
            closeAndOpenSpotlight(tagBooks)
            bookList.toggleParameters.tag = true;
        } else if (bookList.toggleParameters.tag) {
            addToPage(bookList.books);
            closeAndOpenSpotlight(bookList)
            bookList.toggleParameters.tag = false;
        }
    },
    removeClassesAndAddToPage(element, object) {
        removeAllClass(element)
        addToPage(object.books);
    }
}

let filteringByKeyword = false;
const myBookSearch = document.querySelector(`.myBookSearchInput`);
myBookSearch.addEventListener("keydown", (e) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout( () => {
        myfilteredBooks = {};
        myfilteredBooks.books = []
        searchFilteredBooks = bookList.books.map(book => {
            titleMatch = toStringIfArray(replaceUndefined(book.title)).toLowerCase().includes(e.target.value.toLowerCase())
            authorMatch = toStringIfArray(replaceUndefined(book.authors)).toLowerCase().includes(e.target.value.toLowerCase())
            subjectMatch = toStringIfArray(replaceUndefined(book.subject)).toLowerCase().includes(e.target.value.toLowerCase())
            if (authorMatch || titleMatch || subjectMatch) myfilteredBooks.books.push(book);
        })
        addToPage(myfilteredBooks.books)
        closeAndOpenSpotlight(myfilteredBooks)
        //make sure to delete existing bookList elements and add these results to page
        //when search is empty, need to delete myFilteredBooks and add bookList to page again
    }, 200)
});

//adds value to element for a single book object - need to iterate for each call
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
                        if (key === `tag`) {
                            if (object.tag && Array.isArray(object.tag)) {
                                tempElement = createElementWithClassOrID(`div`, `class`, `tagColors`);
                                tempElement.setAttribute(`id`, `${object.id}`);
                                if (Array.isArray(object.tag)) {
                                    object.tag.forEach((tag) => {
                                        addTagReferenceToElement(tempElement, tag)
                                    })
                                }
                            } else return
                        } else if (key === `thumbnail`) {
                            tempElement = createElementWithClassOrID(`img`, `id`, `${object.id}`);
                            if (typeof tempSelection === `string`) {
                                if (!tempSelection.includes(`https`)) tempSelection = tempSelection.replace(`http`, `https`)
                                tempElement.src = tempSelection;
                            } else tempElement.src = `img/noCover.jpeg`;
                            tempElement.alt = `Book cover`;
                            tempElement.classList.add(`${key}`);
                        } else if (key === `industryIdentifiers` && typeof object.industryIdentifiers) {
                            
                            tempElement = createElementWithClassOrID(`div`, `id`, `${object.id}`);
                            
                            if (typeof object.industryIdentifiers[1] === `object`) {

                                tempElementP = createElementWithClassOrID(`p`, `id`, `${object.id}`);
                                tempElementLink = createElementWithClassOrID(`a`, `id`, `${object.id}`);
                                tempElementLink.href = `https://www.amazon.com/dp/${object[`${key}`][1].identifier}?&linkCode=ll1&tag=symphonicwebs-20&linkId=95439b61b8ad1059a044a67a17e83e15&language=en_US&ref_=as_li_ss_tl`;
                                tempElementLink.target = `#`;
                                tempElementLink.innerText = `Amazon A`;
                                tempElementP.classList.add(`${key}`);
                                
                                tempElementP.appendChild(tempElementLink)
                                tempElement.appendChild(tempElementP)
                            }
                            
                            if (typeof object.industryIdentifiers[0] === `object`) {

                                
                                tempElementP2 = createElementWithClassOrID(`p`, `id`, `${object.id}`);
                                tempElementLink = createElementWithClassOrID(`a`, `id`, `${object.id}`);
                                tempElementLink.href = `https://www.amazon.com/dp/${object[`${key}`][0].identifier}?&linkCode=ll1&tag=symphonicwebs-20&linkId=95439b61b8ad1059a044a67a17e83e15&language=en_US&ref_=as_li_ss_tl`;
                                tempElementLink.target = `#`;
                                tempElementLink.innerText = `Amazon B`;
                                tempElementP2.classList.add(`${key}`);
                                tempElementP2.appendChild(tempElementLink)
                                
                                tempElement.appendChild(tempElementP2)
                            }
                                tempElement.classList.add(`${key}`);
                                
                            } else if (key === `averageRating`) {
                            tempSelection = reduceDecimal(tempSelection, 2);
                            tempSelection = replaceUndefined(tempSelection);
                            tempElement = createElementWithClassOrID(`p`, `id`, `${object.id}`);
                            tempElement.textContent = `${tempSelection}`;
                            tempElement.classList.add(`${key}`);
                        } else if (key === 'favorite') {
                        tempElement = createElementWithClassOrID(`i`, `id`, `${object.id}`)
                        tempElement.classList.add(`fa-solid`)
                        tempElement.classList.add(`fa-star`)
                        addEventToAddToFavorite(tempElement)
                        if (object.favorite) tempElement.classList.add(`favorite`)
                        if (!object.favorite) tempElement.classList.add(`toggleHidden`)
                        } else {
                            tempElement = createElementWithClassOrID(`p`, `id`, `${object.id}`)
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
    console.log(object[0]);
    let objectCount = Object.keys(object[0]).length;
    for (let i = 0; i < objectCount; i++) { //iterate through each book object
        let currentCount = i;
        allElements = addValuesToElement(object[0][i],`tag`, `thumbnail`, `title`, `authors`, `subject`, 'favorite');
        firstLineDiv = createBookInfo(object[0], currentCount)
        tempBookItem = document.createElement(`div`); 
        tempBookItem = createElementWithClassOrID(`div`, `class`, `bookInfo`) //the container div for the link item
        tempBookItem.setAttribute('id', `${object[0][i].id}`);
        tempBookItem.appendChild(firstLineDiv); // apending div with all elements
        addMoreDetailsEvent(tempBookItem) //add event for more details
        bookContainer.appendChild(tempBookItem);
        toggleClasses(tempBookItem, `toggleHeightSmall`, `toggleHeightNormal`);
        }
    if (coverToggled) toggleLineHeight();
}

const addSingleBookToPage = (...object) => {
    if (spotlightOpen) addSingleBookToSpotLight(object[0]);
    allElements = addValuesToElement(object[0][0], `tag`, `thumbnail`, `title`, `authors`, `subject`, 'favorite');
    firstLineDiv = createBookInfo(object[0], 0, Object.keys(bookList.books).length)
    tempBookItem = document.createElement(`div`); 
    tempBookItem = createElementWithClassOrID(`div`, `class`, `bookInfo`) //the container div for the link item
    tempBookItem.setAttribute('id', `${object[0][0].id}`);
    tempBookItem.appendChild(firstLineDiv); // apending div with all elements
    addMoreDetailsEvent(tempBookItem) //add event for more details
    bookContainer.appendChild(tempBookItem);
    toggleClasses(tempBookItem, `toggleHeightSmall`, `toggleHeightNormal`);
}

//Creates div that holds line item to be appended to .bookInfo div
const createBookInfo = (object, iteration, newBookNumber) => { 
    bookListNumber = createElementWithClassOrID(`p`, `class`, `lineNumber`) //bookListNumber is for the visual number on the list. No additional value.
    if (newBookNumber) bookListNumber.textContent = `${newBookNumber}`;
    else bookListNumber.textContent = `${(iteration + 1)}`;

    firstLineDiv = createElementWithClassOrID(`div`, `id`, `${object[iteration].id}`) //div all elements will be appended to
    firstLineDiv.appendChild(bookListNumber);
    
    for (const el of allElements) {
        firstLineDiv.appendChild(el);
    }
    return firstLineDiv
}

let moreDetailsExpanded = false
const addMoreDetails = (object, id, existingElement) => {
    newElements = []
    let previewIcon = document.createElement(`i`);
    previewIcon.classList.add(`fa-solid`); // preview icon for preview event
    previewIcon.classList.add(`fa-eye`) ;// preview icon for preview event
    previewIcon.setAttribute(`id`, `${id}`);
    addEventToAddToPreview(bookList, previewIcon);

    let iconGrabbed = grabChildNodeByClass(existingElement.firstChild, `fa-star`); // grabs correct from icon
    if (moreDetailsExpanded === true && lastElement === existingElement) {
        closePreviewWithoutNewPreview(existingElement, lastElement, moreDetailsContainer, iconGrabbed)
        return
    } else if (moreDetailsExpanded === true && lastElement !== existingElement) {
        lastElement.classList.remove(`selectedBook`)
        let iconGrabbed = grabChildNodeByClass(lastElement.firstChild, `fa-star`); // grabs correct icon from previous element
        favoriteSelected = grabChildNodeByClass(lastElement.firstChild, `favorite`); //checking if favorite was selected
        if (!favoriteSelected) iconGrabbed.classList.add(`toggleHidden`) //hide favorite icon if not selected
        let lastMoreDetails = lastElement.querySelector(`.moreDetails`);
        lastMoreDetails.classList.add(`removeHeight`)
        setTimeout(()=> {
            lastMoreDetails.parentElement.removeChild(lastMoreDetails)
        }, 500)
    }
    
    window.addEventListener(`click`, (e) => {
        if (moreDetailsExpanded) if (!bookContainer.contains(e.target) && (!spotlightContainer.contains(e.target))) closePreviewWithoutNewPreview(existingElement, lastElement, moreDetailsContainer, iconGrabbed)
    })

    for (const book of object.books) {
        if (book.id === id ) {
            moreDetailsContainer = createElementWithClassOrID(`div`, `class`, `moreDetails`)
            moreDetailsFirstItems = createElementWithClassOrID(`div`, `class`, `additionInfo`)
            moreDetailsTags = createElementWithClassOrID(`div`, `class`, `moreDetailsTags`)

            publishedDate = document.createElement(`div`);
            publishedDateTextHeader = document.createElement(`h2`);
            publishedDateTextHeader.innerText = (`Released`);
            publishedDateText = document.createElement(`p`);
            if (book.publishedDate) publishedDateText.innerText = (book.publishedDate);
            else publishedDateText.innerText = `N/A`;
                publishedDate.appendChild(publishedDateTextHeader);
                publishedDate.appendChild(publishedDateText);
                moreDetailsFirstItems.appendChild(publishedDate);
            
                publisher = document.createElement(`div`);
                publisherTextHeader = document.createElement(`h2`);
                publisherTextHeader.innerText = (`Publisher`);
                publisherText = document.createElement(`p`);
                if (book.publisher) publisherText.innerText = (book.publisher);
                else publisherText.innerText = `N/A`;
                publisher.appendChild(publisherTextHeader);
                publisher.appendChild(publisherText);
                moreDetailsFirstItems.appendChild(publisher);
            
            
                pageCount = document.createElement(`div`);
                pageCountTextHeader = document.createElement(`h2`);
                pageCountTextHeader.innerText = (`Page Count`);
                pageCountText = document.createElement(`p`);
                if (book.pageCount) pageCountText.innerText = (book.pageCount);
                else pageCountText.innerText = `N/A`;
                pageCount.appendChild(pageCountTextHeader);
                pageCount.appendChild(pageCountText);
                moreDetailsFirstItems.appendChild(pageCount);

            previewButton = document.createElement(`button`);
            if (book.accessViewStatusEmbeddable && book.accessViewStatusEmbeddable === `SAMPLE`) {
                previewLink = document.createElement(`a`);
                previewLink.href = book.previewLink;
                previewLink.target = `#`;
                previewLink.innerText = `Sample`;
                previewButton.appendChild(previewLink)
            } else previewButton.innerText = `No Sample`;
            moreDetailsFirstItems.appendChild(previewButton);
            
            descriptionTitle = createElementWithClassOrID(`P`, `class`, `descriptionTitle`)
            descriptionTitle.innerText = `Description`;
            description = document.createElement(`p`);
            description.innerText = `${book.description}`;

            if (book.tag) {
                tagTextHeader = document.createElement(`h2`);
                tagTextHeader.innerText = `Tags`;
                
                booksTags = createElementWithClassOrID(`div`, `class`, `booksTags`)

                bookList.userSettings.allTags.forEach(element => {
                    tempTag = createElementWithClassOrID(`h1`, `id`, `${book.id}`)
                    tempTag.innerText = `${element[0]}`
                    tempTag.addEventListener(`click`, (e) => {
                        addTagToBook(e, bookList)
                    })

                    colorTag(checkTagMatch(book.tag, element))

                    booksTags.appendChild(tempTag)
                })
                
                tagsContainer = createElementWithClassOrID(`div`, `class`, `additionalInfoTagsContainer`)
                tagsContainer.appendChild(tagTextHeader)
                tagsContainer.appendChild(booksTags)
            }


            moreDetailsFirstItems.appendChild(previewIcon);
            
            moreDetailsContainer.appendChild(descriptionTitle)
            moreDetailsContainer.appendChild(description)
            moreDetailsContainer.appendChild(moreDetailsFirstItems);
            moreDetailsContainer.appendChild(tagsContainer);

            iconGrabbed.classList.remove(`toggleHidden`)

            existingElement.appendChild(moreDetailsContainer)
            existingElement.classList.add(`selectedBook`)
            moreDetailsContainer.classList.add(`removeHeight`)
            scrollToBook(book);
            setTimeout(() =>{
                moreDetailsContainer.classList.remove(`removeHeight`);
            }, 10)
        }
    }
    lastElement = existingElement; //used to reference element to be closed even if new element is clicked
    moreDetailsExpanded = true;
}

const closePreviewWithoutNewPreview = (existingElement, lastEl, moreDetailsContainer, icon) => {
    moreDetailsExpanded = false
    lastEl.classList.remove(`selectedBook`)
    favoriteSelected = grabChildNodeByClass(existingElement.firstChild, `favorite`); //checking if favorite was selected
    if (!favoriteSelected) icon.classList.add(`toggleHidden`) //hide favorite icon if not selected
    moreDetailsContainer.classList.add(`removeHeight`)
    setTimeout(()=> {
        lastEl.removeChild(moreDetailsContainer);
    }, 100)
}

const closeSpotlight = () => {
    spotlightContainer.removeChild(scrollLeft)
    spotlightContainer.removeChild(scrollRight)
    spotlightContainer.removeChild(spotlightBooks)
    spotlightContainer.classList.add(`closeSpotlight`)
} 

const closeAndOpenSpotlight = (obj) => {
    if (spotlightOpen){
        toggleSpotlight(obj);
        toggleSpotlight(obj);
    }
}

const addEventToTogglePreviewButton = (element, toggleElement, book) => {
    element.addEventListener(`click`, () => {
        console.log(`active`)
        scrollToBook(book)
        toggleElement.style.display = `flex`
        setTimeout(()=> {
            toggleElement.style.opacity = `1`
        }, 50)
        setTimeout(() => {
            toggleElement.style.opacity = `0`
            setTimeout(() => {
                toggleElement.style.display = `none`
            }, 1000)
        }, 3000)
    })
}

let spotlightBooks;
let spotlightOpen = false;
const toggleSpotlight = (obj) => {
    if (spotlightOpen) {
        toggleSpotlightIcon.classList.remove(`rotate180`)
        closeSpotlight()
        spotlightOpen = false;
        return
    } else if (!spotlightOpen) {
        spotlightBooks = createElementWithClassOrID(`div`, `class`, `spotlightBooks`)
        spotlightBooks.setAttribute(`id`, `spotlightBooks`)

        scrollLeft = createElementWithClassOrID(`div`, `class`, `scrollLeft flex justify-center items-center`)
        scrollLeftIcon = createElementWithClassOrID(`div`, `class`, `fa-solid fa-chevron-down scrollLeftIcon`)
        scrollLeft.appendChild(scrollLeftIcon)
        scrollLeft.addEventListener(`click`, () => spotlightScroll(spotlightBooks, `left`))
        
        scrollRight = createElementWithClassOrID(`div`, `class`, `scrollRight flex justify-center items-center`)
        scrollRightIcon = createElementWithClassOrID(`div`, `class`, `fa-solid fa-chevron-down scrollRightIcon`)
        scrollRight.appendChild(scrollRightIcon)
        scrollRight.addEventListener(`click`, () => spotlightScroll(spotlightBooks, `right`))

        spotlightContainer.appendChild(scrollLeft)
        spotlightContainer.appendChild(scrollRight)

        addSingleBookToSpotLight(obj.books)

        spotlightContainer.classList.remove(`closeSpotlight`)
        spotlightOpen = true;
        toggleSpotlightIcon.classList.add(`rotate180`)
        spotlightContainer.appendChild(spotlightBooks)
        setTimeout(() => {
            scrollLeft.classList.add(`toggleShow`)
            scrollRight.classList.add(`toggleShow`)
            spotlightBooks.classList.add(`toggleShow`)
        }, 500)
    }
}

const spotlightScroll = (element, direction) => {
    let scrollPosition = element.scrollLeft;
    let deviceWidth = document.defaultView.window.innerWidth;
    if (direction === `left`) element.scrollTo((scrollPosition - deviceWidth), 0);
    if (direction === `right`) element.scrollTo((scrollPosition + deviceWidth), 0);

};

const addSingleBookToSpotLight = (obj) => { //only use if spotlight is open
    for (const book of obj) {
        let spotlightBookItem = createElementWithClassOrID(`div`, `id`, `${book.id}`)
        
        let spotlightBookItemPreviewEvent = createElementWithClassOrID(`div`, `id`, `${book.id}`);
        spotlightBookItemPreviewEvent.classList.add(`spotlightBookItemPreviewEvent`);
        let tempH2 = createElementWithInnerText(`h2`, `Click again to Preview`)
        spotlightBookItemPreviewEvent.appendChild(tempH2)
        
        let combinedElements = addValuesToElement(book, `thumbnail`, `title`, `authors`, `subject`, `description`, `publishedDate`, `publisher`, `averageRating`, `ratingsCount`);
        if (combinedElements.some(element => element.className === `thumbnail`)) spotlightBookItem.appendChild(combinedElements.find(element => element.className === `thumbnail`))
        spotlightBookItem.appendChild(spotlightBookItemPreviewEvent)
        addEventToAddToPreview(bookList, spotlightBookItemPreviewEvent);
        addEventToTogglePreviewButton(spotlightBookItem, spotlightBookItemPreviewEvent, book)
        
        if (spotlightOpen) {
        openedSpotlightBooks = grabChildByClassAndID(spotlightContainer, `spotlightBooks`, `spotlightBooks`)
        if (openedSpotlightBooks) openedSpotlightBooks.appendChild(spotlightBookItem)
        else notification(`Unable to add book to the spotlight section, please refresh browser`)
        } else spotlightBooks.appendChild(spotlightBookItem)
    }
}

const openNewTagForm = () => {
    if (addTagContainer.classList.contains(`toggleHidden`)) addTagContainer.classList.remove(`toggleHidden`);
}
newTag.addEventListener(`click`, openNewTagForm)

const closeNewTagForm = () => {
    if (!addTagContainer.classList.contains(`toggleHidden`)) addTagContainer.classList.add(`toggleHidden`);
    let tagName = document.querySelector(".tagName");
    tagName.value = "";
}
cancelTagButton.addEventListener(`click`, closeNewTagForm)

const createNewTag = (e) => {
    let tagName = document.querySelector(".tagName");
    let tagColor = document.querySelector(".tagColor");
    for (const tag of bookList.userSettings.allTags) {
        if (tagName.value === tag[0]) {
            notification(`Unable to use duplicate tag name`)
            return
        }
        if (tagName.value === `none`) {
            notification(`Unable to use the name none`)
            return
        }
        
    }
    tagArr = [`${tagName.value}`, `${tagColor.value}`];
    bookList.userSettings.allTags.push(tagArr);
    addTagToPage(tagName.value, tagColor.value);
}

const removeTag = (books, tagName) => {
    bookList.userSettings.allTags = bookList.userSettings.allTags.filter(element => element[0] !== tagName)
    for (const book of bookList.books) {
        if (Array.isArray(book.tag)) {
            let tempTags = []
            let tagLength = book.tag.length;
            for (let i = 0; i < tagLength; i++) {
                let indexOf = book.tag.findIndex(tag => tag === book.tag[i])
                console.log(`Before Splice:${book.tag}`)
                let tempTagPopped = book.tag.splice(indexOf, 1);
                tempTagPopped = tempTagPopped[0]
                console.log(`After Splice:${book.tag}`)
                if (tempTagPopped[0] !== tagName) tempTags.push(tempTagPopped);
                else if (tempTagPopped[0] === tagName) {
                    let tagRemoved = grabChildByClassAndID(document.body, `${tempTagPopped}`, `${book.id}`);
                    tagRemoved.parentNode.removeChild(tagRemoved);
                }
                
                
                
            }
            book.tag = tempTags;
            addObjectToLocalStorage(bookList)
        }
    }
    removeAllTagsFromPage(); 
    addAllTagsToPage(); // removing and adding all tags to not display recently deleted tag
    // addToPage(bookList.books); // adds elements back to page to filter out tag that was deleted
}

const removeAllTagsFromPage = () => { //this removes every tag so the tags minus the deleted tag are added with addAllTagsToPage()
    let nodeLength = tagButtons.children.length
    for (let i = 0; i < nodeLength; i++) {
        let tempNode = tagButtons.children[0]
        if (tempNode.innerText === `Add New`) tempNode = tagButtons.children[1]
        if (tempNode) removeElement(tempNode)
    }
}

const addAllTagsToPage = () => {
    bookList.userSettings.allTags.forEach(element => {
        if (element[0] !== `none`) addTagToPage(element[0], element[1])
    })
}

const addTagToPage = (tagName, tagColor) => {
    let tempTag = createElementWithClassOrID(`button`, `class`, `tagButton ${tagName}Tag py-1 px-3`);
    tempTag.innerText = `${tagName}`;
    tempTag.style.setProperty('background', `${tagColor}`);
    addEventToFilterByTag(tempTag);

    closeTag = createElementWithClassOrID(`i`, `class`, `fa-solid fa-x`)
    closeTag.addEventListener(`click`, (e) => {

        confirmCustom(`Are you sure you want to remove ${e.target.parentNode.innerText} tag?`, removeTag, bookList.books, e.target.parentNode.innerText)

        // if (!confirm(`Are you sure you want to remove tag?`)) {
        //     addToPage(bookList.books); //refreshes book list after tag deletion
        //     return
        // }
        // removeTag(bookList.books, e.target.parentNode.innerText)
    })
    tempTag.appendChild(closeTag)
    tagButtons.appendChild(tempTag);
    addObjectToLocalStorage(bookList)
}

addTagForm.addEventListener("submit", (e) => {
    e.preventDefault();
    createNewTag(e);
    closeNewTagForm();
});



const addTagToBook = (e, obj) => {
    for (const book of obj.books) {
        if (book.id === e.target.id) {
            if (!Array.isArray(book.tag)) book.tag = []

            bookList.userSettings.allTags.forEach(element => {
                if (e.target.innerText === element[0]) {
                    if (book.tag.some(tag => tag[0] === element[0])) {
                        book.tag = book.tag.filter(tag => tag[0] !== element[0])
                        e.target.style.backgroundColor = ``
                        e.target.style.color = `black`;
                        removeTagReferenceToElement(grabChildByClassAndID(document.body, `${element}`, `${book.id}`));
                        notification(`Removed #${element[0]}`)
                        addObjectToLocalStorage(bookList)
                        return
                    }
                    if (!book.tag.some(tag => tag[0] === element[0])) {
                        book.tag.push(element)
                        e.target.style.backgroundColor = `${element[1]}`
                        e.target.style.color = `white`;
                        notification(`Added #${element[0]}`)
                        addTagReferenceToElement(grabChildByClassAndID(document.body, `tagColors`, `${book.id}`), element)
                        addObjectToLocalStorage(bookList)
                    }
                }
            })
        }
    }
}

const checkTagMatch = (bookTags, tag) => {
    if (Array.isArray(bookTags)) {
        for (const bookTag of bookTags) {
            if (bookTag[0] === tag[0]) {
                return bookTag[1]
            }
        }
    }
}

const colorTag = (color) => {
    if (color) {
        tempTag.style.backgroundColor = `${color}`
        tempTag.style.color = `white`;
    }
    console.log(color)
    console.log(tempTag)
}

const addTagReferenceToElement = (parentEl, tag) => {
    let tempTagEl = createElementWithClassOrID(`div`, `class`, `${tag}`);
    tempTagEl.setAttribute(`id`, `${parentEl.id}`);
    tempTagEl.style.backgroundColor = `${tag[1]}`;
    parentEl.appendChild(tempTagEl);
}

const removeTagReferenceToElement = (element) => {
    if (element) element.parentNode.removeChild(element)
}

let lastElement;
const addEventToFilterByTag = (...element) => {
    for (const el of element) el.addEventListener(`click`, () => {
            if (el.parentNode !== tagButtons) return // stops execustion if this tag was deleted (clicking to remove also clicks tag)
            if (lastElement === el && bookList.toggleParameters.tag) {
                setTimeout(()=>{ // delay corrects toggling issue
                    bookList.toggleParameters.toggleFilterByTag();
                }, 50)
            }
            if (lastElement !== el && bookList.toggleParameters.tag) { //this ensures that toggleFilterByTag runs again before the new tag is chosen
                if (typeof(lastElement) === `object`) bookList.toggleParameters.toggleFilterByTag(lastElement.innerText);
            }
            console.log(el.innerText);
            setTimeout(()=>{ // delay corrects toggling issue
                bookList.toggleParameters.toggleFilterByTag(el.innerText);
                lastElement = el;
            }, 50)
        })
}

const toggleTag = (e) => {
    let allTags = bookList.userSettings.allTags;
    let bookGrabbed = grabBookByID(bookList, e.target.id)
    for (let i = 0; i < allTags.length; i++) {
        if (bookGrabbed.tag === allTags[i][0]) {

            if (allTags[i + 1]) {
                bookGrabbed.tag = allTags[i + 1][0]
                e.target.style.setProperty('background', `${allTags[i + 1][1]}`);
            }
            else {
                bookGrabbed.tag = allTags[0][0]
                e.target.style.setProperty('background', `${allTags[0][1]}`);
            }
            if (bookGrabbed.tag === allTags[0][0]) notification(`Removed tags`)
            else notification(`Added to #${bookGrabbed.tag}`)
            addObjectToLocalStorage(bookList)
            return
        }
    }
    console.log(bookGrabbed.tag)
}

const setTag = (el) => {
    let allTags = bookList.userSettings.allTags;
    let bookGrabbed = grabBookByID(bookList, el.id)
    if (bookGrabbed.id === el.id) {
        for (let i = 0; i < allTags.length; i++) {
            if (bookGrabbed.tag === allTags[i][0]) {
                el.style.setProperty('background', `${allTags[i][1]}`);
            }
        }
    }
}

const initializeTags = () => { //for users that didn't have tag update
    for (const book of bookList.books) {
        if (!book.tag) book.tag = `none`;
    }
    addObjectToLocalStorage(bookList);
}

const titleTitle = document.querySelector('.titleTitle').addEventListener('click', () => {
    bookList.toggleParameters.filterAlphabetically('title');
    bookList.toggleParameters.removeClassesAndAddToPage(`bookInfo`, bookList);
    closeAndOpenSpotlight(bookList);
});

const authorTitle = document.querySelector('.authorTitle').addEventListener('click', () => {
    bookList.toggleParameters.filterAlphabetically('authors');
    bookList.toggleParameters.removeClassesAndAddToPage(`bookInfo`, bookList);
    closeAndOpenSpotlight(bookList);
});

const subjectTitle = document.querySelector('.subjectTitle').addEventListener('click', () => {
    bookList.toggleParameters.filterAlphabetically('subject');
    bookList.toggleParameters.removeClassesAndAddToPage(`bookInfo`, bookList);
    closeAndOpenSpotlight(bookList);
});

const addEventToAddToFavorite = (icon) => {
    icon.addEventListener(`click`, (e) => {
        for (const book of bookList.books)
            if (book.id === e.target.id) {
                if (!book.favorite) { // toggle false favorite to true on click
                    book.favorite = true;
                    icon.classList.add(`favorite`);
                    icon.classList.remove(`toggleHidden`);
                    notification(`Added To Favorites!`);
                    addObjectToLocalStorage(bookList)
                } else if (book.favorite) { // toggle true favorite to false on click
                    book.favorite = false;
                    icon.classList.remove(`favorite`);
                    if (icon.parentNode.nextSibling) {
                        if (icon.parentNode.nextSibling.classList[0] === "moreDetails") icon.classList.remove(`favorite`);
                    }
                    else icon.classList.add(`toggleHidden`);
                    notification(`Removed From Favorites`);
                    addObjectToLocalStorage(bookList)
                }
            }
    })
}

const submitAddBookForm = () => {
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
    tempFormBook.books[0].tag = [];
    addToObject(bookList, tempFormBook.books)
    addToPage(bookList.books)
    if (spotlightOpen) {
        toggleSpotlight(bookList)
        toggleSpotlight(bookList)
    }
    notification(`Added ${tempFormBook.books[0].title}!`)
    toggleAddBookContainer();
}

const submitAddBookButton = document.querySelector(`.submitAddBookButton`)
submitAddBookButton.addEventListener(`click`, submitAddBookForm)

const closeAddBookForm = () => {
    addBookContainer.classList.add(`toggleHidden`);
    notification(`Operation Cancelled`)
}

const toggleAddBookContainer = () => {
    if (!addBookButtonToggled) {
        addBookContainer.classList.remove(`toggleHidden`);
        addBookButtonToggled = true;
        return
    }
    if (addBookButtonToggled) {
        addBookContainer.classList.add(`toggleHidden`)
        addBookButtonToggled = false;
        return
    }
}

const addBookContainer = document.querySelector(`.addBookContainer`);
const addBookButton = document.querySelector(`.addBookButton`);
let addBookButtonToggled = false;
addBookButton.addEventListener(`click`, toggleAddBookContainer)

let favoriteIconToggled = false;
const toggleFavoriteButton = (e) => {
    if (!favoriteIconToggled) {
        addHighlightButton(e.target, `highlightButtonGold`);
        bookList.toggleParameters.toggleFilterByFavorite()
        favoriteIconToggled = true;
    } else if (favoriteIconToggled) {
        removeHighlightButton(e.target, `highlightButtonGold`);
        bookList.toggleParameters.toggleFilterByFavorite()
        favoriteIconToggled = false;
    }
}
favoriteFilter.addEventListener(`click`, toggleFavoriteButton)

const removeToggleManunally = () => {
    removeHighlightButton(favoriteFilter, `highlightButtonGold`);
    bookList.toggleParameters.toggleFilterByFavorite()
    favoriteIconToggled = false;
}

let deleteIconToggled = false;
const toggleDeleteButton = (e) => {
    if (!deleteIconToggled) {
        notification(`Delete mode activate`)
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
        notification(`Delete mode inactive`)
        for (i = 0; i < bookContainer.children.length; i++) {
            if (bookContainer.children[i].className.includes(`bookInfo`)) {
                deleteIcon = document.querySelector(`.deleteIcon`)
                if (bookContainer.children[i]) bookContainer.children[i].removeChild(deleteIcon);
            }
        }
        deleteIconToggled = false;
    }
}
deleteFilter.addEventListener(`click`, toggleDeleteButton);

const deleteBook = (e) => {
    bookList.books = bookList.books.filter(book => book.id !== e.target.id)
    toggleClasses(e.target.parentNode, `toggleSlideIn`, `toggleSlideOut`);
    let tempTitle = grabChildNodeByClass(e.target.parentNode.firstChild, `title`) //to provide inner text to notification
    notification(`${tempTitle.innerText} Deleted`);
    setTimeout(() => {
        removeElement(e.target.parentNode)
        addObjectToLocalStorage(bookList)
        closeAndOpenSpotlight(bookList)
    }, 500)
}

let editIconToggled = false;
const toggleEditButton = (e) => {
    if (!editIconToggled) {
        notification(`Edit mode activate`)
        for (i = 0; i < bookContainer.children.length; i++) {
            if (bookContainer.children[i].className.includes(`bookInfo`)) {
                editIcon = document.createElement(`i`) //icon for book deletion
                editIcon.setAttribute(`class`, `editIcon fa-regular fa-pen-to-square`);
                editIcon.setAttribute('id', `${bookContainer.children[i].id}`);
                bookContainer.children[i].appendChild(editIcon);
                editIcon.addEventListener(`click`, (e) => openEditBookForm(bookList, e));
            }
        }
        editIconToggled = true;
    } else if (editIconToggled) {
        notification(`Edit mode inactive`)
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
const openEditBookForm = (object, e) => {
    if (e.target) bookToEdit = object.books.filter(book => book.id === e.target.id) //if from event listener
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
    addToPage(bookList.books);
    closeAndOpenSpotlight(bookList)
    notification(`Saved changes to ${book[0].title}!`)
    toggleEditButton(editFilter)
    openEditBookForm(bookList, editBookContainer)
};

submitEditBookButton = document.querySelector(`.submitEditBookButton`);
submitEditBookButton.addEventListener(`click`, () => {
    submitEditBookForm(bookToEdit, editBookForm);
})

const cancelEditBookForm = () => {
    toggleEditButton(editFilter)
    openEditBookForm(bookList, editBookContainer);
}

cancelEditBookButton = document.querySelector(`.cancelEditBookButton`);
cancelEditBookButton.addEventListener(`click`, () => {
    cancelEditBookForm(editBookForm);
})

const coverTitle = document.querySelector(`.coverTitle`);
let coverToggled = false;
const toggleLineHeight = () => {
    bookLines = bookContainer.childNodes
    for (const bookLine of bookLines) { 
        if (typeof(bookLine.className) === 'string') {
            if (bookLine.className.includes('bookListHeader') && coverToggled === true) coverTitle.classList.add('removeCover'); 
            else if (bookLine.className.includes('bookListHeader') && coverToggled === false) coverTitle.classList.remove('removeCover');
            if (bookLine.className.includes('bookInfo')) {
                if (coverToggled) {
                    if (!bookLine.className.includes('removeCover')) bookLine.classList.add('removeCover');
                }
                if (!coverToggled) {
                    if (bookLine.className.includes('removeCover')) bookLine.classList.remove('removeCover');
                }
            }
        }
    }
}
const toggleLineHeightButton = document.querySelector(`.toggleLineHeight`).addEventListener(`click`, () => {
    if (!coverToggled) coverToggled = true;
    else coverToggled = false;
    toggleLineHeight();
})

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

///////////////////////////////////////////////////
// download and upload JSON below
/////////////////////////////////////////////////

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

const input = document.querySelector(`#file-selector`)
input.type = "file";
input.addEventListener("change", async event => {
    const json = JSON.parse(await input.files[0].text());
    confirmCustom(`Are you sure you want to import this book list? Doing so will replace the books on this page.`, importBookList, json)
});

const importBookList = (json) => {
    addObjectToLocalStorage(json)
    bookList.books = [];
    addToObject(bookList, json.books, json.userSettings);
    location.reload();
    addToPage(bookList.books);
}