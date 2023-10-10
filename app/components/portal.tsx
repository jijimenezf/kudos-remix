import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import type { PortalProps } from '~/utils/types.server';

// 1
const createWrapper = (wrapperId: string) => {
  const wrapper = document.createElement('div')
  wrapper.setAttribute('id', wrapperId)
  document.body.appendChild(wrapper)
  return wrapper
}

export const Portal: React.FC<PortalProps> = ({ children, wrapperId }) => {
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // 2
    let element = document.getElementById(wrapperId)
    let created = false

    if (!element) {
      created = true
      element = createWrapper(wrapperId)
    }

    setWrapper(element)

    // 3
    return () => {
      if (created && element?.parentNode) {
        element.parentNode.removeChild(element)
      }
    }
  }, [wrapperId]);

  if (wrapper === null) return null

  // 4
  return createPortal(children, wrapper)
}