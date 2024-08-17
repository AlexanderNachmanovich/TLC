document.addEventListener("DOMContentLoaded", () => {
  const points = document.querySelectorAll(".point");
  const imageWrapper = document.getElementById("image-wrapper");
  const mapContainer = document.getElementById("map-container");
  const modal = document.getElementById("modal");
  const modalOverlay = document.querySelector(".modal-overlay");
  const modalContent = document.querySelector(".modal-content");
  const modalVideo = document.getElementById("modal-video");
  const videoTitle = document.getElementById("video-title");
  const modalText = document.getElementById("modal-text");
  const closeBtn = document.querySelector(".close");
  const clickSound = document.getElementById("click-sound");
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");

  let scale = 1;
  const maxScale = 1.8;
  const scaleFactor = 0.2;
  let isDragging = false;
  let startX, startY, initialX, initialY;
  let initialDistance = null;

  imageWrapper.addEventListener("dragstart", (e) => {
    e.preventDefault();
  });

  points.forEach((point) => {
    const x = parseFloat(point.getAttribute("data-x"));
    const y = parseFloat(point.getAttribute("data-y"));
    setPosition(point, x, y);

    point.addEventListener("click", (e) => {
      clickSound.play();
      const videoFile = e.target.getAttribute("data-video-file");
      const title = e.target.getAttribute("data-title");
      const text = e.target.getAttribute("data-text");
      videoTitle.textContent = title;
      if (videoFile) {
        modalContent.classList.remove("text-modal");
        modalContent.classList.add("video-modal");
        modalVideo.src = `images/${videoFile}`;
        modalVideo.style.display = "block";
        modalText.style.display = "none";
        modalVideo.play().catch((error) => {
          console.error("Error attempting to play the video:", error);
        });
      } else {
        modalContent.classList.remove("video-modal");
        modalContent.classList.add("text-modal");
        modalVideo.style.display = "none";
        modalText.style.display = "block";
        modalText.textContent = text;
      }
      modal.classList.add("show");
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("show");
    modalVideo.pause();
    modalVideo.src = "";
    modalText.textContent = "";
  });

  modalOverlay.addEventListener("click", () => {
    modal.classList.remove("show");
    modalVideo.pause();
    modalVideo.src = "";
    modalText.textContent = "";
  });

  function setPosition(point, x, y) {
    point.style.left = `${x}%`;
    point.style.top = `${y}%`;
  }

  mapContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = imageWrapper.offsetLeft;
    initialY = imageWrapper.offsetTop;
    mapContainer.style.cursor = "grabbing";
  });

  mapContainer.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const x = e.clientX - startX + initialX;
      const y = e.clientY - startY + initialY;
      imageWrapper.style.left = `${x}px`;
      imageWrapper.style.top = `${y}px`;
      restrictPan();
    }
  });

  mapContainer.addEventListener("mouseup", () => {
    isDragging = false;
    mapContainer.style.cursor = "grab";
  });

  mapContainer.addEventListener("mouseleave", () => {
    isDragging = false;
    mapContainer.style.cursor = "grab";
  });

  // Добавление поддержки жестов pinch для увеличения и уменьшения
  mapContainer.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      initialX = imageWrapper.offsetLeft;
      initialY = imageWrapper.offsetTop;
      mapContainer.style.cursor = "grabbing";
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialDistance = getDistance(e.touches[0], e.touches[1]);
    }
  });

  mapContainer.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isDragging) {
      const x = e.touches[0].clientX - startX + initialX;
      const y = e.touches[0].clientY - startY + initialY;
      imageWrapper.style.left = `${x}px`;
      imageWrapper.style.top = `${y}px`;
      restrictPan();
    } else if (e.touches.length === 2 && initialDistance) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      if (currentDistance > initialDistance + 10) {
        zoomIn();
        initialDistance = currentDistance;
      } else if (currentDistance < initialDistance - 10) {
        zoomOut();
        initialDistance = currentDistance;
      }
    }
  });

  mapContainer.addEventListener("touchend", () => {
    isDragging = false;
    mapContainer.style.cursor = "grab";
    initialDistance = null;
  });

  zoomInBtn.addEventListener("click", () => {
    zoomIn();
  });

  zoomOutBtn.addEventListener("click", () => {
    zoomOut();
  });

  mapContainer.addEventListener("wheel", (e) => {
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  });

  function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function zoomIn() {
    scale = Math.min(maxScale, scale + scaleFactor);
    updateTransform();
  }

  function zoomOut() {
    scale = Math.max(1, scale - scaleFactor);
    updateTransform();
  }

  function updateTransform() {
    imageWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
    restrictPan();
  }

  function restrictPan() {
    const containerRect = mapContainer.getBoundingClientRect();
    const wrapperRect = imageWrapper.getBoundingClientRect();

    let offsetX = 0;
    let offsetY = 0;

    if (wrapperRect.left > containerRect.left) {
      offsetX = containerRect.left - wrapperRect.left;
    }
    if (wrapperRect.right < containerRect.right) {
      offsetX = containerRect.right - wrapperRect.right;
    }
    if (wrapperRect.top > containerRect.top) {
      offsetY = containerRect.top - wrapperRect.top;
    }
    if (wrapperRect.bottom < containerRect.bottom) {
      offsetY = containerRect.bottom - wrapperRect.bottom;
    }

    imageWrapper.style.left = `${
      parseFloat(imageWrapper.style.left) + offsetX
    }px`;
    imageWrapper.style.top = `${
      parseFloat(imageWrapper.style.top) + offsetY
    }px`;
  }

  // Инициализация масштабирования и позиционирования
  updateTransform();
});
