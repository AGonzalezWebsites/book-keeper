const setColorScheme = (colorSchemeChosen) => {
    let r = document.querySelector(':root');
    var rs = getComputedStyle(r);

    if (colorSchemeChosen === "hazlenut") {
        r.style.setProperty('--primary-100', '#BFAE9F');
        r.style.setProperty('--primary-200', '#937962');
        r.style.setProperty('--primary-300', '#FFFFFF');
        r.style.setProperty('--accent-100', '#C9BEB9');
        r.style.setProperty('--accent-200', '#978178');
        r.style.setProperty('--text-100', '#4D4D4D');
        r.style.setProperty('--text-200', '#9e9e9e');
        r.style.setProperty('--bg-100', '#F5EFE8');
        r.style.setProperty('--bg-200', '#EEE3D7');
        r.style.setProperty('--bg-300', '#FFFFFF');
        r.style.setProperty('--bg-100-darker', '#f4ebe1');
        r.style.setProperty('--bg-200-darker', '#eee1d2');
    }

    if (colorSchemeChosen === "midnight") {
        r.style.setProperty('--primary-100', '#cfcfcf');
        r.style.setProperty('--primary-200', '#b9b9b9');
        r.style.setProperty('--primary-300', '#5c5c5c');
        r.style.setProperty('--accent-100', '#7F7F7F');
        r.style.setProperty('--accent-200', '#ffffff');
        r.style.setProperty('--text-100', '#d8d8d8');
        r.style.setProperty('--text-200', '#777777');
        r.style.setProperty('--bg-100', '#000000');
        r.style.setProperty('--bg-200', '#161616');
        r.style.setProperty('--bg-300', '#2c2c2c');
        r.style.setProperty('--bg-100-darker', '#000000');
        r.style.setProperty('--bg-200-darker', '#161616');
    }

    if (colorSchemeChosen === "blueSteel") {
        r.style.setProperty('--primary-100', '#2C3E50');
        r.style.setProperty('--primary-200', '#57687c');
        r.style.setProperty('--primary-300', '#b4c7dd');
        r.style.setProperty('--accent-100', '#F7CAC9');
        r.style.setProperty('--accent-200', '#926b6a');
        r.style.setProperty('--text-100', '#333333');
        r.style.setProperty('--text-200', '#5c5c5c');
        r.style.setProperty('--bg-100', '#F2F2F2');
        r.style.setProperty('--bg-200', '#e8e8e8');
        r.style.setProperty('--bg-300', '#bfbfbf');
        r.style.setProperty('--bg-100-darker', '#eaeaea');
        r.style.setProperty('--bg-200-darker', '#e2e2e2');

    }

    if (colorSchemeChosen === "peachIvory") {
        r.style.setProperty('--primary-100', '#8B6B61');
        r.style.setProperty('--primary-200', '#bc998e');
        r.style.setProperty('--primary-300', '#fffdf1');
        r.style.setProperty('--accent-100', '#F2A900');
        r.style.setProperty('--accent-200', '#854e00');
        r.style.setProperty('--text-100', '#4D4D4D');
        r.style.setProperty('--text-200', '#797979');
        r.style.setProperty('--bg-100', '#F5ECD7');
        r.style.setProperty('--bg-200', '#ebe2cd');
        r.style.setProperty('--bg-300', '#c2baa6');
        r.style.setProperty('--bg-100-darker', '#f4ead3');
        r.style.setProperty('--bg-200-darker', '#e9dfc6');
    }

    if (colorSchemeChosen === "cobaltBeige") {
        r.style.setProperty('--primary-100', '#1e295a');
        r.style.setProperty('--primary-200', '#4c5187');
        r.style.setProperty('--primary-300', '#cbcbdd');
        r.style.setProperty('--accent-100', '#F18F01');
        r.style.setProperty('--accent-200', '#833500');
        r.style.setProperty('--text-100', '#353535');
        r.style.setProperty('--text-200', '#5f5f5f');
        r.style.setProperty('--bg-100', '#ede8db');
        r.style.setProperty('--bg-200', '#e2ded5');
        r.style.setProperty('--bg-300', '#d4d1c9');
        r.style.setProperty('--bg-100-darker', '#f3ede2');
        r.style.setProperty('--bg-200-darker', '#dad6cd');
    }

    bookList.userSettings.colorScheme = colorSchemeChosen;
    addObjectToLocalStorage(bookList)
}

const hazenutColor = document.querySelector(`.hazenutColor`)
const darkColor = document.querySelector(`.darkColor`)
const blueSteelColor = document.querySelector(`.blueSteelColor`)
const peachIvoryColor = document.querySelector(`.peachIvory`)
const cobaltBeigeColor = document.querySelector(`.cobaltBeige`)
darkColor.addEventListener(`click`, () => setColorScheme(`midnight`))
hazenutColor.addEventListener(`click`, () => setColorScheme(`hazlenut`))
blueSteelColor.addEventListener(`click`, () => setColorScheme(`blueSteel`))
peachIvoryColor.addEventListener(`click`, () => setColorScheme(`peachIvory`))
cobaltBeigeColor.addEventListener(`click`, () => setColorScheme(`cobaltBeige`))