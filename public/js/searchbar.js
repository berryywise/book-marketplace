document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("#searchQuery");

    searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("searchQuery").submit();
        }
    })
})