import React, { ReactNode } from 'react';

import '../tokens.css';

import styles from './RichTextEditor.module.css';

type RichTextEditorProps = {
  // A RichTextToolbar.
  toolbar: ReactNode;
  // The editing surface. The editor engine is not part of the design system.
  children: ReactNode;
};

// The frame of the description editor: the toolbar over the editing body.
const RichTextEditor = ({ toolbar, children }: RichTextEditorProps) => (
  <div className={styles.editor}>
    {toolbar}
    <div className={styles.body}>{children}</div>
  </div>
);

export default RichTextEditor;
