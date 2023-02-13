const axios = require('axios').default;

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '32961212-2ce7a37f9a51859c3f04fb788';

export default class FetchImages {
  constructor() {
    this.querySearch = '';
    this.page = 1;
    this.totalHits = null;
  }
  get query() {
    return this.querySearch;
  }
  set query(newQuery) {
    this.querySearch = newQuery;
  }

  updatePage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }

  getPageValue() {
    return this.page;
  }

  async getImage() {
    const params = new URLSearchParams({
      key: API_KEY,
      q: this.query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: this.getPageValue(),
      per_page: 40,
    });

    const { data } = await axios.get(`${BASE_URL}?${params}`);

    this.totalHits = data.totalHits;
    return data;
  }
}
