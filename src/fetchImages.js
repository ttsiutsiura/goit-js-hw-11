import axios from 'axios';

export function fetchImages(query, page = 1) {
  return axios.get(
    `https://pixabay.com/api/?key=32974369-6c6def824ede5ef73d1d6de36&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
  );
}
