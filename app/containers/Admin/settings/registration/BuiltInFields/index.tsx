import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { merge, cloneDeep, get, set,  } from 'lodash';

import Toggle from 'components/UI/Toggle';
import { SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// style
import styled from 'styled-components';

import getSubmitState from 'utils/getSubmitState';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

import { currentTenantStream, updateTenant, IUpdatedTenantProperties, ITenant, ITenantSettings } from 'services/tenant';

// typings
import { API,  } from 'typings';

const ToggleWrapper = styled.div`
  width: 100%;
  max-width: 250px;
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  padding-bottom: 15px;

  &.first {
    border-top: none;
  }

  &.last {
    border-bottom: none;
  }
`;

const ToggleLabel = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
`;


interface IAttributesDiff {
  settings?: Partial<ITenantSettings>;
}

type Props = {
};

type State = {
  attributesDiff: IAttributesDiff;
  currentTenant: ITenant | null;
  loading: boolean;
  errors: { [fieldName: string]: API.Error[] };
  saved: boolean;
};

class BuiltInFields extends React.PureComponent<Props, State> {
  titleMaxCharCount: number;
  subtitleMaxCharCount: number;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      attributesDiff: {},
      currentTenant: null,
      loading: false,
      errors: {},
      saved: false,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;
    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({ currentTenant });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subsription => subsription.unsubscribe());
  }

  handleOnToggle = (fieldPath: string, checked: boolean) => () => {
    let newDiff = cloneDeep(this.state.attributesDiff);
    newDiff = set(newDiff, fieldPath, !checked);
    this.setState({ attributesDiff: newDiff });
  }

  save = async (event) => {
    event.preventDefault();

    const { currentTenant, attributesDiff } = this.state;

    if (currentTenant) {
      this.setState({ loading: true, saved: false });

      try {
        await updateTenant(currentTenant.data.id, attributesDiff as IUpdatedTenantProperties);
        this.setState({ loading: false, saved: true, attributesDiff: {} });
      } catch (error) {
        this.setState({ loading: false, errors: error.json.errors });
      }
    }
  }

  render() {
    const { currentTenant, errors, saved } = this.state;

    if (currentTenant) {
      const { attributesDiff, } = this.state;
      const tenantAttrs = merge(cloneDeep(currentTenant.data.attributes), attributesDiff);
      return (
        <form onSubmit={this.save}>


          <SectionField>
            {['gender', 'domicile', 'birthyear'].map((fieldName, index) => {
              const fieldPath = `settings.demographic_fields.${fieldName}`;
              const checked = get(tenantAttrs, fieldPath) as boolean;
              const first = (index === 0 && 'first');
              const last = (index === 2 && 'last');

              return (
                <ToggleWrapper key={fieldName} className={`${first} ${last}`} >
                  <ToggleLabel>
                    <FormattedMessage {...messages[fieldName]} />
                  </ToggleLabel>
                  <Toggle
                    checked={checked}
                    disabled={false}
                    onToggle={this.handleOnToggle(fieldPath, checked)}
                  />
                </ToggleWrapper>
              );
            })}
          </SectionField>

          <SubmitWrapper
            loading={this.state.loading}
            status={getSubmitState({ errors, saved, diff: attributesDiff })}
            messages={{
              buttonSave: messages.save,
              buttonError: messages.saveError,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          />

        </form>
      );
    }

    return null;
  }
}

export default BuiltInFields;
