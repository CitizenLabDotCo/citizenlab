import React from 'react';

interface Modal {
  component: React.FC<any>;
}

const ModalRenderer = ({ modal }: { modal: Modal | null }) => {
  if (!modal) return null;
  const { component: Component } = modal;

  return <Component />;
};

export default ModalRenderer;
