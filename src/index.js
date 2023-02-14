import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import FetchImages from './js/FetchImages';
import LoadMoreButton from './js/components/LoadMoreButton';
import 'simplelightbox/dist/simple-lightbox.min.css';

const noMatchMessage =
  'Sorry, there are no images matching your search query. Please try again.';
const finishedImageMessage =
  "We're sorry, but you've reached the end of search results.";

const fetchImages = new FetchImages();
const loadMoreButton = new LoadMoreButton('.load-more', true);

const formEl = document.querySelector('.search-form');
const imageContainer = document.querySelector('.gallery');

formEl.addEventListener('submit', onHandleSubmit);
loadMoreButton.button.addEventListener('click', onHandleClick);

async function onHandleSubmit(e) {
  e.preventDefault();

  const { searchQuery } = e.currentTarget.elements;
  fetchImages.query = searchQuery.value.trim();

  fetchImages.resetPage();
  loadMoreButton.hideBtn();
  imageContainer.innerHTML = '';

  if (fetchImages.query !== '') {
    await fetchData().catch(error => failureLog(error.message));
    if (fetchImages.totalHits > 0) {
      Notify.info(`Hooray! We found ${fetchImages.totalHits} images.`, {
        clickToClose: true,
      });
    }
  }
}

function onHandleClick() {
  fetchImages.updatePage();

  const limit = fetchImages.page * fetchImages.perPage > fetchImages.totalHits;
  if (limit) {
    failureLog(finishedImageMessage);
    loadMoreButton.hideBtn();
    return;
  }

  fetchData()
    .then(gallery => gallery.refresh())
    .catch(error => failureLog(error));
}

function fetchData() {
  return fetchImages.getImage().then(data => {
    if (data.hits.length === 0) {
      failureLog(noMatchMessage);
      return;
    }
    markingUp(data.hits);

    if (fetchImages.perPage >= fetchImages.totalHits) loadMoreButton.hideBtn();

    return new SimpleLightbox('.gallery a');
  });
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
