const checkedComments = new Set(); // Stores processed DOM nodes
let commentQueue = [];
let isProcessing = false;

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
  while (blurWrapper.firstChild) {
    commentContainer.insertBefore(blurWrapper.firstChild, blurWrapper);
  }
  blurWrapper.remove();
  overlay.remove();
  commentContainer.classList.remove("tox-comment-container");

  const menuRenderer = commentContainer.querySelector("ytd-menu-renderer");
  if (menuRenderer) {
    const reblurBtn = document.createElement("button");
    reblurBtn.classList.add("tox-reblur-btn");
    reblurBtn.innerText = "Reblur";
    reblurBtn.addEventListener("click", () => {
      reblurBtn.remove();
      applyBlur(commentContainer);
    });

    menuRenderer.parentElement.insertBefore(reblurBtn, menuRenderer.nextSibling);
  }
}

function enqueueNewComments() {
  const allComments = document.querySelectorAll("#content-text");

  allComments.forEach(node => {
    const container = node.closest("ytd-comment-thread-renderer");
    if (container && !checkedComments.has(container)) {
      commentQueue.push({ text: node.innerText.trim(), container });
      checkedComments.add(container);
    }
  });

  if (!isProcessing) {
    processCommentQueue();
  }
}

async function processCommentQueue(batchSize = 10) {
  isProcessing = true;

  while (commentQueue.length > 0) {
    const batch = commentQueue.splice(0, batchSize);

    const promises = batch.map(({ text, container }) =>
      new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: "CHECK_TOXICITY", comment: text },
          (response) => {
            if (response && response.success && isToxic(response.data.predictions)) {
              applyBlur(container);
            }
            resolve(); // Always resolve
          }
        );
      })
    );

    await Promise.all(promises);
  }

  isProcessing = false;
}

const observer = new MutationObserver(() => {
  enqueueNewComments();
});

observer.observe(document.body, { childList: true, subtree: true });

window.addEventListener("load", enqueueNewComments);
setInterval(() => {
     processCommentQueue();
} , 2000);