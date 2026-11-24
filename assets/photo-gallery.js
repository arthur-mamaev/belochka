const photoCards = document.querySelectorAll('.activity-grid figure, .album-grid figure');

if (photoCards.length && typeof HTMLDialogElement !== 'undefined') {
  const preview = document.createElement('dialog');
  preview.className = 'photo-preview';
  preview.setAttribute('aria-label', 'Просмотр фотографии');
  preview.innerHTML = '<div class="photo-preview-frame"><img alt=""><button type="button" class="photo-close" aria-label="Закрыть фотографию" autofocus>×</button></div><p aria-live="polite"></p>';
  document.body.append(preview);

  const previewImage = preview.querySelector('img');
  const previewCaption = preview.querySelector('p');
  const previewFrame = preview.querySelector('.photo-preview-frame');
  let activeGallery;

  function arrow(direction, activate) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-arrow photo-' + (direction < 0 ? 'previous' : 'next');
    button.setAttribute('aria-label', direction < 0 ? 'Предыдущее фото' : 'Следующее фото');
    button.textContent = direction < 0 ? '‹' : '›';
    button.addEventListener('click', () => activate(direction));
    return button;
  }

  const previewArrows = [-1, 1].map(direction => arrow(direction, step => activeGallery.move(step)));
  previewFrame.append(...previewArrows);
  preview.querySelector('.photo-close').addEventListener('click', () => preview.close());
  preview.addEventListener('click', event => {
    if (event.target === preview) preview.close();
  });
  preview.addEventListener('keydown', event => {
    if (activeGallery.total < 2 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    activeGallery.move(event.key === 'ArrowLeft' ? -1 : 1);
  });

  for (const card of photoCards) {
    const [cover, ...additional] = card.querySelectorAll('img');
    if (!cover) continue;
    const photos = [cover, ...additional].map(image => ({ url: image.getAttribute('src'), alt: image.alt }));
    const title = card.querySelector('figcaption').textContent;
    const frame = document.createElement('div');
    frame.className = 'photo-frame';
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'photo-open';
    let index = 0;

    function updatePreview() {
      previewImage.src = photos[index].url;
      previewImage.alt = photos[index].alt;
      previewCaption.textContent = title + ' · ' + (index + 1) + ' / ' + photos.length;
    }

    function updateCover() {
      cover.src = photos[index].url;
      cover.alt = photos[index].alt;
      open.setAttribute('aria-label', title + '. Увеличить фото ' + (index + 1) + ' из ' + photos.length);
    }

    function move(step) {
      index = (index + step + photos.length) % photos.length;
      updateCover();
      if (preview.open) updatePreview();
    }

    cover.replaceWith(frame);
    open.append(cover);
    frame.append(open);
    if (additional.length) {
      frame.append(arrow(-1, move), arrow(1, move));
      card.querySelector('.activity-photos').remove();
    }

    updateCover();
    open.addEventListener('click', () => {
      activeGallery = { move, total: photos.length };
      for (const button of previewArrows) button.hidden = photos.length < 2;
      updatePreview();
      preview.showModal();
    });
  }
}
