import { makeAutoObservable } from 'mobx';
import React, {useContext} from 'react';

class ThemeStore {
    public colorVertex: string = localStorage.getItem('colorVertex') || '#00e1ff';
    public colorEdge: string = localStorage.getItem('colorEdge') || '#ffffff';
    public colorBackground: string = localStorage.getItem('colorBackground') || '#cc8899';

    constructor() {
        makeAutoObservable(this);
    }

    setColorVertex = (colorVertex: string) => {
        this.colorVertex = colorVertex;
        localStorage.setItem('colorVertex', colorVertex);
    };

    setColorEdge = (colorEdge: string) => {
        this.colorEdge = colorEdge;
        localStorage.setItem('colorEdge', colorEdge);
    };

    setColorBackground = (colorBackground: string) => {
        this.colorBackground = colorBackground;
        localStorage.setItem('colorBackground', colorBackground);
    };
}

const ThemeStoreInstance = new ThemeStore();
export const ThemeStoreContext = React.createContext(ThemeStoreInstance);
export const useThemeStore = () => useContext(ThemeStoreContext);

export default ThemeStoreInstance;
