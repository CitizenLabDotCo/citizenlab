import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Title from 'components/PostShowComponents/Title';
import Body from 'components/PostShowComponents/Body';
import { Tag } from 'cl2-component-library';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import { stylingConsts } from 'utils/styleUtils';
import { IMergedTagging } from 'hooks/useTaggings';
import { deleteTagging } from 'services/taggings';

const Content = styled.div`
  width: 100%;
  flex: 8;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledBody = styled(Body)`
  flex: 6;
  overflow-y: auto;
`;

const TagList = styled.div`
  flex: 1;
  margin-bottom: 20px;
  min-height: 52px;
  display: inline;
  background-color: #f9f9fa;
  border-radius: ${stylingConsts.borderRadius};
  width: 100%;
  padding: 12px;
  & > * {
    margin: 4px 4px 4px 4px;
    width: fit-content;
  }
`;

const StyledTitle = styled(Title)`
  flex: 1;
  margin-bottom: 20px;
`;

export interface InputProps {
  ideaId: string | null;
  manualTaggings: IMergedTagging[];
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

  removeTagging = (taggingId) => () => {
    deleteTagging(taggingId);
  };

  render() {
    const { idea, localize, tenant, locale, manualTaggings } = this.props;

    if (!isNilOrError(idea) && !isNilOrError(locale) && !isNilOrError(tenant)) {
      const ideaId = idea.id;
      const ideaTitle = localize(idea.attributes.title_multiloc);

      return (
        <Content>
          <StyledTitle postId={ideaId} postType="idea" title={ideaTitle} />
          <StyledBody
            postId={ideaId}
            postType="idea"
            body={localize(idea.attributes.body_multiloc)}
            locale={locale}
          />
          <TagList>
            {manualTaggings.length > 0 &&
              manualTaggings.map((tagging) =>
                tagging.tag ? (
                  <Tag
                    key={tagging.id}
                    icon="close"
                    onTagClick={this.removeTagging(tagging.id)}
                    isAutoTag={false}
                    isSelected={false}
                    text={localize(tagging.tag.attributes.title_multiloc)}
                  />
                ) : null
              )}
          </TagList>
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
