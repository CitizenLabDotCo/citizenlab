import React from 'react';
import Tippy from '@tippyjs/react';

// routing
import { useParams } from 'react-router-dom';

// api
import useInputSchema from 'hooks/useInputSchema';
import useIdeaById from 'api/ideas/useIdeaById';
import useUserById from 'api/users/useUserById';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import usePhase from 'api/phases/usePhase';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';
import InfoBox from './InfoBox';
import IdeaForm from './IdeaForm';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from '../messages';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';

// utils
import { getFullName } from 'utils/textUtils';

// typings
import { FormData } from 'components/Form/typings';
import { CLErrors } from 'typings';

interface Props {
  ideaId: string | null;
  apiErrors?: CLErrors;
  formData: FormData;
  formDataValid: boolean;
  loadingApproveIdea: boolean;
  setFormData: (formData: FormData) => void;
  onApproveIdea: () => Promise<void>;
}

const IdeaEditor = ({
  ideaId,
  apiErrors,
  formData,
  formDataValid,
  loadingApproveIdea,
  setFormData,
  onApproveIdea,
}: Props) => {
  const localize = useLocalize();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const { schema, uiSchema } = useInputSchema({
    projectId,
    phaseId,
  });

  const { data: idea } = useIdeaById(ideaId ?? undefined);
  const { data: author } = useUserById(
    idea?.data.relationships.author?.data?.id,
    false
  );
  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: idea?.data.relationships.idea_import?.data?.id,
  });

  const selectedPhaseId =
    phaseId ?? idea?.data.relationships.phases.data[0]?.id;
  const { data: phase } = usePhase(selectedPhaseId);

  if (!schema || !uiSchema) return null;

  const phaseName = phase
    ? localize(phase.data.attributes.title_multiloc)
    : undefined;

  const authorName = author ? getFullName(author.data) : undefined;
  const authorEmail = author?.data.attributes.email;
  const locale = ideaMetadata?.data.attributes.locale;

  const disabledReason = formDataValid ? null : (
    <FormattedMessage {...messages.formDataNotValid} />
  );

  return (
    <>
      <Box
        px="12px"
        borderBottom={`1px ${colors.grey400} solid`}
        overflowY="scroll"
        w="100%"
        h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px - 160px)`}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {(phaseName || authorEmail || authorName || locale) && (
          <InfoBox
            phaseName={phaseName}
            authorName={authorName}
            authorEmail={authorEmail}
            locale={locale}
          />
        )}
        {ideaMetadata && (
          <IdeaForm
            schema={schema}
            uiSchema={uiSchema}
            showAllErrors={true}
            apiErrors={apiErrors}
            formData={formData}
            ideaMetadata={ideaMetadata}
            setFormData={setFormData}
          />
        )}
      </Box>
      <Box
        h="60px"
        px="24px"
        pb="4px"
        w="100%"
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
      >
        {ideaId && (
          <Tippy
            disabled={!disabledReason}
            interactive={true}
            placement="top"
            content={disabledReason || <></>}
          >
            <div>
              <Button
                icon="check"
                w="100%"
                processing={loadingApproveIdea}
                disabled={!formDataValid}
                onClick={onApproveIdea}
              >
                <FormattedMessage {...messages.approve} />
              </Button>
            </div>
          </Tippy>
        )}
      </Box>
      <Box
        px="12px"
        borderBottom={`1px ${colors.grey400} solid`}
        overflowY="scroll"
        w="100%"
        h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px - 160px)`}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {(phaseName || authorEmail || authorName || locale) && (
          <InfoBox
            phaseName={phaseName}
            authorName={authorName}
            authorEmail={authorEmail}
            locale={locale}
          />
        )}
        {ideaMetadata && (
          <IdeaForm
            schema={schema}
            uiSchema={uiSchema}
            showAllErrors={true}
            apiErrors={apiErrors}
            formData={formData}
            ideaMetadata={ideaMetadata}
            setFormData={setFormData}
          />
        )}
      </Box>
      <Box
        h="60px"
        px="24px"
        pb="4px"
        w="100%"
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
      >
        {ideaId && (
          <Tippy
            disabled={!disabledReason}
            interactive={true}
            placement="top"
            content={disabledReason || <></>}
          >
            <div>
              <Button
                icon="check"
                w="100%"
                processing={loadingApproveIdea}
                disabled={!formDataValid}
                onClick={onApproveIdea}
              >
                <FormattedMessage {...messages.approve} />
              </Button>
            </div>
          </Tippy>
        )}
      </Box>
    </>
  );
};

export default IdeaEditor;
