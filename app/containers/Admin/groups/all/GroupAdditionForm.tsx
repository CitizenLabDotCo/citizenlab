// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';
import * as _ from 'lodash';

// i18n
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from './messages';

// Services
import { addGroup, GroupDiff } from 'services/groups';
import { localeStream } from 'services/locale';

// Components
import Button from 'components/UI/Button';
import Input from 'components/UI/Input';
import FieldWrapper from 'components/admin/FieldWrapper';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// Style
import styled from 'styled-components';

const FormWrapper = styled.form`
  max-width: 380px;
`;

const StyledSubmitWrapper = styled.div`
  border-top: 1px solid #EAEAEA;
  box-shadow: 0 0 10px rgba(0, 0, 0, .15);
  margin: 0 -25px -25px;
  padding: 1rem 3rem;
`;

// Typing
import { API } from 'typings';
interface Props {
  onSaveSuccess?: Function;
}

interface State {
  locale: string;
  diff: GroupDiff;
  errors: {
    [fieldName: string]: API.Error[]
  };
  saved: boolean;
  saving: boolean;
}

class GroupAdditionForm extends React.Component<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor() {
    super();

    this.state = {
      diff: {},
      errors: {},
      saved: false,
      saving: false,
      locale: '',
    };

    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions.push(
      localeStream().observable.subscribe((locale) => {
        this.setState({ locale });
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  getSubmitState = (): 'disabled' | 'enabled' | 'error' | 'success' => {
    if (!_.isEmpty(this.state.errors)) {
      return 'error';
    }
    if (this.state.saved && _.isEmpty(this.state.diff)) {
      return 'success';
    }
    return _.isEmpty(this.state.diff) ? 'disabled' : 'enabled';
  }

  titleChangeHandler = (value) => {
    let { diff } = this.state;
    diff = _.set(diff, `title_multiloc.${this.state.locale}`, value);

    this.setState({ diff });
  }

  handleFormSubmit = (e) => {
    e.preventDefault();
    this.setState({ saving: true });

    addGroup(this.state.diff)
    .then(() => {
      this.setState({ saving: false, saved: true });
      if (this.props.onSaveSuccess) {
        this.props.onSaveSuccess();
      }
    })
    .catch((e) => {
      this.setState({ saving: false, saved: false });
      console.log(e);
    });
  }

  render() {
    const groupAttrs = { ...this.state.diff };
    const { locale, saving } = this.state;
    const submitState = this.getSubmitState();

    return (
      <div>
        <h1><FormattedMessage {...messages.creationFormTitle} /></h1>
        <FormWrapper onSubmit={this.handleFormSubmit}>
          <FieldWrapper>
            <label htmlFor="">
              <FormattedMessage {...messages.groupTitleLabel} />
            </label>
            <Input
              type="text"
              onChange={this.titleChangeHandler}
              value={groupAttrs.title_multiloc ? groupAttrs.title_multiloc[locale] : ''}
            />
          </FieldWrapper>

        </FormWrapper>

        <StyledSubmitWrapper>
          <SubmitWrapper
            status={submitState}
            loading={saving}
            messages={messages}
            onClick={this.handleFormSubmit}
          />
        </StyledSubmitWrapper>
      </div>
    );
  }
}

export default GroupAdditionForm;
