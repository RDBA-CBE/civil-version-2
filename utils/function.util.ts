import { message } from 'antd';
import { useState } from 'react';
import { AnyIfEmpty } from 'react-redux';

export const useSetState = (initialState: any) => {
    const [state, setState] = useState(initialState);

    const newSetState = (newState: any) => {
        setState((prevState: any) => ({ ...prevState, ...newState }));
    };
    return [state, newSetState];
};

export const baseUrl = 'http://31.97.206.165';

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
    const array = arr?.map((item:any) => ({ value: item?.id, label: item[label] }));
    return array;
};

export const DropdownArrayString = (arr: any) => {
    const array = arr?.map((item:any) => ({ value: item, label: item }));
    return array;
};