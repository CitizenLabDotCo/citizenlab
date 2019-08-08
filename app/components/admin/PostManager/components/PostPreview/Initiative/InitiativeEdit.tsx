import React from 'react';

// libraries
import { adopt } from 'react-adopt';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetInitiativeImages, { GetInitiativeImagesChildProps } from 'resources/GetInitiativeImages';
import GetResourceFileObjects, { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isError } from 'util';

// components
import InitiativesEditFormWrapper from 'containers/InitiativesEditPage/InitiativesEditFormWrapper';
import Button from 'components/UI/Button';
import { Content } from '../index';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

import { Locale } from 'typings';

const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
  margin: 0;
`;

const Container = styled.div`
  min-height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  height: 50px;
  width: 100%;
  padding-left: 10px;
  padding-right: 50px;
  z-index: 1;
`;

interface InputProps {
  initiativeId: string;
  goBack: () => void;
}

interface DataProps {
  initiative: GetInitiativeChildProps;
  initiativeImages: GetInitiativeImagesChildProps;
  locale: GetLocaleChildProps;
  initiativeFiles: GetResourceFileObjectsChildProps;
}

interface Props extends DataProps, InputProps { }

interface State {
  selectedLocale: GetLocaleChildProps;
}

export class InitiativesEditPage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as Props);
    this.state = {
      selectedLocale: props.locale,
    };
  }

  componentWillReceiveProps(nextProps : Props) {
    const { locale } = nextProps;
    if (!this.state.selectedLocale && this.props.locale !== locale) {
      this.setState({ selectedLocale: locale });
    }
  }

  onLocaleChange = (locale: Locale) => () => {
    this.setState({ selectedLocale: locale });
  }

  render() {
    const { locale, initiative, initiativeImages, goBack, initiativeFiles } = this.props;
    const { selectedLocale } = this.state;

    if (
      isNilOrError(locale) ||
      !selectedLocale ||
      isNilOrError(initiative) ||
      initiativeImages === undefined ||
      initiativeFiles === undefined ||
      isError(initiativeFiles)
    ) return null;

    return (
      <Container>
        <Top>
          <Button
            icon="arrow-back"
            style="text"
            textColor={colors.adminTextColor}
            onClick={goBack}
          >
            <FormattedMessage {...messages.cancelEdit} />
          </Button>
          <StyledFormLocaleSwitcher
            onLocaleChange={this.onLocaleChange}
            selectedLocale={selectedLocale}
            values={{}}
          />
        </Top>
        <Content>
          <InitiativesEditFormWrapper
            locale={selectedLocale}
            initiative={initiative}
            initiativeImage={isNilOrError(initiativeImages) || initiativeImages.length === 0 ? null : initiativeImages[0]}
            onPublished={goBack}
            initiativeFiles={initiativeFiles}
          />
        </Content>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  initiative: ({ initiativeId, render }) => <GetInitiative id={initiativeId}>{render}</GetInitiative>,
  initiativeImages: ({ initiativeId, render }) => <GetInitiativeImages initiativeId={initiativeId}>{render}</GetInitiativeImages>,
  initiativeFiles: ({ initiativeId, render }) => <GetResourceFileObjects resourceId={initiativeId} resourceType="initiative">{render}</GetResourceFileObjects>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativesEditPage {...dataProps} {...inputProps} />}
  </Data>
);
