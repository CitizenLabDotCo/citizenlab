import React, { memo, useCallback } from 'react';
import moment from 'moment';
import { omitBy, isNil, isEmpty } from 'lodash-es';

// components
import ModerationContentCell from './ModerationContentCell';
import Checkbox from 'components/UI/Checkbox';
import Icon from 'components/UI/Icon';
import Tippy from '@tippy.js/react';
import Link from 'utils/cl-router/Link';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import T from 'components/T';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { rgba } from 'polished';

// typings
import { IModerationData } from 'services/moderations';
import { Multiloc } from 'typings';

const Container = styled.tr<{ bgColor: string }>`
  background: ${({ bgColor }) => bgColor};
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: -4px;
`;

const BelongsToItem = styled.div`
  width: 100%;
  margin-bottom: 8px;

  &.last {
    margin-bottom: 0px;
  }
`;

const BelongsToType = styled.span`
  margin-right: 6px;
`;

const ViewIconLinkWrapper = styled.div`
  width: 18px;
  height: 18px;
`;

const ViewIconLink = styled(Link)`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
`;

const ViewIcon = styled(Icon)`
  width: 100%;
  height: 100%;
  fill: ${colors.label};

  &:hover {
    fill: ${colors.adminTextColor};
  }
`;

interface Props {
  moderation: IModerationData;
  selected: boolean;
  onSelect: (moderationId: string) => void;
  className?: string;
}

const ModerationRow = memo<Props & InjectedIntlProps>(({ moderation, selected, onSelect, className, intl }) => {
  const contentTitle = omitBy(moderation.attributes.content_title_multiloc, (value) => isNil(value) || isEmpty(value)) as Multiloc;
  const contentBody = omitBy(moderation.attributes.content_body_multiloc, (value) => isNil(value) || isEmpty(value)) as Multiloc;
  const contentType = intl.formatMessage(messages[moderation.attributes?.moderatable_type.toLowerCase()]);
  const bgColor = (selected ? rgba(colors.adminTextColor, 0.1) : (moderation?.attributes?.moderation_status === 'read' ? '#f6f6f6' : '#fff'));
  let viewLink = `/${moderation.attributes?.moderatable_type.toLowerCase()}s/${moderation.attributes.content_slug}`;

  if (moderation.attributes?.moderatable_type === 'Comment') {
    const belongsToLength = Object.keys(moderation.attributes.belongs_to).length;
    const parentType = Object.keys(moderation.attributes.belongs_to)[belongsToLength - 1];
    const parentSlug = moderation.attributes.belongs_to[parentType].slug;
    viewLink = `/${parentType.toLowerCase()}s/${parentSlug}`;
  }

  const handleOnChecked = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    onSelect(moderation.id);
  }, [onSelect]);

  return (
    <Container
      className={className}
      bgColor={bgColor}
    >
      <td className="checkbox">
        <StyledCheckbox
          checked={selected}
          onChange={handleOnChecked}
        />
      </td>
      <td className="date">
        {moment(moderation.attributes.created_at).format('L')} {moment(moderation.attributes.created_at).format('LT')}
      </td>
      <td className="type">
        {contentType}
      </td>
      <td className="belongsTo">
        {Object.keys(moderation.attributes.belongs_to).length > 0 && Object.keys(moderation.attributes.belongs_to).map((key, index) => (
          <BelongsToItem
            key={`${moderation.id}-${key}`}
            className={index + 1 === Object.keys(moderation.attributes.belongs_to).length ? 'last' : ''}
          >
            <BelongsToType>
              <FormattedMessage {...messages[key]} />:
            </BelongsToType>
            <a href={`/${key}s/${moderation.attributes.belongs_to[key].slug}`} role="button" target="_blank">
              <T value={moderation.attributes.belongs_to[key].title_multiloc} />
            </a>
          </BelongsToItem>
        ))}

        {isEmpty(moderation.attributes.belongs_to) && <>-</>}
      </td>
      <td className="content">
        <ModerationContentCell
          contentTitle={!isEmpty(contentTitle) ? contentTitle : null}
          contentBody={contentBody}
        />
      </td>
      <td>
        <Tippy
          placement="bottom-end"
          content={<FormattedMessage {...messages.goToThisContentType} values={{ contentType: contentType.toLowerCase() }} />}
        >
          <ViewIconLinkWrapper>
            <ViewIconLink to={viewLink} target="_blank">
              <ViewIcon name="goTo" />
            </ViewIconLink>
          </ViewIconLinkWrapper>
        </Tippy>
      </td>
    </Container>
  );
});

export default injectIntl(ModerationRow);
