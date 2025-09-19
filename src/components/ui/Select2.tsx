import React, { useState } from 'react';
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

  // Filter out invalid options (those without label or value)
  const validOptions = options.filter(opt => opt && opt.label && opt.value);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.select2-dropdown')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const filteredOptions = validOptions.filter(opt =>
    opt?.label?.toLowerCase()?.includes(search.toLowerCase()) || false
  );

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
        className='rounded-lg border border-gray-300 bg-white px-3 py-1 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex items-center justify-between cursor-pointer'
        style={style}
        onClick={() => setOpen(!open)}
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
      {open && (
        <div
          className="select2-dropdown rounded-lg border border-gray-300 bg-white shadow-lg mt-1"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            minWidth: '100%',
            border: '1px solid #ccc',
            background: '#fff',
            zIndex: 1000,
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
            />
            {multiple && (
              <div style={{ textAlign: 'right', padding: '4px 8px' }}>
                <button type="button" onClick={() => setOpen(false)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#1890ff' }}>Close</button>
              </div>
            )}
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
        </div>
      )}
    </div>
  );
};

export default Select2;
