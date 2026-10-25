import { previewActions, previewDates } from './lifecycle';
import { Json, JsonObject, object, PreviewSnapshot, relation } from './types';

const unavailable = (reason: string) => ({
  enabled: false,
  disabled_reason: reason,
});

export class PreviewSession {
  readonly phaseId: string;
  readonly basketId = 'preview-basket';
  private readonly now = Date.now();
  private votes = new Map<string, number>();
  private volunteers = new Map<string, string>();
  private events = new Map<string, JsonObject>();
  private attendances = new Map<string, string>();
  private reactions = new Map<string, string>();
  private input?: JsonObject;
  private submitted = false;
  private pollSubmitted = false;
  private statements: JsonObject[] = [];

  get statementPage() {
    return Math.floor(this.reactions.size / 20) + 1;
  }

  setStatements(response: JsonObject) {
    this.statements = Array.isArray(response.data)
      ? response.data.map(object)
      : [];
  }

  constructor(public snapshot: PreviewSnapshot) {
    this.phaseId = snapshot.phase.id;
  }

  updateSnapshot(snapshot: PreviewSnapshot) {
    if (
      snapshot.phase.id !== this.phaseId ||
      snapshot.project.id !== this.snapshot.project.id ||
      JSON.stringify(snapshot) === JSON.stringify(this.snapshot)
    ) {
      return false;
    }

    this.snapshot = snapshot;
    return true;
  }

  attendingEvents() {
    return this.transform({
      data: [...this.events.values()].filter((event) =>
        this.attendances.has(String(event.id))
      ),
      links: {},
    });
  }

  private phase() {
    // The message comes from our same-origin editor; JSON removes undefined fields.
    const phase: JsonObject = JSON.parse(JSON.stringify(this.snapshot.phase));
    const attributes = {
      ...object(phase.attributes),
      ...JSON.parse(JSON.stringify(this.snapshot.draft)),
    };
    const draftDescription = attributes.draft_description_multiloc;
    if (draftDescription && Object.keys(object(draftDescription)).length) {
      attributes.description_multiloc = draftDescription;
    }

    if (this.snapshot.lifecycle) {
      Object.assign(
        attributes,
        previewDates(
          {
            start_at:
              typeof attributes.start_at === 'string'
                ? attributes.start_at
                : undefined,
            end_at:
              typeof attributes.end_at === 'string' ? attributes.end_at : null,
          },
          this.snapshot.lifecycle,
          this.now
        )
      );
    }

    const actions =
      this.snapshot.lifecycle && !this.snapshot.unsaved
        ? previewActions(
            object(attributes.action_descriptors),
            this.snapshot.lifecycle
          )
        : object(attributes.action_descriptors);
    if (this.pollSubmitted) {
      actions.taking_poll = unavailable('already_responded');
    }
    attributes.action_descriptors = actions;

    phase.attributes = attributes;
    phase.relationships = {
      ...object(phase.relationships),
      user_basket: this.votes.size
        ? relation(this.basketId, 'basket')
        : { data: null },
    };
    return phase;
  }

  private basket(): JsonObject {
    return {
      id: this.basketId,
      type: 'basket',
      attributes: {
        submitted_at: this.submitted ? new Date().toISOString() : null,
        total_votes: [...this.votes.values()].reduce(
          (sum, value) => sum + value,
          0
        ),
      },
      relationships: {
        phase: relation(this.phaseId, 'phase'),
        ideas: {
          data: [...this.votes.keys()].map((id) => ({ id, type: 'idea' })),
        },
      },
    };
  }

