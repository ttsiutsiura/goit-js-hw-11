import Notiflix from 'notiflix';

function notifyInfo(message) {
  Notiflix.Notify.info(message, { zindex: 1001 });
}

function notifyFailure(message) {
  Notiflix.Notify.failure(message, { zindex: 1001 });
}

export { notifyInfo, notifyFailure };
