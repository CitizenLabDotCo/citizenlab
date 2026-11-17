import React from 'react';

import '../tokens.css';
import styles from './NewDot.module.css';

// Decorative: the surrounding text must say what is new.
const NewDot = () => <span className={styles.newDot} aria-hidden />;

export default NewDot;
