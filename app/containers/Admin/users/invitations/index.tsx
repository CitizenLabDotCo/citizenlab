import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString, isEmpty } from 'lodash';

// components
import TextArea from 'components/UI/TextArea';
import Label from 'components/UI/Label';
import Warning from 'components/UI/Warning';
import Radio from 'components/UI/Radio';
import Icon from 'components/UI/Icon';
import Toggle from 'components/UI/Toggle';
// import Button from 'components/UI/Button';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { listGroups, IGroups } from 'services/groups';

// i18n
import { FormattedHTMLMessage } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { appLocalePairs } from 'i18n.js';
import { getLocalized } from 'utils/i18n';

// utils
import { getBase64FromFile } from 'utils/imageTools';

// styling
import styled from 'styled-components';

// typings
import { Locale, IOption } from 'typings';

const timeout = 400;

const FileInputWrapper = styled.div`
  margin-top: 15px;
  margin-bottom: 20px;
`;

const ArrowIcon = styled(Icon)`
  fill: ${(props) => props.theme.colors.label};
  height: 13px;
  margin-right: 9px;
  transition: transform 350ms cubic-bezier(0.165, 0.84, 0.44, 1),
              fill 80ms ease-out;

  &.opened {
    transform: rotate(90deg);
  }
`;

const StyledLabel = styled(Label)`
  padding-bottom: 0px;
  transition: all 80ms ease-out;
  cursor: pointer;
`;

const Options: any = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  transition: all 80ms ease-out;
  cursor: pointer;

  &:hover {
    ${StyledLabel} {
      color: #000;
    }

    ${ArrowIcon} {
      fill: #000;
    }
  }
`;

const InvitationOptionsContainer = styled.div`
  width: 497px;
  position: relative;
  border-radius: 5px;
  border: solid 1px #ddd;
  background: #fff;
  z-index: 1;
  transition: opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  &:not(.opened) {
    height: 0;
    opacity: 0;
  }

  &.opened {
    height: auto;
    opacity: 1;
  }
`;

const InvitationOptionsInner = styled.div`
  padding: 20px;
  padding-bottom: 0px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-top: 30px;
`;

const Processing = styled.div`
  color: ${(props) => props.theme.colors.label};
  margin-left: 15px;
`;

const ViewButtons = styled.div`
  display: flex;
  margin-bottom: 40px;
`;

const ViewButton = styled.div`
  min-width: 85px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fff;
  border: solid 1px #e4e4e4;

  &:hover,
  &.active {
    background: #f0f0f0;
  }

  > span {
    color: ${(props) => props.theme.colors.label};
    color: #333;
    font-size: 17px;
    font-weight: 400;
    line-height: 24px;
    padding-left: 15px;
    padding-right: 15px;
  }
`;

const LeftButton = ViewButton.extend`
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

const RightButton = ViewButton.extend`
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
`;

type Props = {};

type State = {
  currentTenantLocales: Locale[] | null;
  groupOptions: IOption[] | null;
  selectedEmails: string | null;
  selectedFileBase64: string | null;
  hasAdminRights: boolean;
  selectedLocale: Locale | null;
  selectedGroups: IOption[] | null;
  invitationOptionsOpened: boolean;
  selectedView: 'import' | 'text';
  loaded: boolean;
  dirty: boolean;
  processing: boolean;
  processed: boolean;
};

