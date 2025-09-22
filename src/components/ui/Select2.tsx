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
};

const Select2: React.FC<Select2Props> = ({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = 'Select...',
  className = '',
  style = {},
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

  const isSelected = (option: Select2Option) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(option.value);
    }
    return value === option.value;
  };

  return (
    <div style={{ position: 'relative' }} className={className}>
      <div
        ref={selectRef}
        className='rounded-lg border border-gray-300 bg-white px-3 py-1 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex items-center justify-between cursor-pointer'
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
        <ChevronDown size={18} className="ml-2 text-gray-400" />
      </div>

      {open && typeof window !== 'undefined' && createPortal(
        <div
          className="select2-dropdown rounded-lg border border-gray-300 bg-white shadow-lg"
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            minWidth: dropdownPosition.width,
            zIndex: 9999,
            maxHeight: 250,
            overflowY: 'auto',
          }}
        >
          <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 11 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderBottom: '1px solid #eee' }}
              autoFocus
            />
          </div>
          {filteredOptions.length === 0 && (
            <div style={{ padding: '8px', color: '#888' }}>No options</div>
          )}
          {filteredOptions.map(opt => (
            <div
              key={opt.value}
              onClick={multiple ? undefined : () => handleSelect(opt)}
              style={{
                padding: '8px',
                background: isSelected(opt) ? '#e6f7ff' : '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={e => {
                if (!isSelected(opt)) {
                  (e.target as HTMLElement).style.background = '#f5f5f5';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected(opt)) {
                  (e.target as HTMLElement).style.background = '#fff';
                }
              }}
            >
              {multiple && (
                <input
                  type="checkbox"
                  checked={isSelected(opt)}
                  onChange={() => handleSelect(opt)}
                  style={{ marginRight: 8 }}
                />
              )}
              <span>{opt?.label || 'Unknown'}</span>
              {!multiple && isSelected(opt) && (
                <span style={{ marginLeft: 'auto', color: '#1890ff' }}>✓</span>
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