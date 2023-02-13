const formEl = document.querySelector('.search-form');

formEl.addEventListener('submit', onFetchSubmit);

function onFetchSubmit(e) {
  e.preventDefault();
  const { searchQuery } = e.currentTarget.elements;
  console.log(searchQuery.value);
}
