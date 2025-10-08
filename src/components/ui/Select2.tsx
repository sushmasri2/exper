import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export type Select2Option = {
  label: string;
  value: string;
};

export type Select2Props = {
  options: Select2Option[];
  value: string[] | string;
  onChange: (value: string[] | string) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  allowCreate?: boolean;
  onCreateOption?: (newValue: string) => void;
};


const Select2: React.FC<Select2Props> = ({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = 'Select...',
  className = '',
  style = {},
  allowCreate = false,
  onCreateOption,
}) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);

  // Filter out invalid options (those without label or value)
  const validOptions = options.filter(opt => opt && opt.label && opt.value);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.select2-dropdown') && !selectRef.current?.contains(target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Update dropdown position when window resizes
  useEffect(() => {
    if (!open) return;
    const handleResize = () => {
      if (selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [open]);

  const filteredOptions = validOptions.filter(opt =>
    opt?.label?.toLowerCase()?.includes(search.toLowerCase()) || false
  );

  const handleToggle = () => {
    if (!open && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setOpen(!open);
    if (!open) {
      setSearch('');
    }
  };

  const handleSelect = (option: Select2Option) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      if (arr.includes(option.value)) {
        onChange(arr.filter(v => v !== option.value));
      } else {
        onChange([...arr, option.value]);
      }
    } else {
      onChange(option.value);
      setOpen(false);
      setSearch('');
    }
  };

  const formatGroupName = (input: string): string => {
    return input
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  const handleAddNew = () => {
    if (search.trim() && onCreateOption) {
      const formattedValue = formatGroupName(search);
      if (formattedValue) {
        onCreateOption(formattedValue);
        onChange(formattedValue);
        setOpen(false);
        setSearch('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canAddNew) {
      e.preventDefault();
      handleAddNew();
    }
  };

  const canAddNew = allowCreate && onCreateOption && search.trim() &&
    !filteredOptions.some(opt => opt.value.toLowerCase() === formatGroupName(search));

  const isSelected = (option: Select2Option) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(option.value);
    }
    return value === option.value;
  };
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      // Force focus and cursor visibility
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Force cursor to be visible by briefly blurring and refocusing
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.blur();
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                  // Set cursor position to end
                  const length = inputRef.current.value.length;
                  inputRef.current.setSelectionRange(length, length);
                }
              }, 5);
            }
          }, 10);
        }
      };

      // Multiple timing attempts
      const timer1 = setTimeout(focusInput, 1);
      const timer2 = setTimeout(focusInput, 50);
      const timer3 = setTimeout(focusInput, 100);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [open]);


  return (
    <div style={{ position: 'relative' }} className={className}>
      <div
        ref={selectRef}
        className='rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100'
        style={style}
        onClick={handleToggle}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">
          {multiple
            ? Array.isArray(value) && value.length > 0
              ? validOptions.filter(opt => value.includes(opt.value)).map(opt => opt?.label || 'Unknown').join(', ')
              : placeholder
            : validOptions.find(opt => opt.value === value)?.label || placeholder}
        </span>
        <ChevronDown size={18} className="ml-2 text-gray-400 dark:text-gray-300" />
      </div>

      {open && typeof window !== 'undefined' && createPortal(
        <div
          className="select2-dropdown rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg"
          onMouseDown={(e) => e.stopPropagation()} // ADD THIS - prevent dropdown close on scroll
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            minWidth: dropdownPosition.width,
            zIndex: 99999,
            maxHeight: 250,
            overflowY: 'auto',
            pointerEvents: 'auto'
          }}
        >
          <div style={{ position: 'sticky', top: 0, background: 'inherit', borderBottom: '1px solid #e5e7eb', zIndex: 11 }} className="dark:border-gray-600">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onFocus={(e) => e.stopPropagation()}
              placeholder={canAddNew ? `Search or press Enter to add "${formatGroupName(search)}"` : "Search..."}
              className="w-full p-2 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-0 outline-none focus:outline-none"
              style={{ caretColor: '#2563eb' }}
              autoFocus
            />
          </div>
          {filteredOptions.length === 0 && !canAddNew && (
            <div className="p-2 text-gray-500 dark:text-gray-400">No options</div>
          )}
          {canAddNew && (
            <div
              onClick={handleAddNew}
              className="p-2 cursor-pointer flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors border-b border-gray-200 dark:border-gray-600"
            >
              <span className="text-lg">+</span>
              <span>Add &quot;{formatGroupName(search)}&quot;</span>
            </div>
          )}
          {filteredOptions.map(opt => (
            <div
              key={opt.value}
              onClick={multiple ? undefined : () => handleSelect(opt)}
              className={`p-2 cursor-pointer flex items-center gap-2 text-gray-900 dark:text-gray-100 transition-colors ${isSelected(opt)
                ? 'bg-blue-50 dark:bg-blue-900/50'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {multiple && (
                <input
                  type="checkbox"
                  checked={isSelected(opt)}
                  onChange={() => handleSelect(opt)}
                  className="mr-2"
                />
              )}
              <span>{opt?.label || 'Unknown'}</span>
              {!multiple && isSelected(opt) && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Select2;