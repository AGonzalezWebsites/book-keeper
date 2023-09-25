//grouping all (general) small abstraction functions

const toStringIfArray = (x) => {
    if (Array.isArray(x)) {
        return x.toString()
    } else return x
}

const checkForDublicates = (object, ...objectToAdd) => {
    for (const book of object.books) {
        if (book.id === objectToAdd[0][0].id) { //objectToAdd[0][0] need to iterate through this if checking multiple
            return true
        }
    }
    return false
}

const addHighlightButton = (element, color) => {
    element.classList.add(`${color}`);
}

const removeHighlightButton = (element, color) => {
    if (element) element.classList.remove(`${color}`);
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

const pullBookFromObject = (object, id) => {
    selectedBookArray = []
    for (const book of object.books) {
        if (book.id === id) {
            selectedBookArray.push(book);
            return selectedBookArray;
        } 
    }
}

const reduceDecimal = (x, toFixed) => {
    return Number.parseFloat(x).toFixed(toFixed);
  }

const replaceUndefined = (...texts) => {
    for (const text of texts) {
        if (!text || text === `NaN`) return 'N/A'
        else return text
    } 
}

const createElementWithClassOrID = (element, idOrClass, idOrClassName) => {
    let tempElement = document.createElement(`${element}`)
    tempElement.setAttribute(`${idOrClass}`, `${idOrClassName}`)
    return tempElement
}

const createElementWithInnerText = (element, text) => {
    let tempElement = document.createElement(`${element}`)
    tempElement.innerText = `${text}`
    return tempElement
}

const removeElement = (element) => {
    if (element) {
        element.parentNode.removeChild(element)
    }
    else notification(`Unable to delete one or all items`)
}

// all grab functions compare a parent element with a node provided to see if parent has a child with that node
const grabIfExactChild = (parentEl, childNd) => {
    let result = false;
    for (let i = 0; i < parentEl.childNodes.length; i++) {
        if (parentEl.childNodes[i] === childNd) result === childNd;
    }
    return result;
}

const grabIfExactChildElement = (parentEl, childNd) => {
    let result = false;
    for (let i = 0; i < parentEl.childNodes.length; i++) {
        if (parentEl.childNodes[i].outerHTML[1] === childNd.outerHTML[1] && parentEl.childNodes[i].outerHTML[2] === childNd.outerHTML[2]) result = parentEl.childNodes[i]; //checks element type - if (outerHTML[1] & [2] is i" or p" or h2)
    }
    return result;
}

const grabChildNodeByClass = (parentEl, className) => {
    let result = false;
    for (let i = 0; i < parentEl.childNodes.length; i++) {
        if (parentEl.childNodes[i].classList) parentEl.childNodes[i].classList.forEach(classPulled => {
            if (classPulled === className) result = parentEl.childNodes[i]
        })
    }
    return result;
}

const grabBookByID = (object, bookID) => {
    for (const book of object.books) {
        if (book.id === bookID) return book;
    }
    return "Book not found";
}

// grabChildByClassAndID filters through all branches of children if more children are found
const grabChildByClassAndID = (element, className, idName) => {
    if (element.childNodes) {
        for (const node of element.childNodes) {
            if (node.nodeType != Node.TEXT_NODE && typeof(node.className) === 'string' && typeof(node.id) === 'string') {
                if (node.className.includes(`${className}`) && node.id.includes(`${idName}`)) {
                    console.log(node)
                    return node
                }
            }   
            if (node.childNodes) {
                const result = grabChildByClassAndID(node, className, idName);
                if (result) {
                    return result;
                }
            }
        }
    }
    return null;
}

const createContainerAndContentBox = () => {
    let tempArr = []
    tempArr[0] = createElementWithClassOrID(`div`, `class`, `flex justify-center items-center fixed top-0 left-0 h-screen w-screen bg-black/75 z-99`);
    tempArr[1] = createElementWithClassOrID(`div`, `class`, `flex flex-col justify-center items-center w-fit h-fit p-4 border-2 border-solid border-black rounded-lg bg-white`);
    return tempArr
}

const appendMultipleChildren = (parent, ...elems) => {
    for (const el of elems) {
        parent.appendChild(el)
    }
}

let timeoutId;
const notification = (message) => {
    if (!alertBox.classList[1]) clearNotification()
    textElement = document.createElement(`p`);
    textElement.innerText = `${message}`;
    alertBox.appendChild(textElement);
    alertBox.classList.remove(`toggleHidden`)
    if (timeoutId) {
        clearTimeout(timeoutId);
      }
    timeoutId = setTimeout(() => {
        if (!alertBox.classList[1]) clearNotification()
    }, 4000)
}

const clearNotification = () => {
    alertBox.removeChild(textElement);
    alertBox.classList.add(`toggleHidden`)
}

const confirmCustom = (msg, func, ...params) => { // up to 5 params to pass into function
    let confirmContainers = createContainerAndContentBox()

    let confirmMessage = createElementWithClassOrID(`p`, `class`, `confirmMessage self-center max-w-confirm text-center text-2xl p-4`)
    confirmMessage.innerText = `${msg}`

    let buttonContainer = createElementWithClassOrID(`button`, `class`, `buttonContainer flex justify-center items-center p-4`)
    let cancelButton = createElementWithClassOrID(`button`, `class`, `cancelButton p-4 min-w-b min-h-b bg-orange-600 border-solid border-black rounded-lg`)
    cancelButton.innerText = `No`
    cancelButton.addEventListener(`click`, () => {
        notification(`Cancelled`)
        document.body.removeChild(confirmContainers[0])
    })

    let submitButton = createElementWithClassOrID(`button`, `class`, `submitButton p-4 ml-4 min-w-b min-h-b bg-green-600 border-solid border-black rounded-lg`)
    submitButton.classList.add(`bg-green`)
    submitButton.innerText = `Yes`
    submitButton.addEventListener(`click`, () => {
        document.body.removeChild(confirmContainers[0])
        if (params) {
            if (params.length === 0) func()
            if (params.length === 1) func(params[0])
            if (params.length === 2) func(params[0], params[1])
            if (params.length === 3) func(params[0], params[1], params[2])
            if (params.length === 4) func(params[0], params[1], params[2], params[3])
            if (params.length === 5) func(params[0], params[1], params[2], params[3], params[4])
        } else func()
    })

    appendMultipleChildren(buttonContainer, cancelButton, submitButton);
    confirmContainers[1].appendChild(confirmMessage);
    confirmContainers[1].appendChild(buttonContainer);
    confirmContainers[0].appendChild(confirmContainers[1])
    document.body.appendChild(confirmContainers[0])
}