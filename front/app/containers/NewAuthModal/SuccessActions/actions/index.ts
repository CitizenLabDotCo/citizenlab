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

export const actions = {
  assignBudget,
  redirectToIdeaForm,
  redirectToInitiativeForm,
  replyToComment,
  scrollToSurvey,
  volunteer,
  voteOnComment,
  voteOnIdea,
  voteOnInitiative,
};
