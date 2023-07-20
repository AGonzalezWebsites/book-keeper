const fetchData = () => {
    return fetch("./reading-list.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            console.log(data);
            return data;
        });
}

async function getData() {
    try {
        const fetched = await fetchData();
        const booksInterestedInReading = fetched["Books interested in Reading "];
        console.log(booksInterestedInReading); // Now you can use the fetched data here
        return booksInterestedInReading; // Returning the specific data you want to assign to a variable
    } catch (error) {
        console.error("Error while fetching data:", error);
        throw error;
    }
}

// Usage:
let readingList;
getData().then((booksInterestedInReading) => {
    // Now you can use the fetched data here or assign it to a variable
    readingList = booksInterestedInReading;
}).catch((error) => {
    console.error("Error in getData:", error);
});
