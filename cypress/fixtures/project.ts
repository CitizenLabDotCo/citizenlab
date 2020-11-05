import { randomString } from '../support/commands';

interface Props {
  type?: 'timeline' | 'continuous';
  title?: string;
  descriptionPreview?: string;
  description?: string;
  publicationStatus?: 'draft' | 'published' | 'archived';
  participationMethod?:
    | 'ideation'
    | 'information'
    | 'survey'
    | 'budgeting'
    | 'poll';
  assigneeId?: string;
  surveyUrl?: string;
  surveyService?: 'typeform' | 'survey_monkey' | 'google_forms';
}

export default (project: Props) => ({
  type: project.type || 'timeline',
  title: project.title || randomString(),
  descriptionPreview: project.descriptionPreview || randomString(),
  description: project.description || randomString(),
  publicationStatus: project.publicationStatus || 'published',
  participationMethod: project.participationMethod || 'ideation',
  assigneeId: project.assigneeId,
  surveyUrl: project.surveyUrl || randomString(),
  surveyService: project.surveyService || 'typeform',
});
