import React, { PureComponent } from 'react';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import { TextCell, Row } from 'components/admin/ResourceList';
import InputMultiloc from 'components/UI/InputMultiloc';
import { Multiloc, Locale } from 'typings';
import Button from 'components/UI/Button';
import { addPollOption, updatePollOption } from 'services/pollOptions';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  titleMultiloc?: Multiloc;
  locale: Locale;
  id?: string;
  mode: 'new' | 'edit';
  questionId?: string;
  closeRow: () => void;
  optionId?: string;
}

interface State {
  shownLocale: Locale;
  titleMultiloc: Multiloc;
}

class FormOptionRow extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      shownLocale: props.locale,
      titleMultiloc: props.titleMultiloc || {}
    };
  }

  onChangeLocale = (shownLocale: Locale) => () => {
    this.setState({ shownLocale });
  }

  onChangeTitle = (value) => {
    this.setState({ titleMultiloc: value });
  }

  onSave = () => {
    const { mode, questionId, closeRow, optionId } = this.props;
    const { titleMultiloc } = this.state;
    console.log(titleMultiloc);
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
    const { shownLocale, titleMultiloc } = this.state;
    const { id } = this.props;
    return (
      <Row
        className="e2e-form-option-row"
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
            onChange={this.onChangeTitle}
            shownLocale={shownLocale}
          />
        </TextCell>

        <Button
          className="e2e-form-option"
          style="secondary"
          onClick={this.onSave}
        >
          <FormattedMessage {...messages.saveOption} />
        </Button>
      </Row>
    );
  }
}

export default FormOptionRow;
