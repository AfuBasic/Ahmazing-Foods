// Weekend Specials — vote confirmation (local, one-tap-per-device) + share
// links that carry the dish name and point back to this page. No shared
// live count yet — see the note on the page about what a backend adds.

const SITE_URL = "https://ahmazingfoods.com/weekend-specials.html";

function hasVoted(cardId) {
  return localStorage.getItem("voted-" + cardId) === "true";
}

function markVoted(cardId) {
  localStorage.setItem("voted-" + cardId, "true");
}

function buildShareText(dishName, fishChoice) {
  const fishNote = fishChoice ? ` (${fishChoice})` : "";
  return `I'm voting for ${dishName}${fishNote} as this weekend's AHmazing Foods special! Vote for your favourite too:`;
}

function wireShareLinks(card) {
  const dish = card.dataset.dish;
  const cardUrl = `${SITE_URL}#${card.id}`;
  const fishSelect = card.querySelector(".fish-choice");

  function currentText() {
    return buildShareText(dish, fishSelect ? fishSelect.value : null);
  }

  const wa = card.querySelector(".share-wa");
  const fb = card.querySelector(".share-fb");
  const x = card.querySelector(".share-x");
  const copyBtn = card.querySelector(".share-copy");

  function refreshShareLinks() {
    const text = currentText();
    if (wa) wa.href = `https://wa.me/?text=${encodeURIComponent(text + " " + cardUrl)}`;
    if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}&quote=${encodeURIComponent(text)}`;
    if (x) x.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(cardUrl)}`;
  }
  refreshShareLinks();
  if (fishSelect) fishSelect.addEventListener("change", refreshShareLinks);

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(`${currentText()} ${cardUrl}`);
        const original = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(() => { copyBtn.textContent = original; }, 1500);
      } catch (err) {
        alert(`Copy this link: ${cardUrl}`);
      }
    });
  }
}

function wireVoteButton(card) {
  const btn = card.querySelector(".vote-btn");
  const confirmEl = card.querySelector(".vote-confirm");
  const cardId = card.id;
  const fishSelect = card.querySelector(".fish-choice");

  if (hasVoted(cardId)) {
    btn.style.display = "none";
    confirmEl.style.display = "block";
  }

  btn.addEventListener("click", () => {
    if (fishSelect && !fishSelect.value) {
      alert("Please choose your fish before voting.");
      fishSelect.focus();
      return;
    }
    markVoted(cardId);
    btn.style.display = "none";
    confirmEl.style.display = "block";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".vote-card").forEach(card => {
    wireVoteButton(card);
    wireShareLinks(card);
  });
});
