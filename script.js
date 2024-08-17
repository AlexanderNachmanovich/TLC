document.addEventListener("DOMContentLoaded", () => {
  const points = document.querySelectorAll(".point");
  const modal = document.getElementById("modal");
  const modalOverlay = document.querySelector(".modal-overlay");
  const modalContent = document.querySelector(".modal-content");
  const modalVideo = document.getElementById("modal-video");
  const videoTitle = document.getElementById("video-title");
  const modalText = document.getElementById("modal-text");
  const closeBtn = document.querySelector(".close");
  const clickSound = document.getElementById("click-sound");
  const imageWrapper = document.getElementById("image-wrapper");
  const mapContainer = document.getElementById("map-container");
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");

  let scale = 1;
  const maxScale = 1.8; // Максимальное увеличение до 80%
  const scaleFactor = 0.2;
  let isDragging = false;
  let startX, startY, initialX, initialY;
  let lastTouchEnd = 0;
  let canZoom = true; // Флаг для задержки

  points.forEach((point) => {
    const x = parseFloat(point.getAttribute("data-x"));
    const y = parseFloat(point.getAttribute("data-y"));
    setPosition(point, x, y);

    point.addEventListener("click", (e) => {
      clickSound.play();
      const videoSrc = e.target.getAttribute("data-video");
      const title = e.target.getAttribute("data-title");
      const text = e.target.getAttribute("data-text");
      videoTitle.textContent = title;
      if (videoSrc) {
        modalContent.classList.remove("text-modal");
        modalContent.classList.add("video-modal");
        modalVideo.src = videoSrc;
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

  zoomInBtn.addEventListener("click", () => {
    if (!canZoom) return;
    scale = Math.min(maxScale, scale + scaleFactor);
    updateScale();
    canZoom = false; // Блокируем дальнейшее увеличение на 0.2 секунды
    setTimeout(() => {
      canZoom = true;
    }, 200);
  });

  zoomOutBtn.addEventListener("click", () => {
    if (!canZoom) return;
    scale = Math.max(1, scale - scaleFactor);
    updateScale();
    canZoom = false; // Блокируем дальнейшее уменьшение на 0.2 секунды
    setTimeout(() => {
      canZoom = true;
    }, 200);
  });

  mapContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (!canZoom) return;
    const zoomFactor = e.deltaY < 0 ? scaleFactor : -scaleFactor;
    scale = Math.min(maxScale, Math.max(1, scale + zoomFactor));
    updateScale();
    canZoom = false; // Блокируем дальнейшее увеличение/уменьшение на 0.2 секунды
    setTimeout(() => {
      canZoom = true;
    }, 200);
  });

  function updateScale() {
    const rect = mapContainer.getBoundingClientRect();
    const newWidth = rect.width * scale;
    const newHeight = rect.height * scale;
    imageWrapper.style.transform = `scale(${scale})`;

    // Центрирование по середине контейнера
    const offsetX = (rect.width - newWidth) / 2;
    const offsetY = (rect.height - newHeight) / 2;
    imageWrapper.style.left = `${offsetX}px`;
    imageWrapper.style.top = `${offsetY}px`;

    points.forEach((point) => {
      const x = parseFloat(point.getAttribute("data-x"));
      const y = parseFloat(point.getAttribute("data-y"));
      setPosition(point, x, y);
    });
  }

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

  mapContainer.addEventListener("touchstart", handleTouchStart, false);
  mapContainer.addEventListener("touchmove", handleTouchMove, false);
  mapContainer.addEventListener("touchend", handleTouchEnd, false);

  let x1 = null;
  let y1 = null;
  let x2 = null;
  let y2 = null;
  let initialDistance = null;

  function handleTouchStart(e) {
    const touches = e.touches;
    if (touches.length === 2) {
      x1 = touches[0].clientX;
      y1 = touches[0].clientY;
      x2 = touches[1].clientX;
      y2 = touches[1].clientY;
      initialDistance = getDistance(x1, y1, x2, y2);
    } else if (touches.length === 1) {
      isDragging = true;
      startX = touches[0].clientX;
      startY = touches[0].clientY;
      initialX = imageWrapper.offsetLeft;
      initialY = imageWrapper.offsetTop;
      mapContainer.style.cursor = "grabbing";
    }
  }

  function handleTouchMove(e) {
    const touches = e.touches;
    if (touches.length === 2) {
      const newX1 = touches[0].clientX;
      const newY1 = touches[0].clientY;
      const newX2 = touches[1].clientX;
      const newY2 = touches[1].clientY;
      const newDistance = getDistance(newX1, newY1, newX2, newY2);

      if (initialDistance) {
        const zoomFactor =
          ((newDistance - initialDistance) / initialDistance) * scaleFactor;
        scale = Math.min(maxScale, Math.max(1, scale + zoomFactor));
        updateScale();
        initialDistance = newDistance;
      }
    } else if (touches.length === 1 && isDragging) {
      const x = touches[0].clientX - startX + initialX;
      const y = touches[0].clientY - startY + initialY;
      imageWrapper.style.left = `${x}px`;
      imageWrapper.style.top = `${y}px`;
    }
  }

  function handleTouchEnd(e) {
    if (e.timeStamp - lastTouchEnd <= 300) {
      e.preventDefault();
      return;
    }
    lastTouchEnd = e.timeStamp;
    isDragging = false;
    mapContainer.style.cursor = "grab";
  }

  function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
});
