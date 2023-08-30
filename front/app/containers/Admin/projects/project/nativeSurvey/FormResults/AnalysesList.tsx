import React from 'react';
import useAnalyses from 'api/analyses/useAnalyses';
import useDeleteAnalysis from 'api/analyses/useDeleteAnalysis';
import { useParams, useSearchParams } from 'react-router-dom';
import { ListItem, Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import useFormCustomFields from 'hooks/useFormCustomFields';
import { isNilOrError } from 'utils/helperUtils';
import useLocalize from 'hooks/useLocalize';
import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';

const AnalysesList = ({ customFieldId }: { customFieldId: string }) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { projectId } = useParams() as { projectId: string };
  const [urlParams] = useSearchParams();
  const phaseId = urlParams.get('phase_id') || undefined;

  const { mutate: deleteAnalysis } = useDeleteAnalysis();
  const { data: analyses } = useAnalyses({
    projectId: phaseId ? undefined : projectId,
    phaseId,
  });

  const formCustomFields = useFormCustomFields({
    projectId,
    phaseId,
  });

  const handleDeleteAnalysis = (analysisId: string) => {
    if (window.confirm(formatMessage(messages.deleteAnalysisConfirmation))) {
      deleteAnalysis(analysisId, {
        onSuccess: () => {
          trackEventByName(tracks.analysisForSurveyDeleted.name, {
            extra: { projectId },
          });
        },
      });
    }
  };
  return (
    <div>
      {analyses?.data
        .filter((analysis) =>
          analysis.relationships.custom_fields.data.some(
            (field) => field.id === customFieldId
          )
        )
        .map((analysis) => {
          return (
            <ListItem
              key={analysis.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py="16px"
              gap="24px"
            >
              <ul>
                {analysis.relationships.custom_fields.data.map((field) => {
                  return (
                    <li key={field.id}>
                      {!isNilOrError(formCustomFields) &&
                        localize(
                          formCustomFields?.find((f) => f.id === field.id)
                            ?.title_multiloc
                        )}
                    </li>
                  );
                })}
              </ul>

              <Box display="flex" gap="24px">
                <Button
                  linkTo={`/admin/projects/${projectId}/analysis/${
                    analysis.id
                  }${phaseId ? `?phase_id=${phaseId}` : ''}`}
                  icon="eye"
                  buttonStyle="secondary"
                >
                  {formatMessage(messages.viewAnalysis)}
                </Button>
                <Button
                  onClick={() => handleDeleteAnalysis(analysis.id)}
                  icon="delete"
                  buttonStyle="secondary"
                >
                  {formatMessage(messages.deleteAnalysis)}
                </Button>
              </Box>
            </ListItem>
          );
        })}
    </div>
  );
};

export default AnalysesList;
