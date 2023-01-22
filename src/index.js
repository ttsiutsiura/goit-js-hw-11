import SimpleLightbox from 'simplelightbox';
import { fetchImages } from './fetchImages';
import { notifyInfo, notifyFailure } from './notify';
import 'simplelightbox/dist/simple-lightbox.min.css';
import {
  formEl,
  searchButtonEl,
  galleryEl,
  loadMoreButtonEl,
  startImgEl,
} from './refs';

formEl.addEventListener('submit', onFormSubmit);
formEl.addEventListener('input', onFormInput);
loadMoreButtonEl.addEventListener('click', onLoadMoreClick);

const lightbox = new SimpleLightbox('.gallery a', { navText: ['P', 'N'] });

let page = null;
let query = null;

async function onFormSubmit(e) {
  e.preventDefault();

  if (!loadMoreButtonEl.classList.contains('hidden')) {
    loadMoreButtonEl.classList.add('hidden');
  }

  if (formEl.elements.searchQuery.value.trim() === query) {
    return;
  }

  page = 1;
  query = formEl.elements.searchQuery.value.trim();

  const response = await fetchImages(query, page);
  const data = response.data;

  if (data.totalHits === 0) {
    clearGalleryInnerHTML();
    notifyFailure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    startImgEl.classList.remove('hidden');
    return;
  }

  if (query.length < 3) {
    clearGalleryInnerHTML();
    startImgEl.classList.remove('hidden');
    notifyInfo('Please enter a more specific query.');
    return;
  }

  notifyInfo(`Hooray! We found ${data.totalHits} images.`);
  clearGalleryInnerHTML();
  startImgEl.classList.add('hidden');
  renderMarkup(data);

  if (loadMoreButtonEl.classList.contains('hidden')) {
    loadMoreButtonEl.classList.remove('hidden');
  }

  if (data.totalHits < 40) {
    loadMoreButtonEl.classList.add('hidden');
  }

  window.scroll({
    top: 0,
    behavior: 'smooth',
  });
}

function onFormInput() {
  const isInputEmpty = formEl.elements.searchQuery.value.trim() === '';

  if (!isInputEmpty) {
    searchButtonEl.removeAttribute('disabled');
    return;
  }

  searchButtonEl.setAttribute('disabled', 'true');
}

async function onLoadMoreClick() {
  page++;

  try {
    const response = await fetchImages(query, page);
    const data = response.data;
    renderMarkup(data);
  } catch (error) {
    console.log(error);
  }

  const checkIfTheNextFetchReturnsError = await fetchImages(query, page + 1);

  if (checkIfTheNextFetchReturnsError.data.hits.length === 0) {
    loadMoreButtonEl.classList.add('hidden');
    notifyFailure("We're sorry, but you've reached the end of search results.");
  }

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function renderMarkup({ hits }) {
  let markup = '';
  hits.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) =>
      (markup += `<a href="${largeImageURL}"><div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <div class="info-item">
              <b>Likes</b>
              <p>${likes}</p>
            </div>
            <div class="info-item">
              <b>Views</b>
              <p>${views}</p>
            </div>
            <div class="info-item">
              <b>Comments</b>
              <p>${comments}</p>
            </div>
            <div class="info-item">
              <b>Downloads</b>
              <p>${downloads}</p>
            </div>
          </div>
        </div></a>`)
  );
  galleryEl.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

function clearGalleryInnerHTML() {
  galleryEl.innerHTML = '';
}
