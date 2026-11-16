import React, { ReactNode } from 'react';

import { Cell as AriaCell } from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import '../tokens.css';

import styles from './NameCell.module.css';
import TreeToggle from './TreeToggle';

type KindProps =
  | {
      // A space or folder: toggle, type icon, name and its count.
      kind: 'container';
      // Counts after the name, e.g. 6 folders · 22 projects.
      meta?: ReactNode;
      // A folder search hit names its space after the count.
      spacePath?: ReactNode;
      path?: undefined;
    }
  | {
      kind: 'nested';
      meta?: undefined;
      spacePath?: undefined;
      path?: undefined;
    }
  | {
      // The flat list: the name over its path.
      kind: 'flat';
      meta?: undefined;
      spacePath?: undefined;
      path?: { space: ReactNode; folder?: ReactNode };
    };

export type NameCellProps = KindProps & {
  // The name.
  children: ReactNode;
  // Defaults to space-16 on a container and file-16 on a project.
  typeIcon?: IconName;
  // Off for a search hit, which is a plain row with no triangle.
  showToggle?: boolean;
  // The container name spans Status and Phase.
  colSpan?: number;
  textValue?: string;
};

const NameCell = ({
  kind,
  children,
  typeIcon,
  meta,
  spacePath,
  path,
  showToggle = true,
  colSpan,
  textValue,
}: NameCellProps) => (
  <AriaCell className={styles.cell} colSpan={colSpan} textValue={textValue}>
    {({ level, isExpanded, hasChildItems }) =>
      kind === 'flat' ? (
        <div className={`${styles.content} ${styles.flat}`}>
          <span className={styles.name}>{children}</span>
          {path && (
            <span className={styles.path}>
              <Icon name="space-14" className={styles.pathIcon} />
              <span className={styles.pathText}>{path.space}</span>
              {path.folder && (
                <>
                  <span className={styles.separator} aria-hidden>
                    ›
                  </span>
                  <Icon name="folder-14" className={styles.pathIcon} />
                  <span className={styles.pathText}>{path.folder}</span>
                </>
              )}
            </span>
          )}
        </div>
      ) : (
        <div className={`${styles.content} ${styles[kind]}`} data-level={level}>
          {showToggle &&
            (kind === 'container' && hasChildItems ? (
              <TreeToggle isExpanded={isExpanded} />
            ) : (
              <span className={styles.toggleSpace} />
            ))}
          <span className={styles.typeIcon}>
            <Icon
              name={typeIcon ?? (kind === 'container' ? 'space-16' : 'file-16')}
              className={styles.icon}
            />
          </span>
          <span className={styles.name}>{children}</span>
          {(meta || spacePath) && (
            <span className={styles.metaGroup}>
              {meta && <span className={styles.meta}>{meta}</span>}
              {spacePath && (
                <span className={styles.spacePath}>
                  <Icon name="space-14" className={styles.pathIcon} />
                  <span className={styles.pathText}>{spacePath}</span>
                </span>
              )}
            </span>
          )}
        </div>
      )
    }
  </AriaCell>
);

export default NameCell;
