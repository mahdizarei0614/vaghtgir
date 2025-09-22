import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('نمایش متن بارگذاری فارسی', () => {
  render(<App />);
  const loadingText = screen.getByText('در حال بارگذاری...');
  expect(loadingText).toBeInTheDocument();
});
