import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import FetchImages from './js/FetchImages';
import LoadMoreButton from './js/components/LoadMoreButton';
import 'simplelightbox/dist/simple-lightbox.min.css';
import simpleLightbox from 'simplelightbox';

const fetchImages = new FetchImages();
const loadMoreButton = new LoadMoreButton('.load-more', true);

const formEl = document.querySelector('.search-form');
const imageContainer = document.querySelector('.gallery');

console.log(simpleLightbox);

formEl.addEventListener('submit', onHandleSubmit);
loadMoreButton.button.addEventListener('click', onHandleClick);

async function onHandleSubmit(e) {
  e.preventDefault();
  const { searchQuery } = e.currentTarget.elements;
  fetchImages.query = searchQuery.value;
  fetchImages.resetPage();
  loadMoreButton.hideBtn();
  imageContainer.innerHTML = '';
  await fetchData();

  Notify.info(`Hooray! We found ${fetchImages.totalHits} images.`, {
    clickToClose: true,
  });
  const lightbox = new SimpleLightbox('.gallery a');
}

function onHandleClick() {
  fetchImages.updatePage();

  if (fetchImages.page * 40 > fetchImages.totalHits) {
    Notify.failure(
      "We're sorry, but you've reached the end of search results.",
      { clickToClose: true }
    );
    loadMoreButton.hideBtn();
    return;
  }
  fetchData();
}

async function fetchData() {
  await fetchImages
    .getImage()
    .then(data => {
      if (data.hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          { clickToClose: true }
        );
        return;
      }
      markingUp(data.hits);
      loadMoreButton.showBtn();
    })
    .catch(error => Notify.failure(error.message, { clickToClose: true }));
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
  <a href ="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
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
