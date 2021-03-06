/* global document, window */
export default function shaver(target, maxHeight, opts) {
  if (!maxHeight) throw Error('maxHeight is required');
  const el = target;
  const character = (opts && opts.character) || '…';
  const classname = (opts && opts.classname) || 'js-shave';
  let spaces = true;
  if (opts && opts.spaces === false) spaces = false;
  const charHtml = `<span class="js-shave-char">${character}</span>`;
  const span = el.querySelector(`.${classname}`);
  const textProp = el.textContent === undefined ? 'innerText' : 'textContent';

  // If element text has already been shaved
  if (span) {
    // Remove the ellipsis to recapture the original text
    el.removeChild(el.querySelector('.js-shave-char'));
    el[textProp] = el[textProp]; // nuke span, recombine text
  }

  const fullText = el[textProp];
  const words = spaces ? fullText.split(' ') : fullText;

  // If 0 or 1 words, we're done
  if (words.length < 2) return;

  // Temporarily remove any CSS height for text height calculation
  const heightStyle = el.style.height;
  el.style.height = 'auto';
  const maxHeightStyle = el.style.maxHeight;
  el.style.maxHeight = 'none';

  // If already short enough, we're done
  if (el.offsetHeight <= maxHeight) {
    el.style.height = heightStyle;
    el.style.maxHeight = maxHeightStyle;
    return;
  }

  // Binary search for number of words which can fit in allotted height
  let max = words.length - 1;
  let min = 0;
  let pivot;
  while (min < max) {
    pivot = (min + max + 1) >> 1; // eslint-disable-line no-bitwise
    el[textProp] = spaces ? words.slice(0, pivot).join(' ') : words.slice(0, pivot);
    el.insertAdjacentHTML('beforeend', charHtml);
    if (el.offsetHeight > maxHeight) max = spaces ? pivot - 1 : pivot - 2;
    else min = pivot;
  }

  el[textProp] = spaces ? words.slice(0, max).join(' ') : words.slice(0, max);
  el.insertAdjacentHTML('beforeend', charHtml);
  const diff = spaces ? words.slice(max).join(' ') : words.slice(max);

  el.insertAdjacentHTML('beforeend',
    `<span class="${classname}" style="display:none;">${diff}</span>`);

  el.style.height = heightStyle;
  el.style.maxHeight = maxHeightStyle;
}
