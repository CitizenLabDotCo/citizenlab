// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Services
import { addGroup, GroupDiff } from 'services/groups';
import { localeStream } from 'services/locale';

// Utils
import getSubmitState from 'utils/getSubmitState';

// Components
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { SectionField } from 'components/admin/Section';

// Style
import styled from 'styled-components';

const FormWrapper = styled.form`
  margin-top: 20px;
`;

// Typing
import { API, Locale } from 'typings';

interface Props {
  onSaveSuccess?: Function;
}

interface State {
  locale: Locale;
  diff: GroupDiff;
  errors: {
    [fieldName: string]: API.Error[]
  };
  saved: boolean;
  saving: boolean;
}

class GroupAdditionForm extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);

    this.state = {
      diff: {},
      errors: {},
      saved: false,
      saving: false,
      locale: 'en',
    };

    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;

    this.subscriptions = [
      locale$.subscribe(locale => this.setState({ locale }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  titleChangeHandler = (value: string) => {
    this.setState((state) => ({
      diff: {
        ...(state.diff || {}),
        title_multiloc: {
          [state.locale]: value
        }
      }
    }));
  }

  handleFormSubmit = (event: React.FormEvent<any>) => {
    event.preventDefault();

    this.setState({ saving: true });

    addGroup(this.state.diff).then(() => {
      this.setState({ saving: false, saved: true });

      if (this.props.onSaveSuccess) {
        this.props.onSaveSuccess();
      }
    }).catch(() => {
      this.setState({ saving: false, saved: false });
    });
  }

  render() {
    const groupAttrs = { ...this.state.diff };
    const { locale, saving, errors, saved, diff } = this.state;
    const submitState = getSubmitState({ errors, saved, diff });

    return (
      <>
        <h1>
          <FormattedMessage {...messages.creationFormTitle} />
        </h1>

        <FormWrapper onSubmit={this.handleFormSubmit}>
          <SectionField>
            <Label htmlFor="">
              <FormattedMessage {...messages.groupTitleLabel} />
            </Label>
            <Input
              autoFocus={true}
              type="text"
              onChange={this.titleChangeHandler}
              value={groupAttrs.title_multiloc ? groupAttrs.title_multiloc[locale] : ''}
            />
          </SectionField>
        </FormWrapper>

        <SubmitWrapper
          status={submitState}
          loading={saving}
          messages={messages}
          onClick={this.handleFormSubmit}
        />
      </>
    );
  }
}

export default GroupAdditionForm;
