import { createContext, useContext } from 'react';

export type PollVariant = 'default' | 'bo';

export const PollVariantContext = createContext<PollVariant>('default');

const BO_BUTTON_STYLES = {
  'admin-dark': 'bo-primary',
  'secondary-outlined': 'bo-secondary',
  text: 'bo-text',
} as const;

type PollButtonStyle = keyof typeof BO_BUTTON_STYLES;

// The poll editor also lives in the redesigned back office, where its
// controls take the bo styles.
export const usePollStyles = () => {
  const variant = useContext(PollVariantContext);
  const isBo = variant === 'bo';

  return {
    isBo,
    buttonStyle: (style: PollButtonStyle) =>
      isBo ? BO_BUTTON_STYLES[style] : style,
    boSize: isBo ? ('medium' as const) : undefined,
    inputVariant: isBo ? ('bo' as const) : undefined,
  };
};
