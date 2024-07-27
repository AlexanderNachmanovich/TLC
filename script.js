document.addEventListener("DOMContentLoaded", () => {
  const points = document.querySelectorAll(".point");
  const modal = document.getElementById("modal");
  const modalOverlay = document.querySelector(".modal-overlay");
  const modalContent = document.querySelector(".modal-content");
  const modalVideo = document.getElementById("modal-video");
  const videoTitle = document.getElementById("video-title");
  const closeBtn = document.querySelector(".close");
  const clickSound = document.getElementById("click-sound");
  const backgroundVideo = document.getElementById("background-video");
  const videoWrapper = document.getElementById("video-wrapper");
  const mapContainer = document.getElementById("map-container");
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");
  let scale = 1;
  const scaleFactor = 0.2;
  let isDragging = false;
  let startX, startY, initialX, initialY;

  points.forEach((point) => {
    const x = parseFloat(point.getAttribute("data-x"));
    const y = parseFloat(point.getAttribute("data-y"));
    setPosition(point, x, y);

    point.addEventListener("click", (e) => {
      clickSound.play();
      const videoSrc = e.target.getAttribute("data-video");
      const title = e.target.getAttribute("data-title");
      modalVideo.src = videoSrc;
      videoTitle.textContent = title;
      modal.style.display = "block";
      modalVideo.play();
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    modalVideo.pause();
    modalVideo.src = "";
  });

  modalOverlay.addEventListener("click", () => {
    modal.style.display = "none";
    modalVideo.pause();
    modalVideo.src = "";
  });

  zoomInBtn.addEventListener("click", () => {
    scale += scaleFactor;
    updateScale();
  });

  zoomOutBtn.addEventListener("click", () => {
    scale = Math.max(1, scale - scaleFactor);
    updateScale();
  });

  function updateScale() {
    videoWrapper.style.transform = `scale(${scale})`;
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
