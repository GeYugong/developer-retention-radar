import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

afterEach(()=>{cleanup();localStorage.clear();delete document.documentElement.dataset.theme});

describe('theme toggle',()=>{
  it('switches theme and persists the choice',()=>{
    localStorage.setItem('radar-theme','light');
    render(<ThemeToggle/>);
    fireEvent.click(screen.getByRole('button',{name:'切换至夜间模式'}));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('radar-theme')).toBe('dark');
  });
});
