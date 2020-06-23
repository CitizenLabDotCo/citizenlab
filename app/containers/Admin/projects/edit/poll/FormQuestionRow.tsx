import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// Components
import { Input, LocaleSwitcher } from 'cl2-component-library';
import { TextCell, Row } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';

// Resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Multiloc, Locale } from 'typings';

interface InputProps {
  titleMultiloc: Multiloc;
  onChange: (value: Multiloc) => void;
  onSave: () => void;
  onCancel: () => void;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends DataProps, InputProps { }

interface State {
  selectedLocale: Locale | null;
}

class FormQuestionRow extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedLocale: !isNilOrError(props.locale) ? props.locale : null
    };
  }

  componentDidUpdate(prevProps) {
    const { locale } = this.props;

    if (prevProps.locale !== locale && !isNilOrError(locale)) {
      this.setState({ selectedLocale: locale });
    }
  }

  onChangeLocale = (selectedLocale: Locale) => {
    this.setState({ selectedLocale });
  }

  onChangeTitle = (value: string, locale: Locale | undefined) => {
    if (locale) {
      const titleMultiloc = {
        ...this.props.titleMultiloc,
        [locale]: value
      };

      this.props.onChange(titleMultiloc);
    }
  }

  render() {
    const { selectedLocale } = this.state;
    const { titleMultiloc, onSave, onCancel, tenantLocales } = this.props;
    return (
      <Row
        className="e2e-form-question-row"
      >
        <TextCell>
          {selectedLocale &&
            <LocaleSwitcher
              onSelectedLocaleChange={this.onChangeLocale}
              locales={!isNilOrError(tenantLocales) ? tenantLocales : []}
              selectedLocale={selectedLocale}
              values={{ titleMultiloc }}
            />
          }
        </TextCell>

        <TextCell className="expand">
          {selectedLocale &&
            <Input
              autoFocus
              value={titleMultiloc[selectedLocale]}
              locale={selectedLocale}
              type="text"
              onChange={this.onChangeTitle}
            />
          }
        </TextCell>

        <Button
          className="e2e-form-question-save"
          buttonStyle="secondary"
          onClick={onSave}
        >
          <FormattedMessage {...messages.saveQuestion} />
        </Button>
        <Button
          className="e2e-form-question-cancel"
          buttonStyle="secondary"
          onClick={onCancel}
        >
          <FormattedMessage {...messages.cancelFormQuestion} />
        </Button>
      </Row>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />
});

const FormQuestionRowWithData = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <FormQuestionRow {...dataProps} {...inputProps} />}
  </Data>
);

export default FormQuestionRowWithData;
