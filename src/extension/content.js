
const checkedComments = new Set();

function isToxic(predictions) {
  return predictions.toxic > 0.5;
}

function scanComments() {
  const allComments = document.querySelectorAll("#content-text");

  const commentsToProcess = Array.from(allComments)
    .filter(node => {
      const text = node.innerText.trim();
      return text.length > 0 && !checkedComments.has(text);
    })
    .slice(0, 10); // Limit processing per batch

  commentsToProcess.forEach(commentTextNode => {
    const commentContainer = commentTextNode.closest("ytd-comment-thread-renderer");
    const text = commentTextNode.innerText.trim();

    if (!commentContainer || checkedComments.has(text)) return;

    // Add to set early to avoid duplicates during async
    checkedComments.add(text);

    chrome.runtime.sendMessage({ type: "CHECK_TOXICITY", comment: text }, (response) => {
      if (!response) {
        console.error("No response from background");
        return;
      }

      if (response.success) {
        const toxic = isToxic(response.data.predictions);

        if (toxic) {
      const originalContent = commentContainer.cloneNode(true);
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

      // Create a wrapper with frosted blur
      const blurWrapper = document.createElement("div");
      blurWrapper.style.position = "relative";
      blurWrapper.style.overflow = "hidden";
      blurWrapper.style.borderRadius = "12px";
      blurWrapper.style.transition = "filter 0.3s ease";
      blurWrapper.style.filter = isDarkMode
        ? "blur(6px) brightness(0.8)"
        : "blur(6px) brightness(1)";
      blurWrapper.style.pointerEvents = "none";

      const blurredContent = commentContainer.cloneNode(true);
      blurWrapper.appendChild(blurredContent);

      commentContainer.innerHTML = "";
      commentContainer.style.position = "relative";
      commentContainer.appendChild(blurWrapper);

      // Overlay
      const overlay = document.createElement("div");
      overlay.innerText = "Click to view";
      Object.assign(overlay.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: isDarkMode
          ? "rgba(30, 30, 30, 0.5)"
          : "rgba(240, 240, 240, 0.5)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        color: isDarkMode ? "#fff" : "#000",
        fontSize: "18px",
        fontWeight: "600",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "10",
        cursor: "pointer",
        borderRadius: "12px",
        transition: "background 0.3s ease",
      });

      overlay.addEventListener("mouseover", () => {
        overlay.style.background = isDarkMode
          ? "rgba(30, 30, 30, 0.65)"
          : "rgba(220, 220, 220, 0.65)";
      });

      overlay.addEventListener("mouseout", () => {
        overlay.style.background = isDarkMode
          ? "rgba(30, 30, 30, 0.5)"
          : "rgba(240, 240, 240, 0.5)";
      });

      overlay.addEventListener("click", () => {
        commentContainer.innerHTML = "";
        commentContainer.appendChild(originalContent);
      });

      commentContainer.appendChild(overlay);
    }



      } else {
        console.error("API error:", response.error);
      }
    });
  });
}


const observer = new MutationObserver(scanComments);
observer.observe(document.body, { childList: true, subtree: true });

window.addEventListener("load", scanComments);
