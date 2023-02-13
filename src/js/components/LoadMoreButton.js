export default class LoadMoreButton {
  constructor(selector, isHidden = true) {
    this.button = this.getButton(selector);
    if (isHidden) this.hideBtn();
    else this.showBtn();
  }
  getButton(selector) {
    return document.querySelector(selector);
  }

  hideBtn() {
    this.button.classList.add('hidden');
  }

  showBtn() {
    this.button.classList.remove('hidden');
  }
}
