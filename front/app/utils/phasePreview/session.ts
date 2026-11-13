import type { IBasketData } from 'api/baskets/types';
import type { IBasketsIdeaData } from 'api/baskets_ideas/types';
import type { IVolunteer } from 'api/causes/types';
import type { IEventAttendanceData } from 'api/event_attendance/types';
import type { IIdeaFileData } from 'api/idea_files/types';
import type { PresentationMode } from 'api/phases/types';

import { createPreviewInput } from './input';
import {
  getPreviewActionSettings,
  previewActions,
  previewDates,
} from './lifecycle';
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
  private input?: ReturnType<typeof createPreviewInput>;
  private files = new Map<string, ReturnType<PreviewSession['createFile']>>();
  private previewView?: PresentationMode;
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

    const previous = this.phaseViews(this.snapshot);
    const next = this.phaseViews(snapshot);
    const enabledView = next.available
      .filter((view) => !previous.available.includes(view))
      .at(-1);

    if (enabledView) {
      this.previewView = enabledView;
    } else if (
      previous.defaultView !== next.defaultView ||
      (this.previewView && !next.available.includes(this.previewView))
    ) {
      this.previewView = undefined;
    }

    this.snapshot = snapshot;
    return true;
  }

  private phaseViews({ phase, draft }: PreviewSnapshot) {
    return {
      available: draft.available_views ??
        phase.attributes.available_views ?? ['card'],
      defaultView:
        draft.presentation_mode ?? phase.attributes.presentation_mode,
    };
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
    const draft: JsonObject = JSON.parse(JSON.stringify(this.snapshot.draft));
    const attributes: JsonObject = { ...object(phase.attributes), ...draft };
    if (this.previewView) attributes.presentation_mode = this.previewView;

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
            this.snapshot.lifecycle,
            getPreviewActionSettings(this.snapshot)
          )
        : object(attributes.action_descriptors);
    if (this.pollSubmitted) {
      actions.taking_poll = unavailable('already_responded');
    }
    attributes.action_descriptors = actions;

    if (this.snapshot.showParticipation === false) {
      attributes.votes_count = 0;
      attributes.baskets_count = 0;
      attributes.total_votes_amount = 0;
      attributes.manual_votes_count = 0;
      attributes.manual_voters_amount = 0;
      if (this.hidesSubmittedIdeas) attributes.ideas_count = 0;
    }

    phase.attributes = attributes;
    phase.relationships = {
      ...object(phase.relationships),
      user_basket: this.votes.size
        ? relation(this.basketId, 'basket')
        : { data: null },
    };
    return phase;
  }

  private basket() {
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
        user: relation('preview-user', 'user'),
        ideas: {
          data: [...this.votes.keys()].map((id) => ({ id, type: 'idea' })),
        },
      },
    } satisfies IBasketData;
  }

  private get hidesSubmittedIdeas() {
    return (
      this.snapshot.showParticipation === false &&
      ['ideation', 'proposals'].includes(
        this.snapshot.phase.attributes.participation_method
      )
    );
  }

  read(path: string, params?: URLSearchParams): JsonObject | undefined {
    if (this.hidesSubmittedIdeas) {
      if (params?.get('phase') === this.phaseId) {
        if (path === '/ideas') {
          return { data: [], links: { self: `${path}?${params}` } };
        }
        if (path === '/ideas/as_markers') {
          return { data: [] };
        }
        if (path === '/ideas/filter_counts') {
          return {
            data: {
              type: 'filter_counts',
              attributes: {
                idea_status_id: {},
                area_id: {},
                input_topic_id: {},
                total: 0,
              },
            },
          };
        }
      }
      if (path === `/phases/${this.phaseId}/idea_feed/ideas`) {
        return { data: [] };
      }
    }

    if (this.snapshot.showParticipation === false) {
      if (path === `/phases/${this.phaseId}/poll_responses/responses_count`) {
        return {
          data: {
            type: 'responses_count',
            attributes: { series: { options: {} } },
          },
        };
      }
      if (path === `/phases/${this.phaseId}/common_ground_results`) {
        return {
          data: {
            id: this.phaseId,
            type: 'common_ground_results',
            attributes: {
              stats: {
                num_participants: 0,
                num_ideas: this.snapshot.phase.attributes.ideas_count,
                votes: { up: 0, down: 0, neutral: 0 },
              },
              top_consensus_ideas: [],
              top_controversial_ideas: [],
              ideas_by_agreement: [],
            },
          },
        };
      }
    }

    if (path === `/phases/${this.phaseId}`) return { data: this.phase() };
    if (path === `/ideas/draft/${this.phaseId}`) {
      if (this.input) return this.transform({ data: this.input });

      return {
        data: {
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

    if (this.input && path === `/ideas/${this.input.id}/images`) {
      return { data: [], links: {} };
    }
    if (this.input && path === `/ideas/${this.input.id}/files`) {
      return { data: [...this.files.values()] };
    }

    if (path === '/ideas/survey_submissions') return { data: [] };
    if (
      (path.startsWith('/ideas/preview-') ||
        path === '/ideas/by_slug/preview-input') &&
      this.input
    ) {
      return this.transform({ data: this.input });
    }
    if (
      this.snapshot.unsaved &&
      (path.startsWith(`/phases/${this.phaseId}/`) || path === '/events')
    ) {
      return { data: [], links: {} };
    }

    return undefined;
  }

  private basketIdea(id: string, votes: number) {
    return {
      id: `preview-${id}`,
      type: 'baskets_idea',
      attributes: { votes },
      relationships: {
        idea: relation(id, 'idea'),
        basket: relation(this.basketId, 'basket'),
      },
    } satisfies IBasketsIdeaData;
  }

  private createFile(name: string, content: string) {
    const now = new Date().toISOString();
    const encoded = content.slice(content.indexOf(',') + 1);

    return {
      id: `preview-${crypto.randomUUID()}`,
      type: 'file',
      attributes: {
        file: { url: content },
        name,
        size: atob(encoded).length,
        ordering: this.files.size,
        created_at: now,
        updated_at: now,
      },
    } satisfies IIdeaFileData;
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
      this.files.clear();
      this.input = createPreviewInput(this.snapshot, body);
      return this.transform({ data: this.input });
    }

    if (
      this.input &&
      parts[0] === 'ideas' &&
      parts[1] === this.input.id &&
      parts[2] === 'files'
    ) {
      if (method === 'POST' && parts.length === 3) {
        const file = object(body.file);
        if (
          typeof file.name !== 'string' ||
          typeof file.file !== 'string' ||
          !/^data:[^,]*;base64,/.test(file.file)
        ) {
          return undefined;
        }

        const resource = this.createFile(file.name, file.file);
        this.files.set(resource.id, resource);
        return { data: resource };
      }
      if (
        method === 'DELETE' &&
        parts.length === 4 &&
        this.files.delete(parts[3])
      ) {
        return { data: null };
      }
      return undefined;
    }

    if (
      path === `/ideas/${this.input?.id}` &&
      method === 'PATCH' &&
      this.input
    ) {
      this.input.attributes = {
        ...this.input.attributes,
        ...object(body.idea),
      };
      return this.transform({ data: this.input });
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
      return {
        data: {
          id,
          type: 'volunteer',
          attributes: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          relationships: {
            user: relation('preview-user', 'user'),
            cause: relation(parts[1], 'cause'),
          },
        },
      } satisfies IVolunteer;
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
          attributes: { created_at: new Date().toISOString() },
          relationships: { attendee: relation('preview-user', 'user') },
        } satisfies IEventAttendanceData,
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
            ? {
                ...attributes,
                publication_status: 'published',
                ...(this.snapshot.showParticipation === false && {
                  baskets_count: 0,
                }),
              }
            : attributes,
          relationships: {
            ...relationships,
            user_basket: { data: null },
          },
        };
      }

      if (item.type === 'idea') {
        const phases = object(relationships.phases).data;
        const belongsToPhase =
          Array.isArray(phases) &&
          phases.some((phase) => object(phase).id === this.phaseId);

        return {
          ...item,
          attributes:
            this.snapshot.lifecycle && attributes.action_descriptors
              ? {
                  ...attributes,
                  ...(this.snapshot.showParticipation === false && {
                    votes_count: 0,
                    manual_votes_amount: 0,
                    total_votes: 0,
                  }),
                  action_descriptors: previewActions(
                    object(attributes.action_descriptors),
                    this.snapshot.lifecycle,
                    belongsToPhase
                      ? getPreviewActionSettings(this.snapshot)
                      : {}
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
          attributes:
            this.snapshot.showParticipation === false
              ? { ...attributes, volunteers_count: 0 }
              : attributes,
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
            ...((this.snapshot.unsaved ||
              this.snapshot.phase.attributes.placement_type === 'standalone') &&
            path === `/projects/${this.snapshot.project.id}/phases` &&
            !response.data.some((item) => object(item).id === this.phaseId)
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
