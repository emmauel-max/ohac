import { linkify } from '../utils/linkify';

/**
 * Component wrapper for linkified text
 */
export function LinkifiedText({ text, className = '' }: { text: string; className?: string }) {
  return <span className={className}>{linkify(text)}</span>;
}
