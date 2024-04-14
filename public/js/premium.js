function updatePrice(price) {
  const priceElement = document.getElementById("price");
  priceElement.textContent = "Selected Tier Price: " + price;
}

// Event listeners for subscription cards
document.addEventListener("DOMContentLoaded", function () {
  const lowTier = document.getElementById("low-tier");
  const midTier = document.getElementById("mid-tier");
  const highTier = document.getElementById("high-tier");

  lowTier.addEventListener("click", () => {
    updatePrice("$100");
  });

  midTier.addEventListener("click", () => {
    updatePrice("$500");
  });

  highTier.addEventListener("click", () => {
    updatePrice("$1850");
  });
});
