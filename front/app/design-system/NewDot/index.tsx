import React from 'react';

import styles from './NewDot.module.css';
import '../tokens.css';

// Decorative: the surrounding text must say what is new.
const NewDot = () => <span className={styles.newDot} aria-hidden />;

export default NewDot;
