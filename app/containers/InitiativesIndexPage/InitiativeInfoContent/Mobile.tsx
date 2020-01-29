import React, { memo } from 'react';

// components
import InitiatiativeInfoContent from '.';
import CollapsibleBox from 'components/UI/CollapsibleBox';

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
      content={<InitiatiativeInfoContent />}
    />
  );

});

export default Mobile;
