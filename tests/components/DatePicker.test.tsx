import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DatePicker from '@/components/DatePicker';
import dayjs from 'dayjs';

const baseProps = {
  onChange: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('DatePicker', () => {
  it('renders the placeholder when no value', () => {
    render(<DatePicker {...baseProps} placeholder="Pick a date" />);
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('renders the formatted date when value is set', () => {
    const date = new Date(2026, 5, 15); // June 15, 2026 local time
    render(<DatePicker {...baseProps} value={date} />);
    expect(screen.getByText('Jun 15, 2026')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<DatePicker {...baseProps} label="Due Date" />);
    expect(screen.getByText('Due Date')).toBeInTheDocument();
  });

  it('renders required asterisk when required prop set', () => {
    render(<DatePicker {...baseProps} label="Due Date" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message when error prop set', () => {
    render(<DatePicker {...baseProps} error="Date required" />);
    expect(screen.getByText('Date required')).toBeInTheDocument();
  });

  it('opens calendar on button click', () => {
    render(<DatePicker {...baseProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Sun')).toBeInTheDocument(); // weekday header
  });

  it('does not open calendar when disabled', () => {
    render(<DatePicker {...baseProps} disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Sun')).not.toBeInTheDocument();
  });

  it('navigates to previous month', () => {
    const now = dayjs();
    render(<DatePicker {...baseProps} />);
    fireEvent.click(screen.getByRole('button')); // open calendar
    // Buttons when open: [0]=toggle [1]=chevron-left [2]=chevron-right [3+]=day buttons ...
    const prevBtn = screen.getAllByRole('button')[1];
    fireEvent.click(prevBtn);
    const prevMonth = now.subtract(1, 'month');
    expect(screen.getByText(new RegExp(prevMonth.format('MMMM'), 'i'))).toBeInTheDocument();
  });

  it('navigates to next month', () => {
    const now = dayjs();
    render(<DatePicker {...baseProps} />);
    fireEvent.click(screen.getByRole('button')); // open calendar
    const nextBtn = screen.getAllByRole('button')[2];
    fireEvent.click(nextBtn);
    const nextMonth = now.add(1, 'month');
    expect(screen.getByText(new RegExp(nextMonth.format('MMMM'), 'i'))).toBeInTheDocument();
  });

  it('selects a date and calls onChange', () => {
    render(<DatePicker {...baseProps} />);
    fireEvent.click(screen.getByRole('button')); // open
    // Click "Today" quick action
    fireEvent.click(screen.getByText('Today'));
    expect(baseProps.onChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('clears the date via the Clear button', () => {
    render(<DatePicker {...baseProps} value={new Date(2026, 5, 15)} />);
    fireEvent.click(screen.getByRole('button')); // open
    fireEvent.click(screen.getByText('Clear'));
    expect(baseProps.onChange).toHaveBeenCalledWith(null);
  });

  it('clears via the X icon button next to the date display', () => {
    render(<DatePicker {...baseProps} value={new Date(2026, 5, 15)} />);
    const clearBtn = document.querySelector('[data-clear-button]')!;
    fireEvent.click(clearBtn);
    expect(baseProps.onChange).toHaveBeenCalledWith(null);
  });

  it('closes calendar when clicking outside', () => {
    render(<DatePicker {...baseProps} />);
    fireEvent.click(screen.getByRole('button')); // open
    expect(screen.getByText('Sun')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Sun')).not.toBeInTheDocument();
  });
});
