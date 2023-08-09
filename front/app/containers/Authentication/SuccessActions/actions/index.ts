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
import { vote, VoteParams } from './vote';
import {
  reactionOnComment,
  ReactionOnCommentParams,
} from './reactionOnComment';
import { reactionOnIdea, ReactionOnIdeaParams } from './reactionOnIdea';
import {
  reactionOnInitiative,
  ReactionOnInitiativeParams,
} from './reactionOnInitiative';
import { attendEvent, AttendEventParams } from './attendEvent';

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

interface VoteAction {
  name: 'vote';
  params: VoteParams;
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

interface AttendEventAction {
  name: 'attendEvent';
  params: AttendEventParams;
}

export type SuccessAction =
  | RedirectToIdeaFormAction
  | RedirectToInitiativeFormAction
  | ReplyToCommentAction
  | ScrollToAction
  | VolunteerAction
  | VoteAction
  | ReactionOnCommentAction
  | ReactionOnIdeaAction
  | ReactionOnInitiativeAction
  | AttendEventAction;

export const getAction = ({ name, params }: SuccessAction) => {
  if (name === 'redirectToIdeaForm') return redirectToIdeaForm(params);
  if (name === 'redirectToInitiativeForm') {
    return redirectToInitiativeForm(params);
  }
  if (name === 'replyToComment') return replyToComment(params);
  if (name === 'scrollTo') return scrollTo(params);
  if (name === 'volunteer') return volunteer(params);
  if (name === 'vote') return vote(params);
  if (name === 'reactionOnComment') return reactionOnComment(params);
  if (name === 'reactionOnIdea') return reactionOnIdea(params);
  if (name === 'attendEvent') return attendEvent(params);
  return reactionOnInitiative(params);
};
