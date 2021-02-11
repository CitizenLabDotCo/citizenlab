import React, { PureComponent } from 'react';
import { mapValues, lowerCase } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { ButtonWrapper } from 'components/admin/PageWrapper';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import { updateTenant } from 'services/appConfiguration';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc } from 'typings';
import messages from '../messages';

// styling
import styled from 'styled-components';

const Container = styled.form`
  width: 100%;
  max-width: 500px;
  padding: 25px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
}

interface Props extends DataProps, InputProps, InjectedIntlProps {}

interface State {
  areasTerm?: Multiloc;
  areaTerm?: Multiloc;
  submitState: 'enabled' | 'saving' | 'error' | 'success';
}

class AreaTermConfig extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      areasTerm: undefined,
      areaTerm: undefined,
      submitState: 'enabled',
    };
  }

  save = () => {
    const { tenant } = this.props;
    const { areasTerm, areaTerm } = this.state;
    if (!isNilOrError(tenant)) {
      this.setState({ submitState: 'saving' });
      try {
        updateTenant(tenant.id, {
          settings: {
            core: {
              areas_term: areasTerm,
              area_term: areaTerm,
            },
          },
        }).then(() => {
          this.setState({ submitState: 'success' });
        });
      } catch (error) {
        this.setState({ submitState: 'error' });
      }
    }
  };

  handleAreaChange = (changedAreaTerm: Multiloc) => {
    this.setState({
      areaTerm: mapValues(changedAreaTerm, lowerCase),
    });
  };

  handleAreasChange = (changedAreasTerm: Multiloc) => {
    this.setState({
      areasTerm: mapValues(changedAreasTerm, lowerCase),
    });
  };

  render() {
    const {
      tenant,
      className,
      intl: { formatMessage },
    } = this.props;
    const { submitState } = this.state;

    if (isNilOrError(tenant)) return null;

    const areasTerm =
      this.state.areasTerm || tenant.attributes.settings.core.areas_term || {};
    const areaTerm =
      this.state.areaTerm || tenant.attributes.settings.core.area_term || {};

    return (
      <Container onSubmit={this.save} className={className}>
        <SectionField>
          <InputMultilocWithLocaleSwitcher
            type="text"
            id="area_term"
            label={<FormattedMessage {...messages.areaTerm} />}
            valueMultiloc={areaTerm}
            onChange={this.handleAreaChange}
            placeholder={formatMessage(messages.areaTermPlaceholder)}
          />
        </SectionField>

        <SectionField>
          <InputMultilocWithLocaleSwitcher
            type="text"
            id="areas_term"
            label={<FormattedMessage {...messages.areasTerm} />}
            valueMultiloc={areasTerm}
            onChange={this.handleAreasChange}
            placeholder={formatMessage(messages.areasTermPlaceholder)}
          />
        </SectionField>

        <ButtonWrapper>
          <Button
            processing={submitState === 'saving'}
            onClick={this.save}
            buttonStyle="cl-blue"
            type="submit"
          >
            <FormattedMessage {...messages.areasTermsSave} />
          </Button>
        </ButtonWrapper>
      </Container>
    );
  }
}

const AreaTermConfigWithHocs = injectIntl(AreaTermConfig);

export default (inputProps: InputProps) => (
  <GetAppConfiguration>
    {(tenant) => <AreaTermConfigWithHocs {...inputProps} tenant={tenant} />}
  </GetAppConfiguration>
);
