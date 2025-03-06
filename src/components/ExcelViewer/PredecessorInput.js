import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

const PredecessorInput = ({ 
  value = '', 
  conditions = '',
  siblingIds = [], 
  onChange,
  onConditionChange,
  currentId 
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [conditionValue, setConditionValue] = useState(conditions);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Parse current predecessors and their validity
  const predecessors = inputValue.split(',').map(id => id.trim()).filter(Boolean);
  const predecessorConditions = conditionValue.split(',').map(cond => cond.trim());
  
  // Filter out current ID from valid siblings
  const validSiblings = siblingIds.filter(id => id !== currentId);

  // Get suggestions based on current input
  const getSuggestions = () => {
    const lastItem = predecessors[predecessors.length - 1] || '';
    return validSiblings.filter(id => 
      id.toLowerCase().includes(lastItem.toLowerCase()) && 
      !predecessors.includes(id)
    );
  };

  const suggestions = getSuggestions();

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Auto-format: ensure proper comma spacing
    const formatted = newValue
      .split(',')
      .map(id => id.trim())
      .filter(Boolean)
      .join(', ');
    
    if (formatted !== newValue) {
      setInputValue(formatted);
    }
    
    onChange(formatted);
  };

  const handleConditionChange = (e) => {
    const newValue = e.target.value;
    setConditionValue(newValue);
    
    // Auto-format conditions similar to predecessors
    const formatted = newValue
      .split(',')
      .map(cond => cond.trim())
      .filter(Boolean)
      .join(', ');
    
    if (formatted !== newValue) {
      setConditionValue(formatted);
    }
    
    onConditionChange(formatted);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      const newPredecessors = [...predecessors.slice(0, -1), selected];
      const formatted = newPredecessors.join(', ');
      setInputValue(formatted);
      onChange(formatted);
      setShowDropdown(false);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const newPredecessors = [...predecessors.slice(0, -1), suggestion];
    const formatted = newPredecessors.join(', ');
    setInputValue(formatted);
    onChange(formatted);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex gap-2">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder="Enter predecessor IDs..."
          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        
        {/* Validity indicators */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {predecessors.map((id, index) => (
            <span
              key={index}
              className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${
                validSiblings.includes(id)
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {validSiblings.includes(id) ? 
                <Check className="w-3 h-3" /> : 
                <X className="w-3 h-3" />
              }
            </span>
          ))}
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`px-3 py-2 cursor-pointer ${
                  index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Predecessor conditions input */}
      <input
        type="text"
        value={conditionValue}
        onChange={handleConditionChange}
        placeholder="Enter conditions..."
        className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
};

export default PredecessorInput;