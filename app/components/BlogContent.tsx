"use client";

import SafeContent from './SafeContent';

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="prose prose-lg prose-invert max-w-none prose-headings:text-[var(--smusl-sage)] prose-p:text-[var(--smusl-cream)] prose-a:text-[var(--smusl-cream)] hover:prose-a:opacity-80 prose-strong:text-[var(--smusl-cream)] prose-em:text-[var(--smusl-cream)] prose-li:text-[var(--smusl-cream)]">
      <SafeContent content={content} />
    </div>
  );
}
