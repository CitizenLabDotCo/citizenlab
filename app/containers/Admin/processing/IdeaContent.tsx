import React, { PureComponent } from 'react';
import { isNilOrError, getFormattedBudget } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Title from 'components/PostShowComponents/Title';
import Body from 'components/PostShowComponents/Body';
import IdeaProposedBudget from 'containers/IdeasShow/IdeaProposedBudget';
import { Tag } from 'cl2-component-library';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { stylingConsts } from 'utils/styleUtils';

const Content = styled.div`
  width: 100%;
  flex: 5;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledBody = styled(Body)`
  min-height: calc(100vh - ${stylingConsts.menuHeight}px - 200px);
  overflow-y: auto;
`;

const TagList = styled.div`
  text-align: right;
  width: 100%;
  margin-bottom: 10px;
`;

const StyledTitle = styled(Title)`
  margin-bottom: 20px;
`;

const BodySectionTitle = styled.h2`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: 400;
  line-height: 28px;
`;

export interface InputProps {
  ideaId: string | null;
}

interface DataProps {
  idea: GetIdeaChildProps;
  tenant: GetTenantChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

export class IdeaContent extends PureComponent<
  Props & InjectedLocalized & InjectedIntlProps
> {
  constructor(props) {
    super(props);
  }

  render() {
    const { idea, localize, tenant, locale } = this.props;

    if (!isNilOrError(idea) && !isNilOrError(locale) && !isNilOrError(tenant)) {
      const ideaId = idea.id;
      const ideaTitle = localize(idea.attributes.title_multiloc);
      // AuthorId can be null if user has been deleted
      const proposedBudget = idea.attributes.proposed_budget;
      const currency = tenant.attributes.settings.core.currency;

      return (
        <Content>
          <StyledTitle postId={ideaId} postType="idea" title={ideaTitle} />
          {proposedBudget && (
            <>
              <BodySectionTitle>
                <FormattedMessage {...messages.proposedBudgetTitle} />
              </BodySectionTitle>
              <IdeaProposedBudget
                formattedBudget={getFormattedBudget(
                  locale,
                  proposedBudget,
                  currency
                )}
              />
              <BodySectionTitle>
                <FormattedMessage {...messages.description} />
              </BodySectionTitle>
            </>
          )}

          <TagList>
            <Tag isAutoTag={false} isSelected={false} text="tag one" />
            <Tag isAutoTag={false} isSelected={false} text="tag one" />
            <Tag isAutoTag={false} isSelected={false} text="tag one" />
            <Tag isAutoTag={false} isSelected={false} text="tag one" />
          </TagList>
          <StyledBody
            postId={ideaId}
            postType="idea"
            body={localize(idea.attributes.body_multiloc)}
            locale={locale}
          />
        </Content>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  locale: <GetLocale />,
  idea: ({ ideaId, render }) => <GetIdea ideaId={ideaId}>{render}</GetIdea>,
});

const IdeaContentWithHOCs = injectIntl(injectLocalize(IdeaContent));

const WrappedIdeaContent = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaContentWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedIdeaContent;
