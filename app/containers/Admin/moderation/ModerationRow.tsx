import React, { memo, useCallback } from 'react';
import moment from 'moment';
import { omitBy, isNil, isEmpty } from 'lodash-es';

// components
import ModerationContentCell from './ModerationContentCell';
import Checkbox from 'components/UI/Checkbox';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

// styling
import styled from 'styled-components';

// typings
import { IModeration } from 'services/moderations';
import { Multiloc } from 'typings';

const StyledCheckbox = styled(Checkbox)`
  margin-top: -4px;
`;

const ContextType = styled.span`
  margin-right: 6px;
`;

interface Props {
  moderation: IModeration;
  className?: string;
}

const ModerationRow = memo<Props>(({ moderation, className }) => {
  const context = omitBy(moderation.attributes.context_multiloc, (value) => isNil(value) || isEmpty(value)) as Multiloc;
  const contextType = moderation.attributes?.context_type;
  const content = omitBy(moderation.attributes.content_multiloc, (value) => isNil(value) || isEmpty(value)) as Multiloc;
  const contentType = moderation.attributes?.moderatable_type;

  const handleOnChecked = useCallback((moderationId: string) => (event: React.MouseEvent | React.KeyboardEvent) => {
    // empty
  }, []);

  return (
    <tr className={className}>
      <td>
        <StyledCheckbox checked={false} onChange={handleOnChecked(moderation.id)} />
      </td>
      <td className="date">
        {moment(moderation.attributes.created_at).format('L')} {moment(moderation.attributes.created_at).format('LT')}
      </td>
      <td className="type">
        <FormattedMessage {...messages[contentType.toLowerCase()]} />
      </td>
      <td className="belongsTo">
        {moderation.attributes.context_multiloc && !isEmpty(context) &&
          <>
            {contextType &&
              <ContextType>
                <FormattedMessage {...messages[contextType.toLowerCase()]} />:
              </ContextType>
            }
            <a href={moderation.attributes.context_url} role="button" target="_blank">
              <T value={context} />
            </a>
          </>
        }
      </td>
      <td className="content">
        <ModerationContentCell content={content} />
      </td>
    </tr>
  );
});

export default ModerationRow;
