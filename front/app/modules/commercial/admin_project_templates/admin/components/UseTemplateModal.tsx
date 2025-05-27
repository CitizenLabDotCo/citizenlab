import React, { memo, useCallback, useState, useEffect } from 'react';

import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Input,
  Icon,
  Select,
  Box,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { get, isEmpty, transform } from 'lodash-es';
import moment from 'moment';
import { darken } from 'polished';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import { SupportedLocale, Multiloc, IOption } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import meKeys from 'api/me/keys';
import useAuthUser from 'api/me/useAuthUser';
import useProjectFolders from 'api/project_folders/useProjectFolders';
import projectsKeys from 'api/projects/keys';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';
import useLocalize from 'hooks/useLocalize';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import Link from 'utils/cl-router/Link';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import eventEmitter from 'utils/eventEmitter';
import { convertToGraphqlLocale, isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';
import {
  userModeratesFolder,
  isProjectFolderModerator,
} from 'utils/permissions/rules/projectFolderPermissions';

import tracks from '../../tracks';
import { client } from '../../utils/apolloUtils';

import messages from './messages';

const Content = styled.div`
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 35px;
  padding-bottom: 50px;
`;

const Success = styled.div`
  height: 208px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SuccessIcon = styled(Icon)`
  height: 40px;
  fill: ${colors.success};
  margin-bottom: 20px;
`;

const SuccessText = styled.div`
  color: ${colors.success};
  font-size: ${fontSizes.m}px;
  font-weight: 400;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  > span {
    margin-bottom: 8px;
  }

  a {
    color: ${colors.success};
    text-decoration: underline;

    &:hover {
      color: ${darken(0.15, colors.success)};
      text-decoration: underline;
    }
  }
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const CreateProjectButton = styled(ButtonWithLink)`
  margin-right: 10px;
`;

const CloseButton = styled(ButtonWithLink)``;

export interface Props {
  projectTemplateId: string;
  opened: boolean;
  emitSuccessEvent?: boolean;
  showGoBackLink?: boolean;
  close: () => void;
}

interface IVariables {
  projectTemplateId: string | undefined;
  titleMultiloc: Multiloc;
  timelineStartAt: string;
  folderId: string | null;
}

const noFolderOption = 'NO_FOLDER_OPTION';

const UseTemplateModal = memo<Props & WithRouterProps & WrappedComponentProps>(
  ({
    params,
    intl,
    projectTemplateId,
    opened,
    emitSuccessEvent,
    showGoBackLink,
    close,
  }) => {
    const templateId: string | undefined =
      projectTemplateId || get(params, 'projectTemplateId');

    const tenantLocales = useAppConfigurationLocales();
    const graphqlTenantLocales = useGraphqlTenantLocales();
    const { data: projectFolders } = useProjectFolders({});
    const { data: authUser } = useAuthUser();
    const localize = useLocalize();
    const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [folderId, setFolderId] = useState<string | null>(null);
    const [folderOptions, setFolderOptions] = useState<IOption[] | null>(null);
    const [selectedLocale, setSelectedLocale] =
      useState<SupportedLocale | null>(null);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [startDateError, setStartDateError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [responseError, setResponseError] = useState<any>(null);

    const TEMPLATE_TITLE_QUERY = gql`
    {
      projectTemplate(id: "${projectTemplateId}"){
        titleMultiloc {
          ${graphqlTenantLocales}
        }
      }
    }
  `;

    const APPLY_PROJECT_TEMPLATE = gql`
      mutation ApplyProjectTemplate(
        $projectTemplateId: ID!
        $titleMultiloc: MultilocAttributes!
        $timelineStartAt: String
        $folderId: String
      ) {
        applyProjectTemplate(
          projectTemplateId: $projectTemplateId
          titleMultiloc: $titleMultiloc
          timelineStartAt: $timelineStartAt
          folderId: $folderId
        ) {
          errors
        }
      }
    `;

    const { data } = useQuery(TEMPLATE_TITLE_QUERY, { client });

    const [applyProjectTemplate] = useMutation<any, IVariables>(
      APPLY_PROJECT_TEMPLATE,
      { client }
    );

    const onCreateProject = useCallback(async () => {
      const invalidTitle =
        isEmpty(titleMultiloc) || // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (titleMultiloc &&
          Object.getOwnPropertyNames(titleMultiloc).every((key) =>
            isEmpty(titleMultiloc[`${key}`])
          ));
      const noDate = isEmpty(startDate);
      const invalidDate = !moment(
        startDate || '',
        'YYYY-MM-DD',
        true
      ).isValid();

      trackEventByName(tracks.useTemplateModalCreateProjectButtonClicked, {
        projectTemplateId,
      });

      if (invalidTitle && !isNilOrError(tenantLocales)) {
        if (tenantLocales.length === 1) {
          setTitleError(intl.formatMessage(messages.projectTitleError));
        } else {
          setTitleError(intl.formatMessage(messages.projectTitleMultilocError));
        }
      }

      if (noDate) {
        setStartDateError(intl.formatMessage(messages.projectNoStartDateError));
      } else if (invalidDate) {
        setStartDateError(
          intl.formatMessage(messages.projectInvalidStartDateError)
        );
      }

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!invalidTitle && !invalidDate && titleMultiloc && startDate) {
        setResponseError(null);
        setTitleError(null);
        setStartDateError(null);
        setProcessing(true);

        try {
          await applyProjectTemplate({
            variables: {
              titleMultiloc: transform(
                titleMultiloc,
                (result: Multiloc, val, key: SupportedLocale) => {
                  result[convertToGraphqlLocale(key)] = val;
                }
              ),
              projectTemplateId: templateId,
              timelineStartAt: startDate,
              folderId: folderId !== noFolderOption ? folderId : null,
            },
          });
          queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
          queryClient.invalidateQueries({
            queryKey: adminPublicationsKeys.lists(),
          });
          queryClient.invalidateQueries({ queryKey: meKeys.all() });

          if (emitSuccessEvent) {
            eventEmitter.emit('NewProjectCreated');
          }

          setProcessing(false);
          setSuccess(true);
        } catch (error) {
          setProcessing(false);
          setResponseError(error);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantLocales, titleMultiloc, startDate, selectedLocale, folderId]);

    const onClose = useCallback(() => {
      close();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onTitleChange = useCallback((titleMultiloc: Multiloc | null) => {
      setResponseError(null);
      setTitleError(null);
      setTitleMultiloc(titleMultiloc);
    }, []);

    const onSelectedLocaleChange = useCallback(
      (newSelectedLocale: SupportedLocale) => {
        setSelectedLocale(newSelectedLocale);
      },
      []
    );

    const onStartDateChange = useCallback((startDate: string) => {
      setResponseError(null);
      setStartDateError(null);
      setStartDate(startDate);
    }, []);

    const handleSelectFolderChange = ({ value: folderId }) => {
      setFolderId(folderId);
    };

    useEffect(() => {
      setTitleMultiloc(null);
      setStartDate(null);
      setSelectedLocale(null);
      setTitleError(null);
      setStartDateError(null);
      setProcessing(false);
      setSuccess(false);
      setResponseError(null);

      const folders: IOption[] =
        projectFolders &&
        !isNilOrError(projectFolders.data) &&
        !isNilOrError(authUser)
          ? [
              ...(isAdmin(authUser)
                ? [
                    {
                      value: noFolderOption,
                      label: intl.formatMessage(messages.noFolder),
                    },
                  ]
                : []),
              ...projectFolders.data
                .filter((folder) => userModeratesFolder(authUser, folder.id))
                .map((folder) => {
                  return {
                    value: folder.id,
                    label: localize(folder.attributes.title_multiloc),
                  };
                }),
            ]
          : [];

      if (folders.length) {
        setFolderId(folders[0].value);
      }

      setFolderOptions(folders);
    }, [opened, projectFolders, authUser, localize, intl]);

    if (isNilOrError(authUser)) {
      return null;
    }

    const templateTitle = (
      <T value={get(data, 'projectTemplate.titleMultiloc')} />
    );

    const isSelectDisabled = !!(
      isProjectFolderModerator(authUser) &&
      folderOptions &&
      folderOptions.length === 1
    );

    return (
      <Modal
        width={500}
        opened={opened}
        close={onClose}
        closeOnClickOutside={false}
        header={
          <FormattedMessage
            {...messages.createProjectBasedOn}
            values={{ templateTitle }}
          />
        }
        footer={
          <Footer>
            {!success ? (
              <>
                <CreateProjectButton
                  buttonStyle="secondary-outlined"
                  onClick={onCreateProject}
                  processing={processing}
                >
                  <FormattedMessage {...messages.createProject} />
                </CreateProjectButton>
                {responseError !== null && (
                  <Error
                    text={<FormattedMessage {...messages.responseError} />}
                    marginTop="0px"
                    showBackground={false}
                    showIcon={true}
                  />
                )}
              </>
            ) : (
              <CloseButton buttonStyle="secondary-outlined" onClick={onClose}>
                <FormattedMessage {...messages.close} />
              </CloseButton>
            )}
          </Footer>
        }
      >
        <Content>
          {!success ? (
            <>
              <InputMultilocWithLocaleSwitcher
                id="project-title"
                label={intl.formatMessage(messages.projectTitle)}
                placeholder={intl.formatMessage(messages.typeProjectName)}
                type="text"
                valueMultiloc={titleMultiloc}
                onChange={onTitleChange}
                onSelectedLocaleChange={onSelectedLocaleChange}
                error={titleError}
                autoFocus={true}
              />
              <Box my="36px">
                <Input
                  id="project-start-date"
                  label={intl.formatMessage(messages.projectStartDate)}
                  type="date"
                  onChange={onStartDateChange}
                  value={startDate}
                  error={startDateError}
                />
              </Box>
              <Select
                value={folderId}
                label={intl.formatMessage(messages.projectFolder)}
                options={folderOptions}
                disabled={isSelectDisabled}
                onChange={handleSelectFolderChange}
              />
            </>
          ) : (
            <Success>
              <SuccessIcon name="check-circle" />
              <SuccessText>
                <FormattedMessage {...messages.successMessage} />
                {showGoBackLink && (
                  <FormattedMessage
                    {...messages.goBackTo}
                    values={{
                      goBackLink: (
                        <Link to="/admin/projects/">
                          <FormattedMessage
                            {...messages.projectsOverviewPage}
                          />
                        </Link>
                      ),
                    }}
                  />
                )}
              </SuccessText>
            </Success>
          )}
        </Content>
      </Modal>
    );
  }
);

export default injectIntl(withRouter(UseTemplateModal));
