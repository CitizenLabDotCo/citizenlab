import React, { PureComponent } from 'react';

// Components
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import { TextCell, Row } from 'components/admin/ResourceList';
import InputMultiloc from 'components/UI/InputMultiloc';
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
  shownLocale: Locale;
}

class FormQuestionRow extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      shownLocale: props.locale
    };
  }

  onChangeLocale = (shownLocale: Locale) => () => {
    this.setState({ shownLocale });
  }

  render() {
    const { shownLocale } = this.state;
    const { titleMultiloc, onChange, onSave, onCancel } = this.props;
    return (
      <Row
        className="e2e-form-question-row"
      >
        <TextCell>
          {shownLocale &&
            <FormLocaleSwitcher
              onLocaleChange={this.onChangeLocale}
              selectedLocale={shownLocale}
              values={{ titleMultiloc }}
            />
          }
        </TextCell>
        <TextCell className="expand">
          <InputMultiloc
            valueMultiloc={titleMultiloc}
            type="text"
            onChange={onChange}
            shownLocale={shownLocale}
          />
        </TextCell>

        <Button
          className="e2e-form-question-save"
          style="secondary"
          onClick={onSave}
        >
          <FormattedMessage {...messages.saveQuestion} />
        </Button>
        <Button
          className="e2e-form-question-cancel"
          style="secondary"
          onClick={onCancel}
        >
          <FormattedMessage {...messages.cancelFormQuestion} />
        </Button>
      </Row>
    );
  }
}

export default FormQuestionRow;
