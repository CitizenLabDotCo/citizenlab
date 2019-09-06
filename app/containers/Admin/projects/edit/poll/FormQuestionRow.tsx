import React, { PureComponent } from 'react';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import { TextCell, Row } from 'components/admin/ResourceList';
import InputMultiloc from 'components/UI/InputMultiloc';
import { Multiloc, Locale } from 'typings';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  titleMultiloc: Multiloc;
  onChange: (value: Multiloc) => void;
  locale: Locale;
  onSave: () => void;
  id?: string;
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
    const { titleMultiloc, onChange, onSave, id } = this.props;
    return (
      <Row
        className="e2e-form-question-row"
        id={id}
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
          className="e2e-form-question"
          style="secondary"
          onClick={onSave}
        >
          <FormattedMessage {...messages.saveQuestion} />
        </Button>
      </Row>
    );
  }
}

export default FormQuestionRow;
