import { message } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { AnyIfEmpty } from 'react-redux';

export const useSetState = (initialState: any) => {
    const [state, setState] = useState(initialState);

    const newSetState = (newState: any) => {
        setState((prevState: any) => ({ ...prevState, ...newState }));
    };
    return [state, newSetState];
};

export const baseUrl = 'http://31.97.206.165/api';

export const Success = (content: any) => {
    message.open({
        type: 'success',
        content: content,
    });
};

export const Failure = (content: any) => {
    message.open({
        type: 'error',
        content: content,
    });
};

export const Warning = (content: any) => {
    message.open({
        type: 'warning',
        content: content,
    });
};

export const ObjIsEmpty = (object: any) => {
    if (object) {
        if (Object.keys(object)?.length === 0) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

export const Dropdown = (arr: any, label: string) => {
    const array = arr?.map((item: any) => ({ value: item?.id, label: item[label] }));
    return array;
};

export const DropdownArrayString = (arr: any) => {
    const array = arr?.map((item: any) => ({ value: item, label: item }));
    return array;
};

export const roundNumber = (num: any) => {
    return Math.round(Number(num));
};

export function capitalizeFLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export const FormatTaxDisplay = (selectedTaxes: any[], total: number) => {
    if (selectedTaxes.length === 0) return '';

    const names = selectedTaxes.map((tax) => tax.tax_name).join(' + ');
    const percentages = selectedTaxes.map((tax) => `${Math.round(parseFloat(tax.tax_percentage))}%`).join(' + ');

    return `${names} : ${percentages} = ${Math.round(total)}`;
};

export const commomDateFormat = (date: string) => {
    if (date) {
        const dates = moment(date).format('DD/MM/YYYY');
        return dates;
    } else {
        return '';
    }
};


export const apiDateFormat = (date: string) => {
    if (date) {
        const dates = moment(date).format('YYYY-MM-DD');
        return dates;
    } else {
        return '';
    }
};