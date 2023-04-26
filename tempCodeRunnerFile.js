let currentNode = header.nextSibling;
    while (currentNode) {
      if (currentNode.tagName === "UL") {
        return currentNode.innerText;
      } else if (
        currentNode.tagName === "DIV" &&
        currentNode.querySelector("ul")
      ) {
        const ul = currentNode.querySelector("ul");
        return ul.innerText;
      }
      currentNode = currentNode.nextSibling || currentNode.firstElementChild;
    }

    return null;