import React from 'react';

// libraries
import { adopt } from 'react-adopt';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import GetInitiativeImages, {
  GetInitiativeImagesChildProps,
} from 'resources/GetInitiativeImages';
import GetRemoteFiles, {
  GetRemoteFilesChildProps,
} from 'resources/GetRemoteFiles';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// utils
import { isNilOrError, isError } from 'utils/helperUtils';

// components
import InitiativesEditFormWrapper from 'containers/InitiativesEditPage/InitiativesEditFormWrapper';
import Button from 'components/UI/Button';
import { Box, LocaleSwitcher } from '@citizenlab/cl2-component-library';
import { Content, Top, Container } from '../PostPreview';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { colors } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';
import { ITopicData } from 'services/topics';

export interface InputProps {
  initiativeId: string;
  goBack: () => void;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
  initiative: GetInitiativeChildProps;
  initiativeImages: GetInitiativeImagesChildProps;
  initiativeFiles: GetRemoteFilesChildProps;
  topics: GetTopicsChildProps;
}

interface Props extends DataProps, InputProps {}

interface State {
  selectedLocale: GetLocaleChildProps;
}

export class InitiativesEditPage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedLocale: props.locale,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { locale } = this.props;
    if (!this.state.selectedLocale && locale !== prevProps.locale) {
      this.setState({ selectedLocale: locale });
    }
  }

  onLocaleChange = (locale: Locale) => {
    this.setState({ selectedLocale: locale });
  };

  render() {
    const {
      locale,
      initiative,
      initiativeImages,
      goBack,
      initiativeFiles,
      topics,
      tenantLocales,
    } = this.props;
    const { selectedLocale } = this.state;

    if (
      isNilOrError(locale) ||
      isNilOrError(tenantLocales) ||
      !selectedLocale ||
      isNilOrError(initiative) ||
      initiativeImages === undefined ||
      initiativeFiles === undefined ||
      isError(initiativeFiles) ||
      isNilOrError(topics)
    ) {
      return null;
    }
    const initiativeTopics = topics.filter(
      (topic) => !isNilOrError(topic)
    ) as ITopicData[];

    return (
      <Container>
        <Top>
          <Box width="100%" justifyContent="space-between" display="flex">
            <Box>
              <Button
                icon="arrow-left"
                buttonStyle="text"
                textColor={colors.primary}
                onClick={goBack}
              >
                <FormattedMessage {...messages.cancelEdit} />
              </Button>
            </Box>
            <Box my="auto" mr="8px">
              <LocaleSwitcher
                onSelectedLocaleChange={this.onLocaleChange}
                locales={tenantLocales}
                selectedLocale={selectedLocale}
              />
            </Box>
          </Box>
        </Top>
        <Content>
          <InitiativesEditFormWrapper
            locale={selectedLocale}
            initiative={initiative}
            initiativeImage={
              isNilOrError(initiativeImages) || initiativeImages.length === 0
                ? null
                : initiativeImages[0]
            }
            onPublished={goBack}
            initiativeFiles={initiativeFiles}
            topics={initiativeTopics}
          />
        </Content>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  topics: <GetTopics excludeCode={'custom'} />,
  tenantLocales: <GetAppConfigurationLocales />,
  initiative: ({ initiativeId, render }) => (
    <GetInitiative id={initiativeId}>{render}</GetInitiative>
  ),
  initiativeImages: ({ initiativeId, render }) => (
    <GetInitiativeImages initiativeId={initiativeId}>
      {render}
    </GetInitiativeImages>
  ),
  initiativeFiles: ({ initiativeId, render }) => (
    <GetRemoteFiles resourceId={initiativeId} resourceType="initiative">
      {render}
    </GetRemoteFiles>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <InitiativesEditPage {...dataProps} {...inputProps} />}
  </Data>
);
