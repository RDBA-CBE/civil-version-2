import React, { useRef, useState } from 'react';
import Select from 'react-select';

const CustomSelect = (props: any) => {
    const { name, borderRadius, disabled, options, value, onChange, placeholder = 'Select...', title, isSearchable = true, className, error, isMulti, required, loadMore, menuOpen, onSearch } = props;

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            borderColor: error ? 'red' : provided.borderColor,
            boxShadow: error ? '0 0 0 0.1 red' : provided.boxShadow,
            '&:hover': {
                borderColor: error ? 'red' : provided.borderColor,
            },
            borderRadius: borderRadius ? borderRadius : '5px',
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
        menu: (base: any) => ({ ...base, zIndex: 9999 }),
    };

    const [inputValue, setInputValue] = useState('');

    // const handleSearchChange = (inputValue: string) => {
    //     setSearchTerm(inputValue);

    //     if (onSearch && inputValue.length >= 2) {
    //         // Only search if 2+ characters
    //         clearTimeout(debounceRef.current);
    //         debounceRef.current = setTimeout(async () => {
    //             setIsSearching(true);
    //             try {
    //                 await onSearch(inputValue);
    //             } finally {
    //                 setIsSearching(false);
    //             }
    //         }, debounceTimeout);
    //     }
    // };

    const handleInputChange = (newValue: string) => {
        setInputValue(newValue);
        if (onSearch) {
            onSearch(newValue);
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {title && (
                <label className="block text-sm font-bold">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="">
                <Select
                    name={name}
                    isDisabled={disabled}
                    loadingMessage={() => 'Loading...'}
                    noOptionsMessage={() => 'No options available'}
                    placeholder={placeholder}
                    options={options}
                    value={value}
                    onChange={onChange}
                    isSearchable={isSearchable}
                    isMulti={isMulti}
                    isClearable={true}
                    styles={customStyles}
                    onMenuOpen={() => menuOpen && menuOpen(true)}
                    onMenuClose={() => menuOpen && menuOpen(false)}
                    className={`border-none`}
                    onMenuScrollToBottom={loadMore}
                    inputValue={inputValue}
                    onInputChange={handleInputChange}
                    components={{
                        DropdownIndicator: null,
                    }}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
        </div>
    );
};

export default CustomSelect;
