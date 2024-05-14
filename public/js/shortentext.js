document.addEventListener("DOMContentLoaded", function() {
        let cardDescriptions = document.querySelectorAll("#card_description");

        cardDescriptions.forEach(card => {
            if (card.innerText.length >= 65) {
                card.innerText = card.innerText.substring(0, 65 - 3) + "...";
            }
        });
});