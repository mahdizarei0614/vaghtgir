import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('نمایش پیام بارگذاری و نمایش کدها', () => {
  render(<App />);
  const loadingText = screen.getByText(/نفستو نگه دار؛ رمز به زودی لو می‌ره/);
  expect(loadingText).toBeInTheDocument();
  expect(screen.getAllByText(/return/)[0]).toBeInTheDocument();
});
