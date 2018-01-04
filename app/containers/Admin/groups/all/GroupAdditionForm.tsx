// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';
import * as _ from 'lodash';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// Services
import { addGroup, GroupDiff } from 'services/groups';
import { localeStream } from 'services/locale';

// Utils
import getSubmitState from 'utils/getSubmitState';

// Components
import Button from 'components/UI/Button';
import Input from 'components/UI/Input';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

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

class GroupAdditionForm extends React.Component<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);

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
    });
  }

  render() {
    const groupAttrs = { ...this.state.diff };
    const { locale, saving, errors, saved, diff } = this.state;
    const submitState = getSubmitState({ errors, saved, diff });

    return (
      <div>
        <h1><FormattedMessage {...messages.creationFormTitle} /></h1>
        <FormWrapper onSubmit={this.handleFormSubmit}>
          <SectionField>
            <label htmlFor="">
              <FormattedMessage {...messages.groupTitleLabel} />
            </label>
            <Input
              autoFocus={true}
              type="text"
              onChange={this.titleChangeHandler}
              value={groupAttrs.title_multiloc ? groupAttrs.title_multiloc[locale] : ''}
            />
          </SectionField>

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
