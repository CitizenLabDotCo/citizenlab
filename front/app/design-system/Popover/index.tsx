import React, { ReactNode } from 'react';

import {
  Dialog,
  Heading,
  Placement,
  Popover as AriaPopover,
} from 'react-aria-components';

import '../tokens.css';
import surfaces from '../surfaces.module.css';

import styles from './Popover.module.css';

export { DialogTrigger } from 'react-aria-components';

type LabelProps =
  | { title: ReactNode; 'aria-label'?: string }
  // Without a title the dialog needs an aria-label.
  | { title?: undefined; 'aria-label': string };

export type PopoverProps = LabelProps & {
  children: ReactNode;
  // Hug for content with its own width, such as swatches and dates.
  width?: 320 | 'hug';
  placement?: Placement;
  'data-cy'?: string;
};

// For content a Menu cannot hold. Put it in a DialogTrigger next to its trigger.
const Popover = ({
  title,
  'aria-label': ariaLabel,
  children,
  width = 320,
  placement = 'bottom end',
  'data-cy': dataCy,
}: PopoverProps) => (
  <AriaPopover
    placement={placement}
    offset={8}
    className={`${surfaces.dropdown} ${width === 320 ? styles.width320 : ''}`}
  >
    <Dialog className={styles.dialog} aria-label={ariaLabel} data-cy={dataCy}>
      {title && (
        <Heading slot="title" className={styles.title}>
          {title}
        </Heading>
      )}
      {children}
    </Dialog>
  </AriaPopover>
);

export default Popover;