  read(path: string): JsonObject | undefined {
    if (path === `/phases/${this.phaseId}`) return { data: this.phase() };
    if (path === `/ideas/draft/${this.phaseId}`) {
      return {
        data: this.input ?? {
          type: 'idea',
          attributes: {
            custom_field_values: {},
            title_multiloc: {},
            body_multiloc: {},
          },
        },
      };
    }
    if (path === `/baskets/${this.basketId}`) return { data: this.basket() };
    if (path === `/baskets/${this.basketId}/baskets_ideas`) {
      return {
        data: [...this.votes].map(([id, votes]) => this.basketIdea(id, votes)),
      };
    }
    if (path.startsWith('/reactions/preview-')) {
      const id = path.slice('/reactions/preview-'.length);
      return {
        data: {
          id: `preview-${id}`,
          type: 'reaction',
          attributes: { mode: this.reactions.get(id) },
          relationships: { reactable: relation(id, 'idea') },
        },
      };
    }

    if (
      this.input &&
      [
        `/ideas/${this.input.id}/images`,
        `/ideas/${this.input.id}/files`,
      ].includes(path)
    ) {
      return { data: [], links: {} };
    }

    if (path === '/ideas/survey_submissions') return { data: [] };
    if (
      (path.startsWith('/ideas/preview-') ||
        path === '/ideas/by_slug/preview-input') &&
      this.input
    ) {
      return { data: this.input };
    }
    if (
      this.snapshot.unsaved &&
      (path.startsWith(`/phases/${this.phaseId}/`) || path === '/events')
    ) {
      return { data: [], links: {} };
    }

    return undefined;
  }

  private basketIdea(id: string, votes: number): JsonObject {
    return {
      id: `preview-${id}`,
      type: 'baskets_idea',
      attributes: { votes },
      relationships: {
        idea: relation(id, 'idea'),
        basket: relation(this.basketId, 'basket'),
      },
    };
  }

  write(
    path: string,
    method: string,
    body: JsonObject
  ): JsonObject | undefined {
    if (
      this.snapshot.unsaved ||
      (this.snapshot.lifecycle && this.snapshot.lifecycle !== 'open')
    ) {
      return undefined;
    }

    const parts = path.split('/').filter(Boolean);

    if (path === `/phases/${this.phaseId}/inputs` && method === 'POST') {
      this.input = {
        id: `preview-${crypto.randomUUID()}`,
        type: 'idea',
        attributes: {
          slug: 'preview-input',
          title_multiloc: {},
          body_multiloc: {},
          custom_field_values: {},
          comments_count: 0,
          likes_count: 0,
          dislikes_count: 0,
          followers_count: 0,
          anonymous: true,
          author_hash: 'preview',
          supports_public_visibility: true,
          publication_status: 'published',
          action_descriptors: {
            ...object(object(this.phase().attributes).action_descriptors),
            editing_idea: unavailable('not_author'),
          },
          created_at: new Date().toISOString(),
          published_at: new Date().toISOString(),
          ...object(body.idea),
        },
        relationships: {
          author: { data: null },
          idea_status: { data: null },
          user_follower: { data: null },
          user_reaction: { data: null },
          ideas_phases: { data: [] },
          project: relation(this.snapshot.project.id, 'project'),
          creation_phase: relation(this.phaseId, 'phase'),
          phases: { data: [{ id: this.phaseId, type: 'phase' }] },
          idea_images: { data: [] },
          idea_files: { data: [] },
          input_topics: { data: [] },
        },
      };
      return { data: this.input };
    }

    if (
      path === `/ideas/${this.input?.id}` &&
      method === 'PATCH' &&
      this.input
    ) {
      this.input.attributes = {
        ...object(this.input.attributes),
        ...object(body.idea),
      };
      return { data: this.input };
    }

    if (
      path === `/phases/${this.phaseId}/poll_responses` &&
      method === 'POST'
    ) {
      this.pollSubmitted = true;
      return {
        data: {
          id: 'preview-poll-response',
          type: 'poll_response',
          attributes: {},
        },
        included: [this.phase()],
      };
    }

    if (parts[0] === 'baskets' && parts[1] === 'ideas' && method === 'PUT') {
      const votes = Number(object(body.baskets_idea).votes ?? 0);
      if (votes) this.votes.set(parts[2], votes);
      else this.votes.delete(parts[2]);
      return { data: this.basketIdea(parts[2], votes) };
    }

    if (path === `/baskets/${this.basketId}` && method === 'PATCH') {
      this.submitted = object(body.basket).submitted === true;
      return { data: this.basket() };
    }

    if (parts[0] === 'causes' && parts[2] === 'volunteers') {
      const id = `preview-${parts[1]}`;
      if (method === 'POST') this.volunteers.set(parts[1], id);
      else if (method === 'DELETE') this.volunteers.delete(parts[1]);
      else return undefined;
      return { data: { id, type: 'volunteer', attributes: {} } };
    }

    if (
      parts[0] === 'events' &&
      parts[2] === 'attendances' &&
      method === 'POST'
    ) {
      const id = `preview-${parts[1]}`;
      this.attendances.set(parts[1], id);
      return {
        data: {
          id,
          type: 'attendance',
          attributes: {},
          relationships: { event: relation(parts[1], 'event') },
        },
      };
    }

    if (
      parts[0] === 'events' &&
      parts[2] === 'attendances' &&
      method === 'DELETE'
    ) {
      this.attendances.delete(parts[1]);
      return { data: null };
    }

    if (parts[0] === 'ideas' && parts[2] === 'reactions' && method === 'POST') {
      this.reactions.set(parts[1], String(object(body.reaction).mode));
      return {
        data: {
          id: `preview-${parts[1]}`,
          type: 'reaction',
          attributes: object(body.reaction),
        },
      };
    }

    if (
      parts[0] === 'reactions' &&
      method === 'DELETE' &&
      parts[1].startsWith('preview-')
    ) {
      this.reactions.delete(parts[1].slice('preview-'.length));
      return { data: null };
    }

    if (parts[0] === 'event_attendances' && method === 'DELETE') {
      for (const [eventId, attendanceId] of this.attendances) {
        if (attendanceId === parts[1]) this.attendances.delete(eventId);
      }
      return { data: null };
    }

    if (parts[0] === 'ideas' && parts[2] === 'exposures') {
      return { data: { id: 'preview-exposure', type: 'exposure' } };
    }
    return undefined;
  }

