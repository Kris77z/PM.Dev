"use client";

import React, { useState, useEffect, FormEvent } from "react";

interface PlaceholdersAndVanishInputProps {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
  accentColor?: string;
}

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  className = "",
  accentColor = "blue",
}: PlaceholdersAndVanishInputProps) {
  const [placeholder, setPlaceholder] = useState("");
  const [inputValue, setInputValue] = useState("");

  const getColorClass = () => {
    switch (accentColor) {
      case 'teal': return 'bg-teal-500 hover:bg-teal-600';
      case 'green': return 'bg-green-500 hover:bg-green-600';
      case 'indigo': return 'bg-indigo-500 hover:bg-indigo-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * placeholders.length);
    setPlaceholder(placeholders[randomIndex]);
  }, [placeholders]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
    setInputValue("");
  };

  const buttonColorClass = getColorClass();

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-teal-400 transition-all">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={inputValue ? "" : placeholder}
          className="w-full px-4 py-3 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full text-white ${buttonColorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={!inputValue.trim()}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </form>
  );
} 