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
import { scrollTo, ScrollToParams } from './scrollTo';
import { volunteer, VolunteerParams } from './volunteer';
import {
  reactionOnComment,
  ReactionOnCommentParams,
} from './reactionOnComment';
import { reactionOnIdea, ReactionOnIdeaParams } from './reactionOnIdea';
import {
  reactionOnInitiative,
  ReactionOnInitiativeParams,
} from './reactionOnInitiative';

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

interface ScrollToAction {
  name: 'scrollTo';
  params: ScrollToParams;
}

interface VolunteerAction {
  name: 'volunteer';
  params: VolunteerParams;
}

interface ReactionOnCommentAction {
  name: 'reactionOnComment';
  params: ReactionOnCommentParams;
}

interface ReactionOnIdeaAction {
  name: 'reactionOnIdea';
  params: ReactionOnIdeaParams;
}

interface ReactionOnInitiativeAction {
  name: 'reactionOnInitiative';
  params: ReactionOnInitiativeParams;
}

export type SuccessAction =
  | AssignBudgetAction
  | RedirectToIdeaFormAction
  | RedirectToInitiativeFormAction
  | ReplyToCommentAction
  | ScrollToAction
  | VolunteerAction
  | ReactionOnCommentAction
  | ReactionOnIdeaAction
  | ReactionOnInitiativeAction;

export const getAction = ({ name, params }: SuccessAction) => {
  if (name === 'assignBudget') return assignBudget(params);
  if (name === 'redirectToIdeaForm') return redirectToIdeaForm(params);
  if (name === 'redirectToInitiativeForm') {
    return redirectToInitiativeForm(params);
  }
  if (name === 'replyToComment') return replyToComment(params);
  if (name === 'scrollTo') return scrollTo(params);
  if (name === 'volunteer') return volunteer(params);
  if (name === 'reactionOnComment') return reactionOnComment(params);
  if (name === 'reactionOnIdea') return reactionOnIdea(params);
  return reactionOnInitiative(params);
};
