import Collapse from 'components/UI/Collapse';
import React from 'react';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import {
  Radio,
  IconTooltip,
  Toggle,
  Label,
  Box,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import MultipleSelect from 'components/UI/MultipleSelect';
import { SectionField } from 'components/admin/Section';
import QuillEditor from 'components/UI/QuillEditor';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import messages from '../messages';
import { isNilOrError } from 'utils/helperUtils';
import Warning from 'components/UI/Warning';
import styled from 'styled-components';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { appLocalePairs } from 'containers/App/constants';
import useLocalize from 'hooks/useLocalize';
import { IOption, Locale } from 'typings';
import useProjects from 'hooks/useProjects';
import { IProjectData } from 'services/projects';
import { adopt } from 'react-adopt';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import { TInviteTabName } from '.';

const StyledWarning = styled(Warning)`
  margin-top: 5px;
`;

const StyledToggle = styled(Toggle)`
  margin-bottom: 10px;
`;

interface DataProps {
  groups: GetGroupsChildProps;
}

interface InputProps {
  invitationOptionsOpened: boolean;
  onToggleOptions: () => void;
  selectedView: TInviteTabName;
  inviteesWillHaveAdminRights: boolean;
  inviteesWillHaveModeratorRights: boolean;
  handleAdminRightsOnToggle: () => void;
  handleModeratorRightsOnToggle: () => void;
  onLocaleOnChange: (selectedLocale: Locale) => void;
  selectedLocale: Locale | null;
  handleSelectedProjectsOnChange: (selectedProjects: IOption[]) => void;
  handleSelectedGroupsOnChange: (selectedGroups: IOption[]) => void;
  handleInviteTextOnChange: (selectedInviteText: string) => void;
  selectedProjects: IOption[] | null;
  selectedGroups: IOption[] | null;
  selectedInviteText: string | null;
}

interface Props extends InputProps, DataProps {}

const InvitationOptions = ({
  invitationOptionsOpened,
  onToggleOptions,
  selectedView,
  inviteesWillHaveAdminRights,
  inviteesWillHaveModeratorRights,
  handleAdminRightsOnToggle,
  handleModeratorRightsOnToggle,
  onLocaleOnChange,
  selectedLocale,
  handleSelectedProjectsOnChange,
  handleSelectedGroupsOnChange,
  handleInviteTextOnChange,
  selectedProjects,
  selectedGroups,
  selectedInviteText,
  groups,
}: Props) => {
  const { formatMessage } = useIntl();
  const appConfigurationLocales = useAppConfigurationLocales();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  const projects = useProjects({
    publicationStatuses: ['draft', 'published', 'archived'],
  });
  const localize = useLocalize();

  const getProjectOptions = (projects: IProjectData[]) => {
    if (projects.length > 0) {
      return projects.map((project) => ({
        value: project.id,
        label: localize(project.attributes.title_multiloc),
      }));
    }

    return null;
  };

  const getGroupOptions = (groups: GetGroupsChildProps) => {
    if (!isNilOrError(groups.groupsList) && groups.groupsList.length > 0) {
      return groups.groupsList.map((group) => ({
        value: group.id,
        label: localize(group.attributes.title_multiloc),
      }));
    }

    return null;
  };

  const projectOptions = !isNilOrError(projects)
    ? getProjectOptions(projects)
    : null;
  const groupOptions = getGroupOptions(groups);

  return (
    <Collapse
      opened={invitationOptionsOpened}
      onToggle={onToggleOptions}
      label={<FormattedMessage {...messages.invitationOptions} />}
      labelTooltipText={
        selectedView === 'template' ? (
          <FormattedMessage
            {...messages.importOptionsInfo}
            values={{
              supportPageLink: (
                <a
                  href={formatMessage(messages.invitesSupportPageURL)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FormattedMessage {...messages.supportPage} />
                </a>
              ),
            }}
          />
        ) : null
      }
    >
      <Box
        width="497px"
        padding="20px"
        borderRadius={stylingConsts.borderRadius}
        border="solid 1px #ddd"
        background={colors.white}
      >
        <SectionField>
          <Box display="flex" justifyContent="space-between">
            <Label>
              <FormattedMessage {...messages.adminLabel} />
              <IconTooltip
                content={<FormattedMessage {...messages.adminLabelTooltip} />}
              />
            </Label>
            <Toggle
              checked={inviteesWillHaveAdminRights}
              onChange={handleAdminRightsOnToggle}
            />
          </Box>
          {!hasSeatBasedBillingEnabled && inviteesWillHaveAdminRights && (
            <Box marginTop="20px">
              <SeatInfo seatType="admin" />
            </Box>
          )}
        </SectionField>

        <SectionField>
          <Box display="flex" justifyContent="space-between">
            <Label>
              <FormattedMessage {...messages.moderatorLabel} />
              <IconTooltip
                content={
                  <FormattedMessage
                    {...messages.moderatorLabelTooltip}
                    values={{
                      moderatorLabelTooltipLink: (
                        <a
                          href={formatMessage(
                            messages.moderatorLabelTooltipLink
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FormattedMessage
                            {...messages.moderatorLabelTooltipLinkText}
                          />
                        </a>
                      ),
                    }}
                  />
                }
              />
            </Label>
            <StyledToggle
              checked={inviteesWillHaveModeratorRights}
              onChange={handleModeratorRightsOnToggle}
            />
          </Box>

          {inviteesWillHaveModeratorRights && (
            <>
              <MultipleSelect
                value={selectedProjects}
                options={projectOptions}
                onChange={handleSelectedProjectsOnChange}
                placeholder={
                  <FormattedMessage {...messages.projectSelectorPlaceholder} />
                }
              />
              {isNilOrError(selectedProjects) && (
                <StyledWarning>
                  <FormattedMessage {...messages.required} />
                </StyledWarning>
              )}
              {!hasSeatBasedBillingEnabled && (
                <Box marginTop="20px">
                  <SeatInfo seatType="moderator" />
                </Box>
              )}
            </>
          )}
        </SectionField>

        {!isNilOrError(appConfigurationLocales) &&
          appConfigurationLocales.length > 1 && (
            <SectionField>
              <Label>
                <FormattedMessage {...messages.localeLabel} />
              </Label>

              {appConfigurationLocales.map((currentTenantLocale) => (
                <Radio
                  key={currentTenantLocale}
                  onChange={onLocaleOnChange}
                  currentValue={selectedLocale}
                  value={currentTenantLocale}
                  label={appLocalePairs[currentTenantLocale]}
                  name="locales"
                  id={`locale-${currentTenantLocale}`}
                />
              ))}
            </SectionField>
          )}

        <SectionField>
          <Label>
            <FormattedMessage {...messages.addToGroupLabel} />
          </Label>
          <MultipleSelect
            value={selectedGroups}
            options={groupOptions}
            onChange={handleSelectedGroupsOnChange}
            placeholder={<FormattedMessage {...messages.groupsPlaceholder} />}
          />
        </SectionField>

        <SectionField>
          <Label>
            <FormattedMessage {...messages.inviteTextLabel} />
          </Label>
          <QuillEditor
            id="invite-text"
            value={selectedInviteText || ''}
            onChange={handleInviteTextOnChange}
            limitedTextFormatting
            noImages
            noVideos
            withCTAButton
          />
        </SectionField>
      </Box>
    </Collapse>
  );
};

const Data = adopt<DataProps>({
  groups: <GetGroups membershipType="manual" />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => (
      <InvitationOptions {...inputProps} {...dataProps} />
    )}
  </Data>
);
