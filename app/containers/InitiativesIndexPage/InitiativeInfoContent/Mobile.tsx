import React, { memo } from 'react';

// components
import CollapsibleBox from 'components/UI/CollapsibleBox';
const InitiatiativeInfoContent = React.lazy(() => import('.'));

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export interface Props {
  className?: string;
}

const Mobile = memo<Props>(({ className }: Props) => {
  return (
    <CollapsibleBox
      className={className}
      titleIconName="info"
      title={<FormattedMessage {...messages.explanationTitle} />}
    >
      <InitiatiativeInfoContent />
    </CollapsibleBox>
  );
});

export default Mobile;
