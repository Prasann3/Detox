const checkedComments = new Set();

function isToxic(predictions) {
  return predictions.toxic > 0.5;
}

function applyBlur(commentContainer) {
  commentContainer.classList.add("tox-comment-container");
  const blurWrapper = document.createElement("div");
  blurWrapper.classList.add("tox-blur-wrapper");
  while (commentContainer.firstChild) {
    blurWrapper.appendChild(commentContainer.firstChild);
  }
  commentContainer.appendChild(blurWrapper);

  const overlay = document.createElement("div");
  overlay.classList.add("tox-overlay");
  overlay.innerText = "Show comment";
  overlay.addEventListener("click", () => removeBlur(commentContainer, blurWrapper, overlay));
  commentContainer.appendChild(overlay);
}

function removeBlur(commentContainer, blurWrapper, overlay) {
  // unwrap content
  while (blurWrapper.firstChild) {
    commentContainer.insertBefore(blurWrapper.firstChild, blurWrapper);
  }
  blurWrapper.remove();
  overlay.remove();
  commentContainer.classList.remove("tox-comment-container");

  // add reblur button next to YouTube's menu
  const menuRenderer = commentContainer.querySelector("ytd-menu-renderer");
  if (menuRenderer) {
    const reblurBtn = document.createElement("button");
    reblurBtn.classList.add("tox-reblur-btn");
    reblurBtn.innerText = "Reblur";
    reblurBtn.addEventListener("click", () => {
      reblurBtn.remove();
      applyBlur(commentContainer);
    });
    // insert after menu
    menuRenderer.parentElement.insertBefore(reblurBtn, menuRenderer.nextSibling);
  }
}

function scanComments() {
  const allComments = document.querySelectorAll("#content-text");
  const commentsToProcess = Array.from(allComments)
    .filter(node => {
      const text = node.innerText.trim();
      return text.length > 0 && !checkedComments.has(text);
    })
    .slice(0, 10);

  commentsToProcess.forEach(commentTextNode => {
    const commentContainer = commentTextNode.closest("ytd-comment-thread-renderer");
    const text = commentTextNode.innerText.trim();
    if (!commentContainer || checkedComments.has(text)) return;
    checkedComments.add(text);

    chrome.runtime.sendMessage(
      { type: "CHECK_TOXICITY", comment: text },
      (response) => {
        if (response && response.success && isToxic(response.data.predictions)) {
          applyBlur(commentContainer);
        } else if (!response || !response.success) {
          console.error("API error or no response");
        }
      }
    );
  });
}

const observer = new MutationObserver(scanComments);
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener("load", scanComments);