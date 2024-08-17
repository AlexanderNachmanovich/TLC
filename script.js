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

  // Отключаем стандартное поведение перетаскивания изображения
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

  zoomInBtn.addEventListener("click", () => {
    scale = Math.min(maxScale, scale + scaleFactor);
    imageWrapper.style.transformOrigin = "center center";
    imageWrapper.style.transform = `scale(${scale})`;
  });

  zoomOutBtn.addEventListener("click", () => {
    scale = Math.max(1, scale - scaleFactor);
    imageWrapper.style.transformOrigin = "center center";
    imageWrapper.style.transform = `scale(${scale})`;
  });

  mapContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? scaleFactor : -scaleFactor;
    scale = Math.min(maxScale, Math.max(1, scale + zoomFactor));
    imageWrapper.style.transformOrigin = "center center";
    imageWrapper.style.transform = `scale(${scale})`;
  });

  mapContainer.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      initialX = imageWrapper.offsetLeft;
      initialY = imageWrapper.offsetTop;
      mapContainer.style.cursor = "grabbing";
    }
  });

  mapContainer.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isDragging) {
      const x = e.touches[0].clientX - startX + initialX;
      const y = e.touches[0].clientY - startY + initialY;
      imageWrapper.style.left = `${x}px`;
      imageWrapper.style.top = `${y}px`;
    }
  });

  mapContainer.addEventListener("touchend", () => {
    isDragging = false;
    mapContainer.style.cursor = "grab";
  });
});
