// The repo's Jest compiles JSX with the classic runtime (React.createElement),
// the shell's Vite build with the automatic one, so shell files never import
// React. A component test imports this first to put React in scope.
import React from 'react';

(globalThis as unknown as { React: typeof React }).React = React;
