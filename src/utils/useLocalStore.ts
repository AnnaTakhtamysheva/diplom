import { useRef, useEffect } from 'react';

export type ILocalStore = {
    destroy(): void;
};

export const useLocalStore = <T extends ILocalStore>(creator: () => T): T => {
    const ref = useRef<T>();

    if (!ref.current) {
        ref.current = creator();
    }

    useEffect(() => () => ref.current?.destroy(), []);

    return ref.current;
};
