import React from 'react';

// libraries
import { adopt } from 'react-adopt';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetInitiativeImages, { GetInitiativeImagesChildProps } from 'resources/GetInitiativeImages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import InitiativesEditFormWrapper from 'containers/InitiativesEditPage/InitiativesEditFormWrapper';
import Button from 'components/UI/Button';
import { Content, Top, Container } from '.';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { colors } from 'utils/styleUtils';

interface InputProps {
  initiativeId: string;
  goBack: () => void;
}

interface DataProps {
  initiative: GetInitiativeChildProps;
  initiativeImages: GetInitiativeImagesChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends DataProps, InputProps { }

export class InitiativesEditPage extends React.PureComponent<Props> {
  render() {
    const { locale, initiative, initiativeImages, goBack } = this.props;
    if (isNilOrError(locale) || isNilOrError(initiative) || initiativeImages === undefined) return null;

    return (
      <Container bgColor={colors.adminBackground}>
        <Top bgColor="white">
          <Button
            icon="arrow-back"
            style="text"
            textColor={colors.adminTextColor}
            onClick={goBack}
          >
            <FormattedMessage {...messages.cancelEdit} />
          </Button>
        </Top>
        <Content>
          <InitiativesEditFormWrapper
            locale={locale}
            initiative={initiative}
            initiativeImage={isNilOrError(initiativeImages) || initiativeImages.length === 0 ? null : initiativeImages[0]}
            onPublished={goBack}
          />
        </Content>
      </Container>
    );
  }
}

const Data = adopt<DataProps>({
  locale: <GetLocale />,
  initiative: ({ initiativeId, render }) => <GetInitiative id={initiativeId}>{render}</GetInitiative>,
  initiativeImages: ({ initiativeId, render }) => (
    <GetInitiativeImages initiativeId={initiativeId}>{render}</GetInitiativeImages>
  )
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativesEditPage {...dataProps} {...inputProps} />}
  </Data>
);
