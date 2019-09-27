// Libraries
import React, { PureComponent } from 'react';

// Components
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import { TextCell, Row } from 'components/admin/ResourceList';
import InputMultiloc from 'components/UI/InputMultiloc';
import Button from 'components/UI/Button';

// Typings
import { Multiloc, Locale } from 'typings';

// Services
import { addPollOption, updatePollOption } from 'services/pollOptions';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

/*
* edit mode : titleMultiloc and optionId defined, question Id not used
* new mode : question Id defined, titleMultiloc and optionId not used
*/
interface Props {
  titleMultiloc?: Multiloc;
  locale: Locale;
  mode: 'new' | 'edit';
  questionId?: string;
  closeRow: () => void;
  optionId?: string;
}

interface State {
  selectedLocale: Locale;
  titleMultiloc: Multiloc;
}

class FormOptionRow extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedLocale: props.locale,
      titleMultiloc: props.titleMultiloc || {}
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { optionId, titleMultiloc } = this.props;

    if (prevProps.optionId !== optionId) {
      this.setState({ titleMultiloc: titleMultiloc || {} });
    }

    if (prevProps.locale !== this.props.locale) {
      this.setState({ selectedLocale: this.props.locale });
    }
  }

  onChangeLocale = (selectedLocale: Locale) => {
    this.setState({ selectedLocale });
  }

  onChangeTitle = (value) => {
    this.setState({ titleMultiloc: value });
  }

  onSave = () => {
    const { mode, questionId, closeRow, optionId } = this.props;
    const { titleMultiloc } = this.state;
    if (mode === 'new' && questionId) {
      addPollOption(questionId, titleMultiloc).then(() => {
        closeRow();
      });
    }
    if (mode === 'edit' && optionId) {
      updatePollOption(optionId, titleMultiloc).then(() => {
        closeRow();
      });
    }
  }

  render() {
    const { selectedLocale, titleMultiloc } = this.state;
    const { closeRow } = this.props;

    return (
      <Row
        className="e2e-form-option-row"
      >
        <TextCell>
          {selectedLocale &&
            <FormLocaleSwitcher
              onLocaleChange={this.onChangeLocale}
              selectedLocale={selectedLocale}
              values={{ titleMultiloc }}
            />
          }
        </TextCell>
        <TextCell className="expand">
          <InputMultiloc
            autoFocus
            valueMultiloc={titleMultiloc}
            type="text"
            onChange={this.onChangeTitle}
            shownLocale={selectedLocale}
          />
        </TextCell>

        <Button
          className="e2e-form-option-save"
          style="secondary"
          onClick={this.onSave}
        >
          <FormattedMessage {...messages.saveOption} />
        </Button>
        <Button
          className="e2e-form-option-cancel"
          style="secondary"
          onClick={closeRow}
        >
          <FormattedMessage {...messages.cancelOption} />
        </Button>
      </Row>
    );
  }
}

export default FormOptionRow;
