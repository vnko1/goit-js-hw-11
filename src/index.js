import { Notify } from 'notiflix';
import { Spinner } from 'spin.js';
import throttle from 'lodash.throttle';
import SimpleLightbox from 'simplelightbox';
import FetchImages from './js/FetchImages';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'spin.js/spin.css';

const noMatchMessage =
  'Sorry, there are no images matching your search query. Please try again.';
const finishedImageMessage =
  "We're sorry, but you've reached the end of search results.";

const fetchImages = new FetchImages();
const spinner = new Spinner({
  color: 'teal',
  position: 'fixed',
  top: '50vh',
  left: '50vw',
});
let simplelightbox = null;

const formEl = document.querySelector('.search-form');
const imageContainer = document.querySelector('.gallery');

formEl.addEventListener('submit', onHandleSubmit);

async function onHandleSubmit(e) {
  e.preventDefault();
  window.removeEventListener('scroll', onHandleScroll);
  const { searchQuery } = e.currentTarget.elements;
  fetchImages.query = searchQuery.value.trim();

  fetchImages.resetPage();
  imageContainer.innerHTML = '';

  if (fetchImages.query === '') return;

  await fetchData()
    .catch(error => failureLog(error.message))
    .finally(() => spinner.stop());

  simplelightbox = new SimpleLightbox('.gallery a');

  window.addEventListener('scroll', throttle(onHandleScroll, 500));

  if (fetchImages.totalHits > 0) {
    Notify.info(`Hooray! We found ${fetchImages.totalHits} images.`, {
      clickToClose: true,
    });
  }
}

function onHandleScroll() {
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight
  ) {
    fetchImages.updatePage();

    const isLimit = fetchImages.totalPage > fetchImages.totalHits;

    if (isLimit) {
      failureLog(finishedImageMessage);
      return;
    }

    fetchData()
      .catch(error => failureLog(error.message))
      .finally(() => {
        spinner.stop();
        simplelightbox.refresh();
      });
  }
}

async function fetchData() {
  spinner.spin(imageContainer);
  fetchImages.updateTotalPage();

  const { hits } = await fetchImages.getImage();
  if (hits.length === 0) {
    failureLog(noMatchMessage);
    return;
  }

  markingUp(hits);
}

function markingUp(data) {
  const mark = data.reduce((acc, el) => {
    const {
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    } = el;
    acc += `<div class="photo-card">
  <a href ="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" width="300" height="200" loading="lazy"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div>`;
    return acc;
  }, '');

  imageContainer.insertAdjacentHTML('beforeEnd', mark);
}

function failureLog(message) {
  Notify.failure(message, { clickToClose: true });
}
