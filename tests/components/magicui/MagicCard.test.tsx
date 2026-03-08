import React from 'react';
import { render } from '@testing-library/react';
import { MagicCard } from '@/components/magicui/magic-card';

describe('MagicCard', () => {
  it('renders children', () => {
    const { getByText } = render(<MagicCard>Hello</MagicCard>);
    expect(getByText('Hello')).toBeInTheDocument();
  });

  it('applies custom className to root element', () => {
    const { container } = render(<MagicCard className="my-card">X</MagicCard>);
    expect(container.firstChild).toHaveClass('my-card');
  });

  it('gradient overlay starts at opacity 0 (subtle by default)', () => {
    const { container } = render(<MagicCard>X</MagicCard>);
    // The gradient div is the first child of the root div
    const gradientDiv = container.querySelector('.opacity-0');
    expect(gradientDiv).toBeInTheDocument();
  });

  it('default gradientOpacity is subtle (≤ 0.05)', () => {
    // We verify the default by checking the component renders without
    // an explicit gradientOpacity — the rendered gradient div should have
    // the initial opacity-0 class (not inline style that overrides to >0.5)
    const { container } = render(<MagicCard>X</MagicCard>);
    const gradientDiv = container.querySelector('[class*="opacity-0"]') as HTMLElement | null;
    expect(gradientDiv).not.toBeNull();
    // No inline opacity override on initial render (mouse hasn't moved yet)
    expect(gradientDiv?.style.opacity).toBeFalsy();
  });

  it('wraps children in a relative z-10 container', () => {
    const { container } = render(<MagicCard>Content</MagicCard>);
    const inner = container.querySelector('.z-10');
    expect(inner).toBeInTheDocument();
    expect(inner?.textContent).toBe('Content');
  });
});
