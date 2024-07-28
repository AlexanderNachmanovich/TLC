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
  const backgroundVideo = document.getElementById("background-video");
  const videoWrapper = document.getElementById("video-wrapper");
  const mapContainer = document.getElementById("map-container");
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");
  let scale = 1;
  const maxScale = 1.8; // Максимальное увеличение до 80%
  const scaleFactor = 0.2;
  let isDragging = false;
  let startX, startY, initialX, initialY;
  let lastTouchEnd = 0;

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
    scale = Math.min(maxScale, scale + scaleFactor);
    updateScale(mapContainer.clientWidth / 2, mapContainer.clientHeight / 2);
  });

  zoomOutBtn.addEventListener("click", () => {
    scale = Math.max(1, scale - scaleFactor);
    updateScale(mapContainer.clientWidth / 2, mapContainer.clientHeight / 2);
  });

  mapContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? scaleFactor : -scaleFactor;
    scale = Math.min(maxScale, Math.max(1, scale + zoomFactor));
    const rect = videoWrapper.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width;
    const offsetY = (e.clientY - rect.top) / rect.height;
    updateScale(e.clientX, e.clientY, offsetX, offsetY);
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
      initialX = videoWrapper.offsetLeft;
      initialY = videoWrapper.offsetTop;
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
        const midX = (newX1 + newX2) / 2;
        const midY = (newY1 + newY2) / 2;
        const rect = videoWrapper.getBoundingClientRect();
        const offsetX = (midX - rect.left) / rect.width;
        const offsetY = (midY - rect.top) / rect.height;
        updateScale(midX, midY, offsetX, offsetY);
        initialDistance = newDistance;
      }
    } else if (touches.length === 1 && isDragging) {
      const x = touches[0].clientX - startX + initialX;
      const y = touches[0].clientY - startY + initialY;
      videoWrapper.style.left = `${x}px`;
      videoWrapper.style.top = `${y}px`;
      constrainMap();
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

  function updateScale(centerX, centerY, offsetX = 0.5, offsetY = 0.5) {
    const rect = videoWrapper.getBoundingClientRect();
    const newWidth = rect.width * scale;
    const newHeight = rect.height * scale;
    const deltaX = (centerX - rect.left) * (scale - 1);
    const deltaY = (centerY - rect.top) * (scale - 1);
    videoWrapper.style.transform = `scale(${scale})`;
    videoWrapper.style.left = `${initialX - deltaX}px`;
    videoWrapper.style.top = `${initialY - deltaY}px`;
    points.forEach((point) => {
      const x = parseFloat(point.getAttribute("data-x"));
      const y = parseFloat(point.getAttribute("data-y"));
      setPosition(point, x, y);
    });
    constrainMap();
  }

  function setPosition(point, x, y) {
    point.style.left = `${x}%`;
    point.style.top = `${y}%`;
  }

  function constrainMap() {
    const rect = mapContainer.getBoundingClientRect();
    const videoRect = videoWrapper.getBoundingClientRect();
    if (videoRect.left > rect.left) {
      videoWrapper.style.left = "0";
    }
    if (videoRect.top > rect.top) {
      videoWrapper.style.top = "0";
    }
    if (videoRect.right < rect.right) {
      videoWrapper.style.left = `${rect.width - videoRect.width}px`;
    }
    if (videoRect.bottom < rect.bottom) {
      videoWrapper.style.top = `${rect.height - videoRect.height}px`;
    }
  }

  mapContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = videoWrapper.offsetLeft;
    initialY = videoWrapper.offsetTop;
    mapContainer.style.cursor = "grabbing";
  });

  mapContainer.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const x = e.clientX - startX + initialX;
      const y = e.clientY - startY + initialY;
      videoWrapper.style.left = `${x}px`;
      videoWrapper.style.top = `${y}px`;
      constrainMap();
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
});
