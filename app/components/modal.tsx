import { Portal } from './portal';
import { useNavigate } from '@remix-run/react';
import type { ModalProps } from '~/utils/types.server';

export const Modal: React.FC<ModalProps> = ({ children, isOpen, ariaLabel, className }) => {
  const navigate = useNavigate();
  if (!isOpen) {
    return null;
  }

  return (
    <Portal wrapperId="modal">
      <div
        className="fixed inset-0 overflow-y-auto bg-gray-600 bg-opacity-80"
        aria-labelledby={ariaLabel ?? 'modal-title'}
        role="dialog"
        aria-modal="true"
        onClick={() => navigate('/home')}
      ></div>
      <div className="fixed inset-0 pointer-events-none flex justify-center items-center max-h-screen overflow-scroll">
        <div className={`${className} p-4 bg-gray-200 pointer-events-auto max-h-screen md:rounded-xl`}>
          {/* This is where the modal content is rendered  */}
          {children}
        </div>
      </div>
    </Portal>
  )
}