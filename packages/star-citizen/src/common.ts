import sanitizeHtml from 'sanitize-html';

export function sanitize(s: string, options?: sanitizeHtml.IOptions) {
  return sanitizeHtml(s, {
    ...options,
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'span',
      'hr',
      'a',
      'img',
      'blockquote',
      'code',
      'ul',
      'ol',
      'li',
      'br',
      'strong',
      'em',
      'u',
      'table',
      'th',
      'tr',
      'td',
      'b',
      'p',
      'iframe',
      'youtube-privacy',
    ],
    allowedAttributes: {
      a: ['href'],
      span: [
        'style',
        {
          name: 'class',
          multiple: true,
          values: ['uppercase', 'font-bold', 'italic', 'underline', 'line-through'],
        },
      ],
      img: ['src', 'loading'],
      iframe: ['src', 'frameborder', 'allowfullscreen', 'loading', 'referrerpolicy', 'height', 'width'],
      'youtube-privacy': ['src', 'frameborder', 'allowfullscreen', 'loading', 'referrerpolicy', 'height', 'width'],
    },
    allowedStyles: {
      span: {
        'text-transform': [/^uppercase$/],
        'font-weight': [/^bold$/],
        'font-style': [/^italic$/],
        'font-decoration': [/^underline$/, /^line-through$/],
        'background-color': [/^currentColor$/],
      },
    },
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', ...(options?.allowedIframeHostnames ?? [])],
    transformTags: {
      img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true),
      iframe: sanitizeHtml.simpleTransform('youtube-privacy', {}, true),
      ...options?.transformTags,
    },
    exclusiveFilter(frame) {
      if (frame.tag === 'a') {
        const txt = frame.text.trim();
        return !txt || txt.toLocaleLowerCase() === 'back to top';
      }
      return false;
    },
  });
}
