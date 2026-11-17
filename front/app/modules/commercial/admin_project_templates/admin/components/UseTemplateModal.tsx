import React, { memo, useCallback, useState, useEffect } from 'react';

import { parseDate } from '@internationalized/date';
import { get, isEmpty, transform } from 'lodash-es';
import moment from 'moment';
import { darken } from 'polished';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import { SupportedLocale, Multiloc, IOption } from 'typings';

import {
  Input,
  Icon,
  Select,
  Box,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import Banner from 'design-system/Banner';
import DatePicker from 'design-system/DatePicker';
import DSIcon from 'design-system/Icon';
import DSModal from 'design-system/Modal';

import useAuthUser from 'api/me/useAuthUser';
import useProjectFolders from 'api/project_folders/useProjectFolders';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';

import newProjectFormMessages from 'containers/Admin/projects/_shared/components/NewProjectForm/messages';

import MultilocTitleField from 'components/admin/MultilocFields/MultilocTitleField';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';
import { convertToGraphqlLocale, isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';
import {
  userModeratesFolder,
  isProjectFolderModerator,
} from 'utils/permissions/rules/projectFolderPermissions';
import { useParams } from 'utils/router';
import validateTitle from 'utils/validateTitle';

import tracks from '../../tracks';
import useApplyProjectTemplate from '../api/useApplyProjectTemplate';
import useTemplateTitle from '../api/useTemplateTitle';

import FolderPicker from './FolderPicker';
import messages from './messages';
import styles from './UseTemplateModal.module.css';
import 'design-system/tokens.css';

type Variant = 'default' | 'panel';

const Content = styled.div`
  padding: 35px 30px 50px 30px;
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
  justify-content: flex-start;
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
  onCreated?: () => void;
  variant?: Variant;
}

const noFolderOption = 'NO_FOLDER_OPTION';

const UseTemplateModal = memo<Props & WrappedComponentProps>(
  ({
    intl,
    projectTemplateId,
    opened,
    emitSuccessEvent,
    showGoBackLink,
    close,
    onCreated,
    variant = 'default',
  }) => {
    const params = useParams({ strict: false });
    const templateId: string | undefined =
      projectTemplateId || get(params, 'projectTemplateId');

    const tenantLocales = useAppConfigurationLocales();
    const { data: projectFolders } = useProjectFolders({});
    const { data: authUser } = useAuthUser();
    const localize = useLocalize();

    const { data } = useTemplateTitle(templateId);
    const { mutateAsync: applyProjectTemplate } = useApplyProjectTemplate();

    const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [folderId, setFolderId] = useState<string | null>(null);
    const [folderOptions, setFolderOptions] = useState<IOption[] | null>(null);
    const [titleError, setTitleError] = useState<Multiloc | null>(null);
    const [startDateError, setStartDateError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [responseError, setResponseError] = useState<any>(null);

    const onCreateProject = useCallback(async () => {
      const invalidTitle =
        !titleMultiloc ||
        Object.values(titleMultiloc).every((title) => isEmpty(title));
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
        setTitleError(
          validateTitle(
            tenantLocales,
            titleMultiloc ?? undefined,
            intl.formatMessage(
              tenantLocales.length === 1
                ? messages.projectTitleError
                : messages.projectTitleMultilocError
            )
          )
        );
      }

      if (noDate) {
        setStartDateError(intl.formatMessage(messages.projectNoStartDateError));
      } else if (invalidDate) {
        setStartDateError(
          intl.formatMessage(messages.projectInvalidStartDateError)
        );
      }

      if (!invalidTitle && !invalidDate && startDate) {
        setResponseError(null);
        setTitleError(null);
        setStartDateError(null);
        setProcessing(true);

        try {
          await applyProjectTemplate({
            titleMultiloc: transform(
              titleMultiloc,
              (result: Multiloc, val, key: SupportedLocale) => {
                result[convertToGraphqlLocale(key)] = val;
              }
            ),
            projectTemplateId: templateId!,
            timelineStartAt: startDate,
            folderId: folderId !== noFolderOption ? folderId : null,
          });

          if (emitSuccessEvent) {
            eventEmitter.emit('NewProjectCreated');
          }

          setProcessing(false);
          setSuccess(true);
          onCreated?.();
        } catch (error) {
          setProcessing(false);
          setResponseError(error);
        }
      }
    }, [
      titleMultiloc,
      startDate,
      projectTemplateId,
      tenantLocales,
      intl,
      applyProjectTemplate,
      templateId,
      folderId,
      emitSuccessEvent,
      onCreated,
    ]);

    const onClose = useCallback(() => {
      close();
    }, [close]);

    const onTitleChange = useCallback((titleMultiloc: Multiloc | null) => {
      setResponseError(null);
      setTitleError(null);
      setTitleMultiloc(titleMultiloc);
    }, []);

    const onStartDateChange = useCallback((startDate: string | null) => {
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
      setTitleError(null);
      setStartDateError(null);
      setProcessing(false);
      setResponseError(null);

      // If the modal is not opened, (e.g. when closed) reset the success state.
      // This avoids resetting on every prop change.
      if (!opened) {
        setSuccess(false);
      }

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

    const modalTitle = (
      <FormattedMessage
        {...messages.createProjectBasedOn}
        values={{ templateTitle }}
      />
    );
    const successMessage = (
      <>
        <FormattedMessage {...messages.successMessage} />
        <FormattedMessage {...messages.findItInProjectsList} />
        {showGoBackLink && (
          <FormattedMessage
            {...messages.goBackTo}
            values={{
              goBackLink: (
                <Link to="/admin/projects/">
                  <FormattedMessage {...messages.projectsOverviewPage} />
                </Link>
              ),
            }}
          />
        )}
      </>
    );

    if (variant === 'panel') {
      return (
        <DSModal
          size={560}
          isOpen={opened}
          onOpenChange={(isOpen) => {
            if (!isOpen) onClose();
          }}
          title={modalTitle}
          primaryAction={
            success
              ? {
                  label: <FormattedMessage {...messages.close} />,
                  onPress: onClose,
                }
              : {
                  label: <FormattedMessage {...messages.createProject} />,
                  onPress: onCreateProject,
                  isPending: processing,
                }
          }
        >
          {!success ? (
            <>
              <MultilocTitleField
                id="project-title"
                valueMultiloc={titleMultiloc}
                onChange={onTitleChange}
                errorMultiloc={titleError}
                placeholder={intl.formatMessage(
                  newProjectFormMessages.titlePlaceholder
                )}
                aria-label={intl.formatMessage(messages.projectTitle)}
              />
              <div className={styles.startDate}>
                <DatePicker
                  id="project-start-date"
                  label={intl.formatMessage(messages.projectStartDate)}
                  value={startDate ? parseDate(startDate) : null}
                  onChange={(date) =>
                    onStartDateChange(date ? date.toString() : null)
                  }
                  isInvalid={!!startDateError}
                  errorMessage={startDateError}
                />
              </div>
              {folderOptions && (
                <FolderPicker
                  options={folderOptions}
                  value={folderId}
                  onChange={setFolderId}
                />
              )}
              {responseError !== null && (
                <Banner tone="error">
                  <FormattedMessage {...messages.responseError} />
                </Banner>
              )}
            </>
          ) : (
            <div className={styles.success}>
              <DSIcon
                name="circle-check-filled-16"
                className={styles.successIcon}
              />
              <div className={styles.successText}>{successMessage}</div>
            </div>
          )}
        </DSModal>
      );
    }

    return (
      <Modal
        width={500}
        opened={opened}
        close={onClose}
        closeOnClickOutside={false}
        header={modalTitle}
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
                ariaLabel={intl.formatMessage(messages.projectTitle)}
                placeholder={intl.formatMessage(messages.typeProjectName)}
                type="text"
                valueMultiloc={titleMultiloc}
                onChange={onTitleChange}
                errorMultiloc={titleError}
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
              <SuccessText>{successMessage}</SuccessText>
            </Success>
          )}
        </Content>
      </Modal>
    );
  }
);

export default injectIntl(UseTemplateModal);
