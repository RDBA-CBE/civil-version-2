import { message } from 'antd';
import { useState } from 'react';

export const useSetState = (initialState: any) => {
    const [state, setState] = useState(initialState);

    const newSetState = (newState: any) => {
        setState((prevState: any) => ({ ...prevState, ...newState }));
    };
    return [state, newSetState];
};

export const baseUrl = 'http://app.covaicivillab.com/';

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
