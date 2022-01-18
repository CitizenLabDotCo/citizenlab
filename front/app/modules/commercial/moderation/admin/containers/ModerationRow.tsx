import React, { memo } from 'react';
import moment from 'moment';

// components
import ModerationContentCell from './ModerationContentCell';
import Checkbox from 'components/UI/Checkbox';
import Outlet from 'components/Outlet';
import { Icon } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import Link from 'utils/cl-router/Link';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import useLocalize from 'hooks/useLocalize';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { rgba } from 'polished';

// typings
import {
  IModerationData,
  TBelongsTo,
  TModeratableType,
} from '../../services/moderations';

// hooks
import useInappropriateContentFlag from 'modules/commercial/flag_inappropriate_content/hooks/useInappropriateContentFlag';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.tr<{ bgColor: string; flagged: boolean }>`
  background: ${({ bgColor, flagged }) =>
    flagged ? colors.clRedErrorBackground : bgColor};
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

const GoToLinkWrapper = styled.div`
  width: 18px;
  height: 18px;
`;

const GoToLink = styled(Link)`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
`;

const GoToIcon = styled(Icon)`
  width: 100%;
  height: 100%;
  fill: ${colors.label};

  &:hover {
    fill: ${colors.adminTextColor};
  }
`;

const StyledModerationContentCell = styled(ModerationContentCell)`
  margin-bottom: 20px;
`;

interface Props {
  moderation: IModerationData;
  selected: boolean;
  onSelect: (selectedModeration: IModerationData) => void;
  className?: string;
  inappropriateContentFlagId?: string;
}

const ideasPath = '/ideas';
const initiativesPath = '/initiatives';
const projectsPath = '/projects';

const ModerationRow = memo<Props & InjectedIntlProps>(
  ({
    moderation,
    selected,
    onSelect,
    className,
    intl: { formatMessage },
    inappropriateContentFlagId,
  }) => {
    const localize = useLocalize();
    const inappropriateContentFlag = inappropriateContentFlagId
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useInappropriateContentFlag(inappropriateContentFlagId)
      : null;
    const hasActiveInappropriateContentFlag = !isNilOrError(
      inappropriateContentFlag
    )
      ? inappropriateContentFlag.attributes.reason_code !== null
      : false;
    const contentTitle = moderation.attributes.content_title_multiloc;
    const contentBody = moderation.attributes.content_body_multiloc;
    const moderatableType = moderation.attributes.moderatable_type;
    const belongsToTypes = Object.keys(moderation.attributes.belongs_to);
    const bgColor = selected
      ? rgba(colors.adminTextColor, 0.1)
      : moderation.attributes.moderation_status === 'read'
      ? '#f6f6f6'
      : '#fff';
    const viewLink = getViewLink(moderatableType);

    const handleOnChecked = (_event: React.ChangeEvent) => {
      onSelect(moderation);
    };

    const handleGoToLinkOnClick = (
      event: React.MouseEvent<HTMLAnchorElement>
    ) => {
      event.preventDefault();
      const url = event.currentTarget.href;
      const type = event.currentTarget.dataset.type;
      trackEventByName(tracks.goToLinkClicked, { type });
      const win = window.open(url, '_blank');
      win && win.focus();
    };

    const handleBelongsToLinkOnClick = (
      event: React.MouseEvent<HTMLAnchorElement>
    ) => {
      event.preventDefault();
      const url = event.currentTarget.href;
      const belongsToType = event.currentTarget.dataset.belongstotype;
      trackEventByName(tracks.belongsToLinkClicked, { belongsToType });
      const win = window.open(url, '_blank');
      win && win.focus();
    };

    function getViewLink(moderatableType: TModeratableType) {
      if (moderatableType === 'Comment') {
        if (
          belongsToTypes.includes('initiative') &&
          moderation.attributes.belongs_to.initiative?.slug
        ) {
          return `${initiativesPath}/${moderation.attributes.belongs_to.initiative.slug}`;
        }

        if (
          belongsToTypes.includes('idea') &&
          moderation.attributes.belongs_to.idea?.slug
        ) {
          return `${ideasPath}/${moderation.attributes.belongs_to.idea.slug}`;
        }
      }

      if (moderatableType === 'Idea') {
        return `${ideasPath}/${moderation.attributes.content_slug}`;
      }

      if (moderatableType === 'Initiative') {
        return `${initiativesPath}/${moderation.attributes.content_slug}`;
      }

      return null;
    }

    return (
      <Container
        className={`${className}`}
        flagged={hasActiveInappropriateContentFlag}
        bgColor={bgColor}
      >
        <td className="checkbox">
          <StyledCheckbox checked={selected} onChange={handleOnChecked} />
        </td>
        <td className="date">
          {moment(moderation.attributes.created_at).format('L')}{' '}
          {moment(moderation.attributes.created_at).format('LT')}
        </td>
        <td className="type">
          {formatMessage(
            {
              Idea: messages.post,
              Comment: messages.comment,
              Initiative: messages.initiative,
            }[moderatableType]
          )}
        </td>
        <td className="belongsTo">
          {belongsToTypes.length > 0 ? (
            belongsToTypes.map((belongsToType: TBelongsTo, index) => {
              const belongsToTypeMessage = {
                idea: messages.post,
                project: messages.project,
                initiative: messages.initiative,
              }[belongsToType];
              const belongsToTitleMultiloc =
                moderation.attributes.belongs_to[belongsToType]?.title_multiloc;
              const belongsToHref = {
                idea: `${ideasPath}/${moderation.attributes.belongs_to.idea?.slug}`,
                initiative: `${initiativesPath}/${moderation.attributes.belongs_to.initiative?.slug}`,
                project: `${projectsPath}/${moderation.attributes.belongs_to.project?.slug}`,
              }[belongsToType];

              if (belongsToTitleMultiloc) {
                return (
                  <BelongsToItem
                    key={`${moderation.id}-${belongsToType}`}
                    className={
                      index + 1 === belongsToTypes.length ? 'last' : ''
                    }
                  >
                    <BelongsToType>
                      <FormattedMessage {...belongsToTypeMessage} />:
                    </BelongsToType>
                    <a
                      href={belongsToHref}
                      onClick={handleBelongsToLinkOnClick}
                      data-belongstotype={belongsToType}
                    >
                      {localize(belongsToTitleMultiloc)}
                    </a>
                  </BelongsToItem>
                );
              }

              return null;
            })
          ) : (
            <>-</>
          )}
        </td>
        <td className="content">
          <StyledModerationContentCell
            contentTitle={contentTitle}
            contentBody={contentBody}
          />
          <Outlet
            id="app.modules.commercial.moderation.admin.containers.ModerationRow.content"
            inappropriateContentFlagId={inappropriateContentFlagId}
          />
        </td>
        {viewLink && (
          <td>
            <Tippy
              placement="bottom-end"
              content={
                <FormattedMessage
                  {...{
                    Idea: messages.goToPost,
                    Initiative: messages.goToProposal,
                    Comment: messages.goToComment,
                  }[moderatableType]}
                />
              }
            >
              <GoToLinkWrapper>
                <GoToLink
                  to={viewLink}
                  onClick={handleGoToLinkOnClick}
                  data-type={moderatableType}
                >
                  <GoToIcon name="goTo" />
                </GoToLink>
              </GoToLinkWrapper>
            </Tippy>
          </td>
        )}
      </Container>
    );
  }
);

export default injectIntl(ModerationRow);
