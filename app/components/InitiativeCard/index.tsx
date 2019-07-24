import React, { PureComponent, FormEvent } from 'react';
import { get, isUndefined, isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Card from 'components/UI/Card';
import Icon from 'components/UI/Icon';
import Author from 'components/Author';
import VoteIndicator from './VoteIndicator';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetInitiativeImage, { GetInitiativeImageChildProps } from 'resources/GetInitiativeImage';
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// typings
import { IOpenPostPageModalEvent } from 'containers/App';

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

const FooterInner = styled.div`
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
  margin-bottom: 20px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const CommentIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  fill: ${colors.label};
  margin-right: 6px;
  margin-top: 2px;
`;

const CommentCount = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
`;

const CommentInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export interface InputProps {
  initiativeId: string;
  className?: string;
}

interface DataProps {
  tenant: GetTenantChildProps;
  initiative: GetInitiativeChildProps;
  initiativeImage: GetInitiativeImageChildProps;
  initiativeAuthor: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class InitiativeCard extends PureComponent<Props & InjectedIntlProps & InjectedLocalized, State> {

  onCardClick = (event: FormEvent) => {
    event.preventDefault();

    const { initiative } = this.props;

    if (!isNilOrError(initiative)) {
      eventEmitter.emit<IOpenPostPageModalEvent>('InitiativeCard', 'initiativeCardClick', {
        id: initiative.id,
        slug: initiative.attributes.slug,
        type: 'initiative'
      });
    }
  }

  render() {
    const { initiative, initiativeImage, initiativeAuthor, tenant, localize, className } = this.props;
    const { formatMessage } = this.props.intl;

    if (
      !isNilOrError(tenant) &&
      !isNilOrError(initiative) &&
      !isUndefined(initiativeImage) &&
      !isUndefined(initiativeAuthor)
    ) {
      const orgName = localize(tenant.attributes.settings.core.organization_name);
      const initiativeTitle = localize(initiative.attributes.title_multiloc);
      const initiativeAuthorId = !isNilOrError(initiativeAuthor) ? initiativeAuthor.id : null;
      const initiativeImageUrl: string | null = get(initiativeImage, 'attributes.versions.medium', null);
      const initiativeImageAltText = orgName && initiativeTitle ? formatMessage(messages.imageAltText, { orgName, initiativeTitle }) : null;
      const cardClassNames = [
        className,
        'e2e-initiative-card',
        get(initiative, 'relationships.user_vote.data') ? 'voted' : 'not-voted',
        initiative.attributes.comments_count > 0 ? 'e2e-has-comments' : null,
      ].filter(item => isString(item) && item !== '').join(' ');

      return (
        <Card
          className={cardClassNames}
          onClick={this.onCardClick}
          to={`/initiatives/${initiative.attributes.slug}`}
          imageUrl={initiativeImageUrl}
          imageAltText={initiativeImageAltText}
          title={initiativeTitle}
          body={
            <StyledAuthor
              authorId={initiativeAuthorId}
              message={messages.byAuthorName}
              createdAt={initiative.attributes.published_at}
              size="34px"
              notALink
            />
          }
          footer={
            <FooterInner>
              <VoteIndicator initiativeId={initiative.id} />
              <Spacer />
              <CommentInfo>
                <CommentIcon name="comments" />
                <CommentCount className="e2e-initiativecard-comment-count">
                  <span>{initiative.attributes.comments_count}</span>
                </CommentCount>
              </CommentInfo>
            </FooterInner>
          }
        />
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  initiative: ({ initiativeId, render }) => <GetInitiative id={initiativeId}>{render}</GetInitiative>,
  initiativeImage: ({ initiativeId, initiative, render }) => <GetInitiativeImage initiativeId={initiativeId} initiativeImageId={get(initiative, 'relationships.initiative_images.data[0].id')}>{render}</GetInitiativeImage>,
  initiativeAuthor: ({ initiative, render }) => <GetUser id={get(initiative, 'relationships.author.data.id')}>{render}</GetUser>
});

const InitiativeCardWithHoC = injectIntl(injectLocalize(InitiativeCard));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativeCardWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
