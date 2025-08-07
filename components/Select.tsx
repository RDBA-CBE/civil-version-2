import React, { useRef, useState } from 'react';
import Select from 'react-select';

const CustomSelect = (props: any) => {
    const { 
        name, 
        borderRadius, 
        disabled, 
        options, 
        value, 
        onChange, 
        placeholder = 'Select...', 
        title, 
        isSearchable = true, 
        className, 
        error, 
        isMulti, 
        required, 
        loadMore, 
        menuOpen, 
        onSearch,
        height = '33px', // New prop for controlling height
        isClearable
    } = props;

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            minHeight: height,
            height: height,
            borderColor: error ? 'red' : state.isFocused ? '#2684FF' : provided.borderColor,
            boxShadow: error ? '0 0 0 1px red' : state.isFocused ? '0 0 0 1px #2684FF' : provided.boxShadow,
            '&:hover': {
                borderColor: error ? 'red' : state.isFocused ? '#2684FF' : provided.borderColor,
            },
            borderRadius: borderRadius ? borderRadius : '5px',
        }),
        valueContainer: (provided: any) => ({
            ...provided,
            height: `calc(${height} - 2px)`,
            padding: '0 8px',
        }),
        input: (provided: any) => ({
            ...provided,
            margin: '0px',
        }),
        indicatorsContainer: (provided: any) => ({
            ...provided,
            height: `calc(${height} - 2px)`,
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
        menu: (base: any) => ({ ...base, zIndex: 9999 }),
    };

    const [inputValue, setInputValue] = useState('');

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
                    isClearable={isClearable ?? true} 
                    styles={customStyles}
                    onMenuOpen={() => menuOpen && menuOpen(true)}
                    onMenuClose={() => menuOpen && menuOpen(false)}
                    className={`border-none`}
                    onMenuScrollToBottom={loadMore}
                    inputValue={inputValue}
                    onInputChange={handleInputChange}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
        </div>
    );
};

export default CustomSelect;