document.addEventListener("DOMContentLoaded", () => {
    fetchQuotes();
    document.getElementById("new-quote-form").addEventListener("submit", addQuote);
});

function fetchQuotes(sortBy = "id") {
    const url = sortBy === "author" ? "http://localhost:3000/quotes?_sort=author&_embed=likes" 
                                    : "http://localhost:3000/quotes?_embed=likes";

    fetch(url)
        .then(res => res.json())
        .then(quotes => renderQuotes(quotes));
}

function renderQuotes(quotes) {
    const quoteList = document.getElementById("quote-list");
    quoteList.innerHTML = ""; // Clear list before rendering

    quotes.forEach(quote => {
        let li = document.createElement("li");
        li.className = "quote-card";
        li.innerHTML = `
            <blockquote class="blockquote">
                <p class="mb-0">${quote.quote}</p>
                <footer class="blockquote-footer">${quote.author}</footer>
                <br>
                <button class='btn-success'>Likes: <span>${quote.likes.length}</span></button>
                <button class='btn-danger'>Delete</button>
                <button class='btn-edit'>Edit</button>
            </blockquote>
        `;

        li.querySelector(".btn-success").addEventListener("click", () => likeQuote(quote, li));
        li.querySelector(".btn-danger").addEventListener("click", () => deleteQuote(quote.id, li));
        li.querySelector(".btn-edit").addEventListener("click", () => editQuote(quote, li));

        quoteList.appendChild(li);
    });
}

function addQuote(event) {
    event.preventDefault();
    let newQuote = {
        quote: document.getElementById("new-quote").value,
        author: document.getElementById("author").value,
        likes: []
    };

    fetch("http://localhost:3000/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuote)
    })
    .then(res => res.json())
    .then(quote => fetchQuotes()); // Refresh the list
}

function deleteQuote(id, element) {
    fetch(`http://localhost:3000/quotes/${id}`, { method: "DELETE" })
        .then(() => element.remove());
}

function likeQuote(quote, element) {
    let newLike = { quoteId: quote.id, createdAt: Math.floor(Date.now() / 1000) };

    fetch("http://localhost:3000/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLike)
    })
    .then(() => {
        let likeCount = element.querySelector("span");
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
    });
}

function editQuote(quote, element) {
    let newQuoteText = prompt("Edit Quote:", quote.quote);
    let newAuthorText = prompt("Edit Author:", quote.author);
    
    if (newQuoteText && newAuthorText) {
        fetch(`http://localhost:3000/quotes/${quote.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quote: newQuoteText, author: newAuthorText })
        })
        .then(() => fetchQuotes()); // Refresh the list
    }
}

// Sort Button
document.getElementById("sort-button").addEventListener("click", () => {
    let sortedByAuthor = document.getElementById("sort-button").dataset.sorted === "false";
    fetchQuotes(sortedByAuthor ? "author" : "id");
    document.getElementById("sort-button").dataset.sorted = sortedByAuthor.toString();
});
