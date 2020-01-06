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
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba, lighten } from 'polished';

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

const MoreOptionsWrapper = styled.div`
  width: 20px;
  position: relative;
`;

const MoreOptionsIcon = styled(Icon) `
  width: 20px;
  height: 20px;
  fill: ${colors.adminSecondaryTextColor};
`;

const MoreOptionsButton = styled.button`
  width: 25px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover ${MoreOptionsIcon} {
    fill: #000;
  }
`;

const DropdownList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const ViewLinkText = styled.span`
  color: ${colors.adminLightText};
  font-size: ${fontSizes.small}px;
  text-decoration: none;
  font-weight: 400;
  white-space: nowrap;
`;

const ViewLinkIcon = styled(Icon)`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  fill: ${colors.adminLightText};
  margin-left: 10px;
`;

const ViewLink = styled(Link)`
  flex: 1 1 auto;
  text-decoration: none !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: transparent;

  &:hover,
  &:focus {
    color: white;
    text-decoration: none;
    background: ${lighten(.1, colors.adminMenuBackground)};

    ${ViewLinkText} {
      color: #fff;
    }

    ${ViewLinkIcon} {
      fill: #fff;
    }
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

  let bgColor = '#fff';

  if (moderation?.attributes?.moderation_status === 'read') {
    bgColor = '#f4f4f4';
  }

  if (selected) {
    bgColor = rgba(colors.adminTextColor, 0.1);
  }

  const handleOnChecked = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    onSelect(moderation.id);
  }, [onSelect]);

  const removeFocus = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  let viewLink = `/${moderation.attributes?.moderatable_type.toLowerCase()}s/${moderation.attributes.content_slug}`;

  if (moderation.attributes?.moderatable_type === 'Comment') {
    const belongsToLength = Object.keys(moderation.attributes.belongs_to).length;
    const parentType = Object.keys(moderation.attributes.belongs_to)[belongsToLength - 1];
    const parentSlug = moderation.attributes.belongs_to[parentType].slug;
    viewLink = `/${parentType.toLowerCase()}s/${parentSlug}`;
  }

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
        <MoreOptionsWrapper>
          <Tippy
            placement="bottom-end"
            interactive={true}
            arrow={true}
            trigger="click"
            duration={[200, 0]}
            flip={true}
            flipBehavior="flip"
            flipOnUpdate={true}
            content={
              <DropdownList>
                <ViewLink to={viewLink} target="_blank">
                  <ViewLinkText>
                    <FormattedMessage {...messages.view} values={{ contentType: contentType.toLowerCase() }} />
                  </ViewLinkText>
                  <ViewLinkIcon name="eye" />
                </ViewLink>
              </DropdownList>
            }
          >
            <MoreOptionsButton onMouseDown={removeFocus}>
              <MoreOptionsIcon name="more-options" />
            </MoreOptionsButton>
          </Tippy>
        </MoreOptionsWrapper>
      </td>
    </Container>
  );
});

export default injectIntl(ModerationRow);