  transform(response: JsonObject, path?: string): JsonObject {
    const patch = (resource: Json): Json => {
      const item = object(resource);
      const id = String(item.id);
      const attributes = object(item.attributes);
      const relationships = object(item.relationships);

      if (item.type === 'phase') {
        if (id === this.phaseId) return this.phase();
      }

      if (item.type === 'project' && id === this.snapshot.project.id) {
        return {
          ...item,
          attributes: this.snapshot.lifecycle
            ? { ...attributes, publication_status: 'published' }
            : attributes,
          relationships: {
            ...relationships,
            user_basket: { data: null },
          },
        };
      }

      if (item.type === 'idea') {
        return {
          ...item,
          attributes:
            this.snapshot.lifecycle && attributes.action_descriptors
              ? {
                  ...attributes,
                  action_descriptors: previewActions(
                    object(attributes.action_descriptors),
                    this.snapshot.lifecycle
                  ),
                }
              : attributes,
          relationships: {
            ...relationships,
            user_reaction: this.reactions.has(id)
              ? relation(`preview-${id}`, 'reaction')
              : { data: null },
          },
        };
      }

      if (item.type === 'cause') {
        return {
          ...item,
          relationships: {
            ...relationships,
            user_volunteer: this.volunteers.has(id)
              ? relation(`preview-${id}`, 'volunteer')
              : { data: null },
          },
        };
      }
      if (item.type === 'event') {
        this.events.set(id, item);
        return {
          ...item,
          relationships: {
            ...relationships,
            user_attendance: this.attendances.has(id)
              ? relation(`preview-${id}`, 'attendance')
              : { data: null },
          },
        };
      }

      if (item.type === 'common_ground_progress') {
        const ideas = this.statements;
        const next = ideas.find((idea) => !this.reactions.has(String(idea.id)));

        return {
          ...item,
          attributes: { ...attributes, num_reacted_ideas: this.reactions.size },
          relationships: {
            next_idea: { data: next ? { id: next.id, type: 'idea' } : null },
          },
        };
      }
      return item;
    };

    return {
      ...response,
      data: Array.isArray(response.data)
        ? [
            ...response.data.map(patch),
            ...(this.snapshot.unsaved &&
            path === `/projects/${this.snapshot.project.id}/phases`
              ? [this.phase()]
              : []),
          ]
        : response.data
        ? patch(response.data)
        : response.data,
      ...(Array.isArray(response.included)
        ? { included: response.included.map(patch) }
        : {}),
    };
  }
}
