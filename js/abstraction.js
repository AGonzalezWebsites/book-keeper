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