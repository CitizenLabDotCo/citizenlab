import { assignBudget, AssignBudgetParams } from './assignBudget';
import {
  redirectToIdeaForm,
  RedirectToIdeaFormParams,
} from './redirectToIdeaForm';
import {
  redirectToInitiativeForm,
  RedirectToInitiativeFormParams,
} from './redirectToInitiativeForm';
import { replyToComment, ReplyToCommentParams } from './replyToComment';
import { scrollToSurvey, ScrollToSurveyParams } from './scrollToSurvey';
import { volunteer, VolunteerParams } from './volunteer';
import { voteOnComment, VoteOnCommentParams } from './voteOnComment';
import { voteOnIdea, VoteOnIdeaParams } from './voteOnIdea';
import { voteOnInitiative, VoteOnInitiativeParams } from './voteOnInitiative';

interface AssignBudgetAction {
  name: 'assignBudget';
  params: AssignBudgetParams;
}

interface RedirectToIdeaFormAction {
  name: 'redirectToIdeaForm';
  params: RedirectToIdeaFormParams;
}

interface RedirectToInitiativeFormAction {
  name: 'redirectToInitiativeForm';
  params: RedirectToInitiativeFormParams;
}

interface ReplyToCommentAction {
  name: 'replyToComment';
  params: ReplyToCommentParams;
}

interface ScrollToSurveyAction {
  name: 'scrollToSurvey';
  params: ScrollToSurveyParams;
}

interface VolunteerAction {
  name: 'volunteer';
  params: VolunteerParams;
}

interface VoteOnCommentAction {
  name: 'voteOnComment';
  params: VoteOnCommentParams;
}

interface VoteOnIdeaAction {
  name: 'voteOnIdea';
  params: VoteOnIdeaParams;
}

interface VoteOnInitiativeAction {
  name: 'voteOnInitiative';
  params: VoteOnInitiativeParams;
}

export type SuccessAction =
  | AssignBudgetAction
  | RedirectToIdeaFormAction
  | RedirectToInitiativeFormAction
  | ReplyToCommentAction
  | ScrollToSurveyAction
  | VolunteerAction
  | VoteOnCommentAction
  | VoteOnIdeaAction
  | VoteOnInitiativeAction;
// CL-3466

export const getAction = ({ name, params }: SuccessAction) => {
  if (name === 'assignBudget') return assignBudget(params);
  if (name === 'redirectToIdeaForm') return redirectToIdeaForm(params);
  if (name === 'redirectToInitiativeForm') {
    return redirectToInitiativeForm(params);
  }
  if (name === 'replyToComment') return replyToComment(params);
  if (name === 'scrollToSurvey') return scrollToSurvey(params);
  if (name === 'volunteer') return volunteer(params);
  if (name === 'voteOnComment') return voteOnComment(params);
  if (name === 'voteOnIdea') return voteOnIdea(params);
  return voteOnInitiative(params);
};
