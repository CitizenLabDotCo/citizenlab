import React, { PureComponent } from 'react';

// Components
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import { TextCell, Row } from 'components/admin/ResourceList';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Multiloc, Locale } from 'typings';

interface Props {
  titleMultiloc: Multiloc;
  onChange: (value: Multiloc) => void;
  locale: Locale;
  onSave: () => void;
  onCancel: () => void;
}

interface State {
  selectedLocale: Locale;
}

class FormQuestionRow extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedLocale: props.locale,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.locale !== this.props.locale) {
      this.setState({ selectedLocale: this.props.locale });
    }
  }

  onChangeLocale = (selectedLocale: Locale) => {
    this.setState({ selectedLocale });
  };

  onChangeTitle = (value: string, locale: Locale | undefined) => {
    if (locale) {
      const titleMultiloc = {
        ...this.props.titleMultiloc,
        [locale]: value,
      };

      this.props.onChange(titleMultiloc);
    }
  };

  render() {
    const { selectedLocale } = this.state;
    const { titleMultiloc, onSave, onCancel } = this.props;
    return (
      <Row className="e2e-form-question-row">
        <TextCell>
          {selectedLocale && (
            <FormLocaleSwitcher
              onLocaleChange={this.onChangeLocale}
              selectedLocale={selectedLocale}
              values={{ titleMultiloc }}
            />
          )}
        </TextCell>
        <TextCell className="expand">
          <Input
            autoFocus
            value={titleMultiloc[selectedLocale]}
            locale={selectedLocale}
            type="text"
            onChange={this.onChangeTitle}
          />
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

export default FormQuestionRow;