export default class Invitations extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      currentTenantLocales: null,
      groupOptions: null,
      selectedEmails: null,
      selectedFileBase64: null,
      hasAdminRights: false,
      selectedLocale: null,
      selectedGroups: null,
      invitationOptionsOpened: false,
      selectedView: 'import',
      loaded: false,
      dirty: false,
      processing: false,
      processed: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);
    const groups$ = listGroups().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenantLocales$,
        groups$
      ).subscribe(([locale, currentTenantLocales, groups]) => {
        this.setState({
          currentTenantLocales,
          groupOptions: this.getGroupOptions(groups, locale, currentTenantLocales),
          selectedLocale: currentTenantLocales[0],
          loaded: true
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getGroupOptions = (groups: IGroups | null, locale: Locale, currentTenantLocales: Locale[]) => {
    if (groups && groups.data && groups.data.length > 0) {
      return groups.data.map((group) => ({
        value: group.id,
        label: getLocalized(group.attributes.title_multiloc, locale, currentTenantLocales)
      }));
    }

    return null;
  }

  handleEmailListOnChange = (selectedEmails: string) => {
    this.setState({ selectedEmails });
  }

  handleFileInputOnChange = async (event) => {
    const selectedFile: File | null = (event.target.files && event.target.files.length === 1 ? event.target.files['0'] : null);
    const selectedFileBase64 = (selectedFile ? await getBase64FromFile(selectedFile) : null);
    this.setState({ selectedFileBase64 });
  }

  handleAdminRightsOnToggle = () => {
    this.setState(state => ({ hasAdminRights: !state.hasAdminRights }));
  }

  handleLocaleOnChange = (selectedLocale: Locale) => {
    this.setState({ selectedLocale });
  }

  handleSelectedGroupsOnChange = (selectedGroups: IOption[]) => {
    this.setState({ selectedGroups: (selectedGroups.length > 0 ? selectedGroups : null) });
  }

  handleOnSubmit = () => {
    // const { selectedLocale } = this.state;

    // if (selectedLocale) {

    // }

    this.setState({ processing: true });
  }

  getSubmitState = (errors: object | null, processed: boolean, dirty: boolean) => {
    if (errors && !isEmpty(errors)) {
      return 'error';
    } else if (processed && !dirty) {
      return 'success';
    } else if (!dirty) {
      return 'disabled';
    }

    return 'enabled';
  }

  toggleOptions = () => {
    this.setState(state => ({ invitationOptionsOpened: !state.invitationOptionsOpened }));
  }

  selectView = (selectedView: 'import' | 'text') => () => {
    this.setState((state) => ({
      selectedView,
      selectedEmails: null,
      selectedFileBase64: null,
      hasAdminRights: false,
      selectedLocale: (state.currentTenantLocales ? state.currentTenantLocales[0] : null),
      selectedGroups: null,
      invitationOptionsOpened: false
    }));
  }

  render () {
    const { currentTenantLocales, groupOptions, selectedEmails, selectedFileBase64, hasAdminRights, selectedLocale, selectedGroups, invitationOptionsOpened, selectedView, loaded, processing, processed } = this.state;
    const dirty = ((isString(selectedEmails) && !isEmpty(selectedEmails)) || (isString(selectedFileBase64) && !isEmpty(selectedFileBase64)));

    const invitationOptions = (
      <>
        <Options onClick={this.toggleOptions}>
          <ArrowIcon name="chevron-right" className={`${invitationOptionsOpened && 'opened'}`} />
          <StyledLabel>
            <FormattedMessage {...messages.invitationOptions} />
          </StyledLabel>
        </Options>

        <InvitationOptionsContainer className={`${invitationOptionsOpened && 'opened'}`}>
          <InvitationOptionsInner>
            {selectedView === 'import' &&
              <SectionField>
                <Warning text={<FormattedHTMLMessage {...messages.importOptionsInfo} />} />
              </SectionField>
            }

            <SectionField>
              <Label>
                <FormattedMessage {...messages.adminLabel} />
              </Label>
              <Toggle value={hasAdminRights} onChange={this.handleAdminRightsOnToggle} />
            </SectionField>

            {currentTenantLocales && currentTenantLocales.length > 1 &&
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.localeLabel} />
                </Label>

                {currentTenantLocales.map((currentTenantLocale) => (
                  <Radio
                    key={currentTenantLocale}
                    onChange={this.handleLocaleOnChange}
                    currentValue={selectedLocale}
                    value={currentTenantLocale}
                    label={appLocalePairs[currentTenantLocale]}
                  />
                ))}
              </SectionField>
            }

            <SectionField>
              <Label>
                <FormattedMessage {...messages.groupsLabel} />
              </Label>
              <MultipleSelect
                value={selectedGroups}
                options={groupOptions}
                onChange={this.handleSelectedGroupsOnChange}
                placeholder={<FormattedMessage {...messages.groupsPlaceholder} />}
              />
            </SectionField>
          </InvitationOptionsInner>
        </InvitationOptionsContainer>
      </>
    );
   
    if (currentTenantLocales && loaded) {
      return (
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.invitePeople} />
          </SectionTitle>

          <ViewButtons>
            <LeftButton onClick={this.selectView('import')} className={`${selectedView === 'import' && 'active'}`}>
              <FormattedMessage {...messages.importTab} />
            </LeftButton>
            <RightButton onClick={this.selectView('text')} className={`${selectedView === 'text' && 'active'}`}>
              <FormattedMessage {...messages.textTab} />
            </RightButton>
          </ViewButtons>

          {selectedView === 'import' &&
            <>
              <SectionField>
                <Label>
                  <FormattedHTMLMessage {...messages.importLabel} />
                </Label>

                <Warning text={<FormattedHTMLMessage {...messages.importInfo} />} />

                <FileInputWrapper>
                  <input
                    type="file"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={this.handleFileInputOnChange}
                  />
                </FileInputWrapper>
              </SectionField>

              {invitationOptions}
            </>
          }

          {selectedView === 'text' &&
            <>
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.emailListLabel} />
                </Label>
                <TextArea
                  value={(selectedEmails || '')}
                  onChange={this.handleEmailListOnChange}
                />
              </SectionField>

              {invitationOptions}
            </>
          }

          <SectionField>
            <ButtonWrapper>
              {/*
              <Button processing={processing} onClick={this.handleOnSubmit} circularCorners={true}>
                <FormattedMessage {...messages.sendOutInvitations} />
              </Button>
              */}

              <SubmitWrapper
                loading={processing}
                status={this.getSubmitState(null, processed, dirty)}
                messages={{
                  buttonSave: messages.save,
                  buttonError: messages.saveError,
                  buttonSuccess: messages.saveSuccess,
                  messageError: messages.saveErrorMessage,
                  messageSuccess: messages.saveSuccessMessage,
                }}
              />

              {processing &&
                <Processing>
                  <FormattedMessage {...messages.processing} />
                </Processing>
              }
            </ButtonWrapper>
          </SectionField>
        </Section>
      );
    }

    return null;
  }
}
