import React from 'react';

import {
  Radio,
  IconTooltip,
  Toggle,
  Label,
  Box,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption, SupportedLocale } from 'typings';

import { IGroups } from 'api/groups/types';
import useGroups from 'api/groups/useGroups';
import { IProjectData } from 'api/projects/types';
import useProjects from 'api/projects/useProjects';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';

import { appLocalePairs } from 'containers/App/constants';

import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import { SectionField } from 'components/admin/Section';
import Collapse from 'components/UI/Collapse';
import MultipleSelect from 'components/UI/MultipleSelect';
import QuillEditor from 'components/UI/QuillEditor';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import { TInviteTabName } from '.';

const StyledWarning = styled(Warning)`
  margin-top: 5px;
`;

const StyledToggle = styled(Toggle)`
  margin-bottom: 10px;
`;

interface Props {
  invitationOptionsOpened: boolean;
  onToggleOptions: () => void;
  selectedView: TInviteTabName;
  inviteesWillHaveAdminRights: boolean;
  inviteesWillHaveModeratorRights: boolean;
  handleAdminRightsOnToggle: () => void;
  handleModeratorRightsOnToggle: () => void;
  onLocaleOnChange: (selectedLocale: SupportedLocale) => void;
  selectedLocale: SupportedLocale | null;
  handleSelectedProjectsOnChange: (selectedProjects: IOption[]) => void;
  handleSelectedGroupsOnChange: (selectedGroups: IOption[]) => void;
  handleInviteTextOnChange: (selectedInviteText: string) => void;
  selectedProjects: IOption[] | null;
  selectedGroups: IOption[] | null;
  selectedInviteText: string | null;
}

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
}: Props) => {
  const { formatMessage } = useIntl();
  const appConfigurationLocales = useAppConfigurationLocales();
  const { data: projects } = useProjects({
    publicationStatuses: ['draft', 'published', 'archived'],
  });
  const { data: groups } = useGroups({ membershipType: 'manual' });
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

  const getGroupOptions = (groups?: IGroups) => {
    if (groups?.data && groups.data.length > 0) {
      return groups.data.map((group) => ({
        value: group.id,
        label: localize(group.attributes.title_multiloc),
      }));
    }

    return null;
  };

  const projectOptions = !isNilOrError(projects)
    ? getProjectOptions(projects.data)
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
                  href={formatMessage(messages.invitesSupportPageURL2)}
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
          {inviteesWillHaveAdminRights && (
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
                            messages.moderatorLabelTooltipLink2
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
              <Box marginTop="20px">
                <SeatInfo seatType="moderator" />
              </Box>
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
            noVideos
            withCTAButton
          />
        </SectionField>
      </Box>
    </Collapse>
  );
};

export default InvitationOptions;
