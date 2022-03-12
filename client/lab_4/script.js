let slidePosition = 0;
const slides = document.querySelectorAll('carousel-item');
const totalSlides = slides.length;

document.querySelector('next-button').addEventListener("click", function() {
  moveToNextSlide();
});

document.querySelector('prev-button').addEventListener("click", function() {
  moveToPrevSlide();
});

function updateSlidePosition() {
  for (let slide of slides) {
    slide.classList.remove('carousel-item--visible');
    slide.classList.add('carousel-item--hidden');
  }
  slides[slidePosition].classList.add('carousel-item--visible');
}
function moveToNextSlide() {
  updateSlidePosition();
  if (slidePosition === totalSlides - 1) {
    slidePosition = 0;
  } else {
    slidePosition++;
  }
}
function moveToPrevSlide() {
  if (slidePosition === 0) {
    slidePosition = totalSlides - 1;
  } else {
    slidePosition--;
  }

  updateSlidePosition();
}

