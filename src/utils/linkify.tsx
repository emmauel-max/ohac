import React from 'react';

/**
 * Converts URLs in text to clickable links
 * @param text - The text that may contain URLs
 * @returns React elements with clickable links
 */
export function linkify(text: string): React.ReactNode {
  if (!text) return null;
  
  // URL regex pattern - matches http, https, and www URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // This is a URL
      let url = part;
      const displayText = part;
      
      // Add http:// to www URLs
      if (part.startsWith('www.')) {
        url = 'http://' + part;
      }
      
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="link-item"
          title={`Open ${url}`}
        >
          {displayText}
        </a>
      );
    }
    
    // Regular text
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Component wrapper for linkified text
 */
export function LinkifiedText({ text, className = '' }: { text: string; className?: string }) {
  return <span className={className}>{linkify(text)}</span>;
}
