import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Title from 'components/PostShowComponents/Title';
import Body from 'components/PostShowComponents/Body';
import TagWrapper from './TagWrapper';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import { stylingConsts, fontSizes, colors } from 'utils/styleUtils';
import { deleteTagging, ITagging } from 'services/taggings';
import { trackEventByName } from 'utils/analytics';

const Content = styled.div`
  width: 100%;
  flex: 8;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledTagWrapper = styled(TagWrapper)`
  height: 24px;
  font-weight: 500;
  margin: 0px 4px 4px 0px;
  width: fit-content;
  > * {
    font-size: ${fontSizes.large}px;
    align-self: center;
    line-height: 14px;
    > * {
      height: 14px;
    }
  }
`;

const StyledBody = styled(Body)`
  flex: 6;
  overflow-y: auto;
`;

const TagList = styled.div`
  overflow-y: auto;
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
  margin-top: 20px;
`;

export interface InputProps {
  ideaId: string | null;
  manualTaggings: ITagging[];
}

interface DataProps {
  idea: GetIdeaChildProps;
  tenant: GetAppConfigurationChildProps;
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
    trackEventByName('Manual Tagging', {
      action: 'removed tagging',
    });
    deleteTagging(taggingId);
  };

  render() {
    const { idea, localize, tenant, locale, manualTaggings } = this.props;

    return (
      <Content>
        {!isNilOrError(idea) && !isNilOrError(locale) && !isNilOrError(tenant) && (
          <>
            <StyledTitle
              postId={idea.id}
              postType="idea"
              title={localize(idea.attributes.title_multiloc)}
              color={colors.adminTextColor}
            />
            <StyledBody
              postId={idea.id}
              postType="idea"
              body={localize(idea.attributes.body_multiloc)}
              locale={locale}
              color={colors.adminTextColor}
            />
            <TagList>
              {manualTaggings.length > 0 &&
                manualTaggings.map((tagging) => (
                  <StyledTagWrapper
                    key={tagging.id}
                    onTagClick={this.removeTagging(tagging.id)}
                    isAutoTag={false}
                    isSelected={false}
                    icon="close"
                    tagId={tagging.attributes.tag_id}
                  />
                ))}
            </TagList>
          </>
        )}
      </Content>
    );
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
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
