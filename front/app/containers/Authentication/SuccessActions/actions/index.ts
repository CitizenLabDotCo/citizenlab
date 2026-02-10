import { isEqual, transform } from 'lodash-es';

import {
  attendEvent,
  AttendEventParams,
} from 'containers/Authentication/SuccessActions/actions/attendEvent';

import { follow, FollowActionParams } from './follow';
import {
  followProjectAndRedirect,
  FollowProjectAndRedirectParams,
} from './followProjectAndRedirect';
import {
  reactionOnComment,
  ReactionOnCommentParams,
} from './reactionOnComment';
import { reactionOnIdea, ReactionOnIdeaParams } from './reactionOnIdea';
import {
  redirectToIdeaForm,
  RedirectToIdeaFormParams,
} from './redirectToIdeaForm';
import { replyToComment, ReplyToCommentParams } from './replyToComment';
import { scrollTo, ScrollToParams } from './scrollTo';
import { submitPoll, SubmitPollParams } from './submitPoll';
import { volunteer, VolunteerParams } from './volunteer';
import { vote, VoteParams } from './vote';

interface RedirectToIdeaFormAction {
  name: 'redirectToIdeaForm';
  params: RedirectToIdeaFormParams;
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

interface SubmitPollAction {
  name: 'submitPoll';
  params: SubmitPollParams;
}

interface FollowProjectAndRedirectAction {
  name: 'followProjectAndRedirect';
  params: FollowProjectAndRedirectParams;
}

export type SuccessAction =
  | RedirectToIdeaFormAction
  | ReplyToCommentAction
  | ScrollToAction
  | VolunteerAction
  | VoteAction
  | ReactionOnCommentAction
  | ReactionOnIdeaAction
  | FollowAction
  | SubmitPollAction
  | AttendEventAction
  | FollowProjectAndRedirectAction;

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
  // We remove all undefined properties from the params.
  // JSON.stringify below removes undefined properties. This means that the equality
  // check fails if the params contain undefined properties.
  // This would mean that an object like { a: 1, b: undefined } would be rejected,
  // because it would be serialized to { a: 1 }.
  // Since it's really fine to remove undefined properties, we want the check to pass,
  // so we instead remove them here.
  const paramsWithoutUndefinedProperties = transform(
    params,
    (result: any, value, key) => {
      if (value !== undefined) {
        result[key] = value;
      }
    }
  );

  if (
    !isEqual(
      JSON.parse(JSON.stringify(params)),
      paramsWithoutUndefinedProperties
    )
  ) {
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

  if (name === 'followProjectAndRedirect') {
    ensureJSONSerializable(params);
    return followProjectAndRedirect(params);
  }

  ensureJSONSerializable(params);
  return attendEvent(params);
};
