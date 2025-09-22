import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('نمایش پیام جدی بارگذاری', () => {
  render(<App />);
  const loadingText = screen.getByText('لطفاً آرام بمانید و چشم از صفحه برندارید.');
  expect(loadingText).toBeInTheDocument();
});
