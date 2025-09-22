import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Persian loading message', () => {
  render(<App />);
  const statusElement = screen.getByRole('status');
  expect(statusElement).toHaveTextContent('در حال بارگذاری');
});
