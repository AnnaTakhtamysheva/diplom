import { makeAutoObservable } from 'mobx';
import React, { useContext } from 'react';
import {ModalProps} from "../../components/Modal/Modal";

class ModalStore {
    public isModalActive = false;
    public modalProps?: ModalProps;

    constructor() {
        makeAutoObservable(this);
    }

    openModal = ( modalProps?: ModalProps) => {
        this.isModalActive = true;
        this.modalProps = modalProps;
    };

    closeModal = () => {
        this.isModalActive = false;
    };
}

const ModalStoreInstance = new ModalStore();
export const ModalStoreContext = React.createContext(ModalStoreInstance);
export const useModalStore = () => useContext(ModalStoreContext);

export default ModalStoreInstance;
