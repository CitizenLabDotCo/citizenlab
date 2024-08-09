import { isEqual } from 'lodash-es';

import {
  attendEvent,
  AttendEventParams,
} from 'containers/Authentication/SuccessActions/actions/attendEvent';

import { follow, FollowActionParams } from './follow';
import {
  reactionOnComment,
  ReactionOnCommentParams,
} from './reactionOnComment';
import { reactionOnIdea, ReactionOnIdeaParams } from './reactionOnIdea';
import {
  reactionOnInitiative,
  ReactionOnInitiativeParams,
} from './reactionOnInitiative';
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
import { submitPoll, SubmitPollParams } from './submitPoll';
import { volunteer, VolunteerParams } from './volunteer';
import { vote, VoteParams } from './vote';

interface RedirectToIdeaFormAction {
  name: 'redirectToIdeaForm';
  params: RedirectToIdeaFormParams;
}

interface RedirectToInitiativeFormAction {
  name: 'redirectToInitiativeForm';
  params: RedirectToInitiativeFormParams;
}

interface FollowAction {
  name: 'follow';
  params: FollowActionParams;
}

interface ReplyToCommentAction {
  name: 'replyToComment';
  params: ReplyToCommentParams;
}

interface ScrollToAction {
  name: 'scrollTo';
  params: ScrollToParams;
}

interface AttendEventAction {
  name: 'attendEvent';
  params: AttendEventParams;
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

interface SubmitPollAction {
  name: 'submitPoll';
  params: SubmitPollParams;
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
  | FollowAction
  | SubmitPollAction
  | AttendEventAction;

// https://hackernoon.com/mastering-type-safe-json-serialization-in-typescript
type JSONPrimitive = string | number | boolean | null | undefined;

type JSONValue =
  | JSONPrimitive
  | JSONValue[]
  | {
      [key: string]: JSONValue;
    };

// eslint-disable-next-line
type NotAssignableToJson = bigint | symbol | Function;

type JSONCompatible<T> = unknown extends T
  ? never
  : {
      [P in keyof T]: T[P] extends JSONValue
        ? T[P]
        : T[P] extends NotAssignableToJson
        ? never
        : JSONCompatible<T[P]>;
    };

// We need this check to make sure that the params are JSON serializable.
// When I (Luuc) built this initially, I didn't enforce this yet.
// But now it seems that people are adding non-JSON-serializable attributes,
// which breaks core functionality.
// Hopefully, this function will help avoid this in the future.
//
// The reason why we only allow JSON serializable attributes is because
// when dealing with SSO or other authentication flows that leave the platform,
// we need to somehow remember what the user was doing before they left.
// We do this by storing the SuccessAction in the session storage.
// This is why we need to make sure that the SuccessAction is JSON serializable-
// e.g. callbacks are not JSON serializable and thus should never be
// used in the params.
const ensureJSONSerializable = <T extends Record<string, any>>(
  params: JSONCompatible<T>
) => {
  if (!isEqual(JSON.parse(JSON.stringify(params)), params)) {
    // This should in theory never happen, since it should be caught
    // by the JSONCompatible type check.
    throw new Error('SuccessAction params are not JSON serializable');
  }
};

export const getAction = ({ name, params }: SuccessAction) => {
  if (name === 'redirectToIdeaForm') {
    ensureJSONSerializable(params);
    return redirectToIdeaForm(params);
  }

  if (name === 'redirectToInitiativeForm') {
    ensureJSONSerializable(params);
    return redirectToInitiativeForm(params);
  }

  if (name === 'follow') {
    ensureJSONSerializable(params);
    return follow(params);
  }

  if (name === 'replyToComment') {
    ensureJSONSerializable(params);
    return replyToComment(params);
  }

  if (name === 'scrollTo') {
    ensureJSONSerializable(params);
    return scrollTo(params);
  }

  if (name === 'volunteer') {
    ensureJSONSerializable(params);
    return volunteer(params);
  }

  if (name === 'vote') {
    ensureJSONSerializable(params);
    return vote(params);
  }

  if (name === 'reactionOnComment') {
    ensureJSONSerializable(params);
    return reactionOnComment(params);
  }

  if (name === 'reactionOnIdea') {
    ensureJSONSerializable(params);
    return reactionOnIdea(params);
  }

  if (name === 'submitPoll') {
    ensureJSONSerializable(params);
    return submitPoll(params);
  }

  if (name === 'attendEvent') {
    ensureJSONSerializable(params);
    return attendEvent(params);
  }

  ensureJSONSerializable(params);
  return reactionOnInitiative(params);
};
