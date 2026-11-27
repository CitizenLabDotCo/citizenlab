import React, { ReactNode } from 'react';

import { Dialog, Popover as AriaPopover } from 'react-aria-components';

import surfaces from '../surfaces.module.css';

import styles from './Popover.module.css';
import '../tokens.css';

export { DialogTrigger } from 'react-aria-components';

type PopoverProps = {
  'aria-label': string;
  children: ReactNode;
  // Hug for content with its own width, such as swatches and dates.
  width?: 320 | 'hug';
  placement?: 'bottom end' | 'bottom start';
  // 12 for a dense body such as Share; none when the body pads its own parts,
  // such as a selection list with a footer.
  padding?: 16 | 12 | 'none';
};

// For content a Menu cannot hold. Put it in a DialogTrigger next to its trigger.
const Popover = ({
  'aria-label': ariaLabel,
  children,
  width = 320,
  placement = 'bottom end',
  padding = 16,
}: PopoverProps) => (
  <AriaPopover
    placement={placement}
    offset={8}
    className={`${surfaces.dropdown} ${width === 320 ? styles.width320 : ''}`}
  >
    <Dialog
      className={`${styles.dialog} ${styles[`padding${padding}`]}`}
      aria-label={ariaLabel}
    >
      {children}
    </Dialog>
  </AriaPopover>
);

export default Popover;
