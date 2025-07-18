import React from 'react';
import Select from 'react-select';

const CustomSelect = (props: any) => {
    const { name, borderRadius, disabled, options, value, onChange, placeholder = 'Select...', title, isSearchable = true, className, error, isMulti, required, loadMore, menuOpen } = props;

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
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
        </div>
    );
};

export default CustomSelect;
