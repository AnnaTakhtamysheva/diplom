// import React from 'react';
// import iconX from '../../images/x.svg';
import React, { ReactNode } from 'react';
import './Modal.component.css';
import { useModalStore } from '../../modules/store/ModalStore';
import { observer } from 'mobx-react';

export interface ModalProps {
  title: string;
  content: string;
  onSubmit: () => void;
  onDiscard?: () => void;
}

export const Modal: React.FC = () => {
  const { isModalActive, modalProps, closeModal } = useModalStore();
  const outsideRef = React.useRef(null);
  const { title, onSubmit, content } = modalProps ?? {};

  const handleCloseOnOverlay = (
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    if (e.target === outsideRef.current) {
      closeModal();
    }
  };

  return isModalActive ? (
    <div className={'modal'}>
      <div
        ref={outsideRef}
        className={'modal__overlay'}
        onClick={handleCloseOnOverlay}
      />
      <div className={'modal__box'}>
        <button className={'modal__close'} onClick={closeModal}>
          {/*<img src={iconX} alt={'close'} />*/}X
        </button>
        <div className={'modal__title'}>{title}</div>
        <div className={'modal__content'}>{content}</div>
        <button onClick={onSubmit}>Да</button>
      </div>
    </div>
  ) : null;
};

export default observer(Modal);

// import './modal.css';
//
// interface ModalProps {
//     title: string;
//     isOpen: boolean;
//     onClose: () => void;
// }
//
// const Modal = ({ handleClose, show, children }) => {
//     const showHideClassName = show ? "modal display-block" : "modal display-none";
//
//     return (
//         <div className={showHideClassName}>
//             <section className="modal-main">
//                 {children}
//                 <button type="button" onClick={handleClose}>
//                     Close
//                 </button>
//             </section>
//         </div>
//     );
// };
