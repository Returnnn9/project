"use client";

import DOMPurify from 'isomorphic-dompurify';
import styles from './SafeContent.module.css';

interface SafeContentProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'dark' | 'light';
}

export default function SafeContent({ content, className, style, variant = 'dark' }: SafeContentProps) {
  // Функция для добавления alt к картинкам и защиты от undefined src
  function addAltToImages(html: string, defaultAlt: string = ''): string {
    if (!html) return html;
    
    // Заменяем только явно невалидные src: "undefined", "null", пустая строка
    let cleaned = html
      .replace(/<img\s+src=["']undefined["']/gi, '<img src="/lending/placeholder.jpg"')
      .replace(/<img\s+src=["']null["']/gi, '<img src="/lending/placeholder.jpg"')
      .replace(/<img\s+src=["'"]{2}/gi, '<img src="/lending/placeholder.jpg"'); // пустая строка ""
    
    // Добавляем alt, если его нет
    return cleaned.replace(/<img(.*?)>/gi, (match, attributes) => {
      if (attributes.includes('alt=')) {
        return match;
      }
      return `<img${attributes} alt="${defaultAlt}">`;
    });
  }

  const cleanContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code',
      'ul', 'ol', 'li',
      'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'hr', 'div', 'span',
      'video', 'source', 'iframe'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'id', 'style',
      'data-*',
      'controls', 'controlsList', 'poster',
      'frameborder', 'allow', 'allowfullscreen'
    ],
  });

  // Добавляем alt к картинкам и чиним битые src
  const htmlWithAlt = addAltToImages(cleanContent, 'Иллюстрация из статьи');
  
  const wysiwygClass = variant === 'light' ? styles.wysiwygLight : styles.wysiwyg;
  
  return (
    <div
      className={`${wysiwygClass} ${className || ''}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: htmlWithAlt }}
    />
  );
}