'use client';

import { useState, useRef, useEffect } from 'react';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  label?: string;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className = '',
  required = false,
  label,
  error,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs(value || new Date()));
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setCurrentMonth(dayjs(value));
    }
  }, [value]);

  const handleDateSelect = (date: dayjs.Dayjs) => {
    if (disabled) return;

    const newDate = date.toDate();

    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;

    onChange(newDate);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(null);
  };

  const handleButtonClick = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) =>
      direction === 'prev' ? prev.subtract(1, 'month') : prev.add(1, 'month')
    );
  };

  const isDateDisabled = (date: dayjs.Dayjs) => {
    const dateObj = date.toDate();
    if (minDate && dateObj < minDate) return true;
    if (maxDate && dateObj > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: dayjs.Dayjs) => {
    if (!value) return false;
    return dayjs(value).isSame(date, 'day');
  };

  const isToday = (date: dayjs.Dayjs) => {
    return dayjs().isSame(date, 'day');
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfMonth = currentMonth.startOf('month');
    const lastDayOfMonth = currentMonth.endOf('month');
    const firstDayOfWeek = firstDayOfMonth.startOf('week');
    const lastDayOfWeek = lastDayOfMonth.endOf('week');

    const days = [];
    let current = firstDayOfWeek;

    while (current.isBefore(lastDayOfWeek) || current.isSame(lastDayOfWeek)) {
      days.push(current);
      current = current.add(1, 'day');
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-left border rounded-lg transition-all duration-200 flex items-center justify-between
            ${
              disabled
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-300 dark:border-gray-600'
                : isOpen
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-gray-700'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
            ${error ? 'border-red-500 ring-2 ring-red-500/20' : ''}
          `}
        >
          <span>
            {value ? dayjs(value).format('MMM DD, YYYY') : placeholder}
          </span>
          <div className="flex items-center space-x-1">
            {value && !disabled && (
              <span
                data-clear-button
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors cursor-pointer"
              >
                <IconX className="w-3 h-3" />
              </span>
            )}
            <IconCalendar className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        {/* Calendar Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 p-4 min-w-[300px]"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <IconChevronLeft className="w-4 h-4" />
              </button>

              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {MONTHS[currentMonth.month()]} {currentMonth.year()}
              </h3>

              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.month() === currentMonth.month();
                const isSelected = isDateSelected(date);
                const isDisabled = isDateDisabled(date);
                const isTodayDate = isToday(date);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !isDisabled && handleDateSelect(date)}
                    disabled={isDisabled}
                    className={`
                      w-8 h-8 text-xs rounded-lg transition-all duration-200 flex items-center justify-center
                      ${
                        !isCurrentMonth
                          ? 'text-gray-300 dark:text-gray-600'
                          : isSelected
                            ? 'bg-blue-600 text-white font-semibold'
                            : isTodayDate
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium'
                              : isDisabled
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {date.date()}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => handleDateSelect(dayjs())}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Today
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
