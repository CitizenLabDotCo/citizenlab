SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: shared_extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA shared_extensions;


--
-- Name: que_validate_tags(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.que_validate_tags(tags_array jsonb) RETURNS boolean
    LANGUAGE sql
    AS $$
  SELECT bool_and(
    jsonb_typeof(value) = 'string'
    AND
    char_length(value::text) <= 100
  )
  FROM jsonb_array_elements(tags_array)
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: que_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.que_jobs (
    priority smallint DEFAULT 100 NOT NULL,
    run_at timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL,
    job_class text NOT NULL,
    error_count integer DEFAULT 0 NOT NULL,
    last_error_message text,
    queue text DEFAULT 'default'::text NOT NULL,
    last_error_backtrace text,
    finished_at timestamp with time zone,
    expired_at timestamp with time zone,
    args jsonb DEFAULT '[]'::jsonb NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT error_length CHECK (((char_length(last_error_message) <= 500) AND (char_length(last_error_backtrace) <= 10000))),
    CONSTRAINT job_class_length CHECK ((char_length(
CASE job_class
    WHEN 'ActiveJob::QueueAdapters::QueAdapter::JobWrapper'::text THEN ((args -> 0) ->> 'job_class'::text)
    ELSE job_class
END) <= 200)),
    CONSTRAINT queue_length CHECK ((char_length(queue) <= 100)),
    CONSTRAINT valid_args CHECK ((jsonb_typeof(args) = 'array'::text)),
    CONSTRAINT valid_data CHECK (((jsonb_typeof(data) = 'object'::text) AND ((NOT (data ? 'tags'::text)) OR ((jsonb_typeof((data -> 'tags'::text)) = 'array'::text) AND (jsonb_array_length((data -> 'tags'::text)) <= 5) AND public.que_validate_tags((data -> 'tags'::text))))))
)
WITH (fillfactor='90');


--
-- Name: TABLE que_jobs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.que_jobs IS '4';


--
-- Name: que_determine_job_state(public.que_jobs); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.que_determine_job_state(job public.que_jobs) RETURNS text
    LANGUAGE sql
    AS $$
  SELECT
    CASE
    WHEN job.expired_at  IS NOT NULL    THEN 'expired'
    WHEN job.finished_at IS NOT NULL    THEN 'finished'
    WHEN job.error_count > 0            THEN 'errored'
    WHEN job.run_at > CURRENT_TIMESTAMP THEN 'scheduled'
    ELSE                                     'ready'
    END
$$;


--
-- Name: que_job_notify(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.que_job_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    locker_pid integer;
    sort_key json;
  BEGIN
    -- Don't do anything if the job is scheduled for a future time.
    IF NEW.run_at IS NOT NULL AND NEW.run_at > now() THEN
      RETURN null;
    END IF;

    -- Pick a locker to notify of the job's insertion, weighted by their number
    -- of workers. Should bounce pseudorandomly between lockers on each
    -- invocation, hence the md5-ordering, but still touch each one equally,
    -- hence the modulo using the job_id.
    SELECT pid
    INTO locker_pid
    FROM (
      SELECT *, last_value(row_number) OVER () + 1 AS count
      FROM (
        SELECT *, row_number() OVER () - 1 AS row_number
        FROM (
          SELECT *
          FROM public.que_lockers ql, generate_series(1, ql.worker_count) AS id
          WHERE listening AND queues @> ARRAY[NEW.queue]
          ORDER BY md5(pid::text || id::text)
        ) t1
      ) t2
    ) t3
    WHERE NEW.id % count = row_number;

    IF locker_pid IS NOT NULL THEN
      -- There's a size limit to what can be broadcast via LISTEN/NOTIFY, so
      -- rather than throw errors when someone enqueues a big job, just
      -- broadcast the most pertinent information, and let the locker query for
      -- the record after it's taken the lock. The worker will have to hit the
      -- DB in order to make sure the job is still visible anyway.
      SELECT row_to_json(t)
      INTO sort_key
      FROM (
        SELECT
          'job_available' AS message_type,
          NEW.queue       AS queue,
          NEW.priority    AS priority,
          NEW.id          AS id,
          -- Make sure we output timestamps as UTC ISO 8601
          to_char(NEW.run_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS run_at
      ) t;

      PERFORM pg_notify('que_listener_' || locker_pid::text, sort_key::text);
    END IF;

    RETURN null;
  END
$$;


--
-- Name: que_state_notify(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.que_state_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    row record;
    message json;
    previous_state text;
    current_state text;
  BEGIN
    IF TG_OP = 'INSERT' THEN
      previous_state := 'nonexistent';
      current_state  := public.que_determine_job_state(NEW);
      row            := NEW;
    ELSIF TG_OP = 'DELETE' THEN
      previous_state := public.que_determine_job_state(OLD);
      current_state  := 'nonexistent';
      row            := OLD;
    ELSIF TG_OP = 'UPDATE' THEN
      previous_state := public.que_determine_job_state(OLD);
      current_state  := public.que_determine_job_state(NEW);

      -- If the state didn't change, short-circuit.
      IF previous_state = current_state THEN
        RETURN null;
      END IF;

      row := NEW;
    ELSE
      RAISE EXCEPTION 'Unrecognized TG_OP: %', TG_OP;
    END IF;

    SELECT row_to_json(t)
    INTO message
    FROM (
      SELECT
        'job_change' AS message_type,
        row.id       AS id,
        row.queue    AS queue,

        coalesce(row.data->'tags', '[]'::jsonb) AS tags,

        to_char(row.run_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS run_at,
        to_char(now()      AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS time,

        CASE row.job_class
        WHEN 'ActiveJob::QueueAdapters::QueAdapter::JobWrapper' THEN
          coalesce(
            row.args->0->>'job_class',
            'ActiveJob::QueueAdapters::QueAdapter::JobWrapper'
          )
        ELSE
          row.job_class
        END AS job_class,

        previous_state AS previous_state,
        current_state  AS current_state
    ) t;

    PERFORM pg_notify('que_state', message::text);

    RETURN null;
  END
$$;


--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    item_type character varying NOT NULL,
    item_id uuid NOT NULL,
    action character varying NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    user_id uuid,
    acted_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: admin_publications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_publications (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    parent_id uuid,
    lft integer NOT NULL,
    rgt integer NOT NULL,
    ordering integer,
    publication_status character varying DEFAULT 'published'::character varying NOT NULL,
    publication_id uuid,
    publication_type character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    depth integer DEFAULT 0 NOT NULL,
    children_allowed boolean DEFAULT true NOT NULL,
    children_count integer DEFAULT 0 NOT NULL
);


--
-- Name: app_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_configurations (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying,
    host character varying,
    logo character varying,
    header_bg character varying,
    favicon character varying,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    style jsonb DEFAULT '{}'::jsonb,
    homepage_info_multiloc jsonb
);


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    ordering integer
);


--
-- Name: areas_ideas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas_ideas (
    area_id uuid,
    idea_id uuid,
    id uuid DEFAULT shared_extensions.uuid_generate_v4() NOT NULL
);


--
-- Name: areas_initiatives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas_initiatives (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    area_id uuid,
    initiative_id uuid
);


--
-- Name: areas_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas_projects (
    area_id uuid,
    project_id uuid,
    id uuid DEFAULT shared_extensions.uuid_generate_v4() NOT NULL
);


--
-- Name: baskets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.baskets (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    submitted_at timestamp without time zone,
    user_id uuid,
    participation_context_id uuid,
    participation_context_type character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: baskets_ideas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.baskets_ideas (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    basket_id uuid,
    idea_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    author_id uuid,
    post_id uuid,
    parent_id uuid,
    lft integer NOT NULL,
    rgt integer NOT NULL,
    body_multiloc jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    upvotes_count integer DEFAULT 0 NOT NULL,
    downvotes_count integer DEFAULT 0 NOT NULL,
    publication_status character varying DEFAULT 'published'::character varying NOT NULL,
    body_updated_at timestamp without time zone,
    children_count integer DEFAULT 0 NOT NULL,
    post_type character varying
);


--
-- Name: common_passwords; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.common_passwords (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    password character varying
);


--
-- Name: content_builder_layout_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_builder_layout_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    image character varying,
    code character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: content_builder_layouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_builder_layouts (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    craftjs_jsonmultiloc jsonb DEFAULT '{}'::jsonb,
    content_buildable_type character varying NOT NULL,
    content_buildable_id uuid NOT NULL,
    code character varying NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: custom_field_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_field_options (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    custom_field_id uuid,
    key character varying,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: custom_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_fields (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    resource_type character varying,
    key character varying,
    input_type character varying,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    required boolean DEFAULT false,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    code character varying,
    resource_id uuid,
    hidden boolean DEFAULT false NOT NULL
);


--
-- Name: custom_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_forms (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: email_campaigns_campaign_email_commands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_campaign_email_commands (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    campaign character varying,
    recipient_id uuid,
    commanded_at timestamp without time zone,
    tracked_content jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: email_campaigns_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_campaigns (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    type character varying NOT NULL,
    author_id uuid,
    enabled boolean,
    sender character varying,
    reply_to character varying,
    schedule jsonb DEFAULT '{}'::jsonb,
    subject_multiloc jsonb DEFAULT '{}'::jsonb,
    body_multiloc jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deliveries_count integer DEFAULT 0 NOT NULL
);


--
-- Name: email_campaigns_campaigns_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_campaigns_groups (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    campaign_id uuid,
    group_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: email_campaigns_consents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_consents (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    campaign_type character varying NOT NULL,
    user_id uuid NOT NULL,
    consented boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: email_campaigns_deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_deliveries (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    user_id uuid NOT NULL,
    delivery_status character varying NOT NULL,
    tracked_content jsonb DEFAULT '{}'::jsonb,
    sent_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: email_campaigns_unsubscription_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns_unsubscription_tokens (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    token character varying NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: email_snippets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_snippets (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    email character varying,
    snippet character varying,
    locale character varying,
    body text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: event_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    event_id uuid,
    file character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    location_multiloc jsonb DEFAULT '{}'::json,
    start_at timestamp without time zone,
    end_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: flag_inappropriate_content_inappropriate_content_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flag_inappropriate_content_inappropriate_content_flags (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    flaggable_id uuid NOT NULL,
    flaggable_type character varying NOT NULL,
    deleted_at timestamp without time zone,
    toxicity_label character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    slug character varying,
    memberships_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    membership_type character varying,
    rules jsonb DEFAULT '[]'::jsonb
);


--
-- Name: groups_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups_permissions (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    permission_id uuid NOT NULL,
    group_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: groups_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups_projects (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    group_id uuid,
    project_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: id_id_card_lookup_id_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.id_id_card_lookup_id_cards (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    hashed_card_id character varying
);


--
-- Name: idea_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idea_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    idea_id uuid,
    file character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying
);


--
-- Name: idea_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idea_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    idea_id uuid,
    image character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: idea_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idea_statuses (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    ordering integer,
    code character varying,
    color character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    ideas_count integer DEFAULT 0
);


--
-- Name: ideas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ideas (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    body_multiloc jsonb DEFAULT '{}'::jsonb,
    publication_status character varying,
    published_at timestamp without time zone,
    project_id uuid,
    author_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    upvotes_count integer DEFAULT 0 NOT NULL,
    downvotes_count integer DEFAULT 0 NOT NULL,
    location_point shared_extensions.geography(Point,4326),
    location_description character varying,
    comments_count integer DEFAULT 0 NOT NULL,
    idea_status_id uuid,
    slug character varying,
    budget integer,
    baskets_count integer DEFAULT 0 NOT NULL,
    official_feedbacks_count integer DEFAULT 0 NOT NULL,
    assignee_id uuid,
    assigned_at timestamp without time zone,
    proposed_budget integer
);


--
-- Name: votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.votes (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    votable_id uuid,
    votable_type character varying,
    user_id uuid,
    mode character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: idea_trending_infos; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.idea_trending_infos AS
 SELECT ideas.id AS idea_id,
    GREATEST(comments_at.last_comment_at, upvotes_at.last_upvoted_at, ideas.published_at) AS last_activity_at,
    to_timestamp(round((((GREATEST(((comments_at.comments_count)::double precision * comments_at.mean_comment_at), (0)::double precision) + GREATEST(((upvotes_at.upvotes_count)::double precision * upvotes_at.mean_upvoted_at), (0)::double precision)) + date_part('epoch'::text, ideas.published_at)) / (((GREATEST((comments_at.comments_count)::numeric, 0.0) + GREATEST((upvotes_at.upvotes_count)::numeric, 0.0)) + 1.0))::double precision))) AS mean_activity_at
   FROM ((public.ideas
     FULL JOIN ( SELECT comments.post_id AS idea_id,
            max(comments.created_at) AS last_comment_at,
            avg(date_part('epoch'::text, comments.created_at)) AS mean_comment_at,
            count(comments.post_id) AS comments_count
           FROM public.comments
          GROUP BY comments.post_id) comments_at ON ((ideas.id = comments_at.idea_id)))
     FULL JOIN ( SELECT votes.votable_id,
            max(votes.created_at) AS last_upvoted_at,
            avg(date_part('epoch'::text, votes.created_at)) AS mean_upvoted_at,
            count(votes.votable_id) AS upvotes_count
           FROM public.votes
          WHERE (((votes.mode)::text = 'up'::text) AND ((votes.votable_type)::text = 'Idea'::text))
          GROUP BY votes.votable_id) upvotes_at ON ((ideas.id = upvotes_at.votable_id)));


--
-- Name: ideas_phases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ideas_phases (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    idea_id uuid,
    phase_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: ideas_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ideas_topics (
    idea_id uuid,
    topic_id uuid,
    id uuid DEFAULT shared_extensions.uuid_generate_v4() NOT NULL
);


--
-- Name: identities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.identities (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    provider character varying,
    uid character varying,
    auth_hash jsonb DEFAULT '{}'::jsonb,
    user_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: initiative_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.initiative_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    initiative_id uuid,
    file character varying,
    name character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: initiative_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.initiative_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    initiative_id uuid,
    image character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: initiative_status_changes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.initiative_status_changes (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    user_id uuid,
    initiative_id uuid,
    initiative_status_id uuid,
    official_feedback_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: initiative_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.initiative_statuses (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    ordering integer,
    code character varying,
    color character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: initiatives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.initiatives (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    body_multiloc jsonb DEFAULT '{}'::jsonb,
    publication_status character varying,
    published_at timestamp without time zone,
    author_id uuid,
    upvotes_count integer DEFAULT 0 NOT NULL,
    downvotes_count integer DEFAULT 0 NOT NULL,
    location_point shared_extensions.geography(Point,4326),
    location_description character varying,
    slug character varying,
    comments_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    header_bg character varying,
    assignee_id uuid,
    official_feedbacks_count integer DEFAULT 0 NOT NULL,
    assigned_at timestamp without time zone
);


--
-- Name: initiative_initiative_statuses; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.initiative_initiative_statuses AS
 SELECT initiative_status_changes.initiative_id,
    initiative_status_changes.initiative_status_id
   FROM (((public.initiatives
     JOIN ( SELECT initiative_status_changes_1.initiative_id,
            max(initiative_status_changes_1.created_at) AS last_status_changed_at
           FROM public.initiative_status_changes initiative_status_changes_1
          GROUP BY initiative_status_changes_1.initiative_id) initiatives_with_last_status_change ON ((initiatives.id = initiatives_with_last_status_change.initiative_id)))
     JOIN public.initiative_status_changes ON (((initiatives.id = initiative_status_changes.initiative_id) AND (initiatives_with_last_status_change.last_status_changed_at = initiative_status_changes.created_at))))
     JOIN public.initiative_statuses ON ((initiative_statuses.id = initiative_status_changes.initiative_status_id)));


--
-- Name: initiatives_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.initiatives_topics (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    initiative_id uuid,
    topic_id uuid
);


--
-- Name: insights_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insights_categories (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    view_id uuid NOT NULL,
    "position" integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    inputs_count integer DEFAULT 0 NOT NULL,
    source_type character varying,
    source_id uuid
);


--
-- Name: insights_category_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insights_category_assignments (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    input_type character varying NOT NULL,
    input_id uuid NOT NULL,
    approved boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: insights_data_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insights_data_sources (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    view_id uuid NOT NULL,
    origin_type character varying NOT NULL,
    origin_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: insights_processed_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insights_processed_flags (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    input_type character varying NOT NULL,
    input_id uuid NOT NULL,
    view_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: insights_text_network_analysis_tasks_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insights_text_network_analysis_tasks_views (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    view_id uuid NOT NULL,
    language character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: insights_text_networks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insights_text_networks (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    view_id uuid NOT NULL,
    language character varying NOT NULL,
    json_network jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: insights_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insights_views (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: insights_zeroshot_classification_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insights_zeroshot_classification_tasks (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    task_id character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: insights_zeroshot_classification_tasks_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insights_zeroshot_classification_tasks_categories (
    category_id uuid NOT NULL,
    task_id uuid NOT NULL
);


--
-- Name: insights_zeroshot_classification_tasks_inputs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insights_zeroshot_classification_tasks_inputs (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    input_type character varying NOT NULL,
    input_id uuid NOT NULL
);


--
-- Name: invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invites (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    token character varying NOT NULL,
    inviter_id uuid,
    invitee_id uuid NOT NULL,
    invite_text character varying,
    accepted_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    send_invite_email boolean DEFAULT true NOT NULL
);


--
-- Name: machine_translations_machine_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.machine_translations_machine_translations (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    translatable_id uuid NOT NULL,
    translatable_type character varying NOT NULL,
    attribute_name character varying NOT NULL,
    locale_to character varying NOT NULL,
    translation character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: maps_layers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maps_layers (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    map_config_id uuid NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    ordering integer NOT NULL,
    geojson jsonb NOT NULL,
    default_enabled boolean DEFAULT true NOT NULL,
    marker_svg_url character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: maps_legend_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maps_legend_items (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    map_config_id uuid NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    color character varying NOT NULL,
    ordering integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: maps_map_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maps_map_configs (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    center shared_extensions.geography(Point,4326),
    zoom_level numeric(4,2),
    tile_provider character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberships (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    group_id uuid,
    user_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: moderation_moderation_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moderation_moderation_statuses (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    moderatable_id uuid,
    moderatable_type character varying,
    status character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    slug character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    header_bg character varying,
    ideas_count integer DEFAULT 0 NOT NULL,
    visible_to character varying DEFAULT 'public'::character varying NOT NULL,
    description_preview_multiloc jsonb DEFAULT '{}'::jsonb,
    presentation_mode character varying DEFAULT 'card'::character varying,
    participation_method character varying DEFAULT 'ideation'::character varying,
    posting_enabled boolean DEFAULT true,
    commenting_enabled boolean DEFAULT true,
    voting_enabled boolean DEFAULT true NOT NULL,
    upvoting_method character varying DEFAULT 'unlimited'::character varying NOT NULL,
    upvoting_limited_max integer DEFAULT 10,
    process_type character varying DEFAULT 'timeline'::character varying NOT NULL,
    internal_role character varying,
    survey_embed_url character varying,
    survey_service character varying,
    max_budget integer,
    comments_count integer DEFAULT 0 NOT NULL,
    default_assignee_id uuid,
    poll_anonymous boolean DEFAULT false NOT NULL,
    custom_form_id uuid,
    downvoting_enabled boolean DEFAULT true NOT NULL,
    ideas_order character varying,
    input_term character varying DEFAULT 'idea'::character varying,
    min_budget integer DEFAULT 0,
    downvoting_method character varying DEFAULT 'unlimited'::character varying NOT NULL,
    downvoting_limited_max integer DEFAULT 10
);


--
-- Name: moderation_moderations; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.moderation_moderations AS
 SELECT ideas.id,
    'Idea'::text AS moderatable_type,
    NULL::text AS post_type,
    NULL::uuid AS post_id,
    NULL::text AS post_slug,
    NULL::jsonb AS post_title_multiloc,
    projects.id AS project_id,
    projects.slug AS project_slug,
    projects.title_multiloc AS project_title_multiloc,
    ideas.title_multiloc AS content_title_multiloc,
    ideas.body_multiloc AS content_body_multiloc,
    ideas.slug AS content_slug,
    ideas.published_at AS created_at,
    moderation_moderation_statuses.status AS moderation_status
   FROM ((public.ideas
     LEFT JOIN public.moderation_moderation_statuses ON ((moderation_moderation_statuses.moderatable_id = ideas.id)))
     LEFT JOIN public.projects ON ((projects.id = ideas.project_id)))
UNION ALL
 SELECT initiatives.id,
    'Initiative'::text AS moderatable_type,
    NULL::text AS post_type,
    NULL::uuid AS post_id,
    NULL::text AS post_slug,
    NULL::jsonb AS post_title_multiloc,
    NULL::uuid AS project_id,
    NULL::character varying AS project_slug,
    NULL::jsonb AS project_title_multiloc,
    initiatives.title_multiloc AS content_title_multiloc,
    initiatives.body_multiloc AS content_body_multiloc,
    initiatives.slug AS content_slug,
    initiatives.published_at AS created_at,
    moderation_moderation_statuses.status AS moderation_status
   FROM (public.initiatives
     LEFT JOIN public.moderation_moderation_statuses ON ((moderation_moderation_statuses.moderatable_id = initiatives.id)))
UNION ALL
 SELECT comments.id,
    'Comment'::text AS moderatable_type,
    'Idea'::text AS post_type,
    ideas.id AS post_id,
    ideas.slug AS post_slug,
    ideas.title_multiloc AS post_title_multiloc,
    projects.id AS project_id,
    projects.slug AS project_slug,
    projects.title_multiloc AS project_title_multiloc,
    NULL::jsonb AS content_title_multiloc,
    comments.body_multiloc AS content_body_multiloc,
    NULL::character varying AS content_slug,
    comments.created_at,
    moderation_moderation_statuses.status AS moderation_status
   FROM (((public.comments
     LEFT JOIN public.moderation_moderation_statuses ON ((moderation_moderation_statuses.moderatable_id = comments.id)))
     LEFT JOIN public.ideas ON ((ideas.id = comments.post_id)))
     LEFT JOIN public.projects ON ((projects.id = ideas.project_id)))
  WHERE ((comments.post_type)::text = 'Idea'::text)
UNION ALL
 SELECT comments.id,
    'Comment'::text AS moderatable_type,
    'Initiative'::text AS post_type,
    initiatives.id AS post_id,
    initiatives.slug AS post_slug,
    initiatives.title_multiloc AS post_title_multiloc,
    NULL::uuid AS project_id,
    NULL::character varying AS project_slug,
    NULL::jsonb AS project_title_multiloc,
    NULL::jsonb AS content_title_multiloc,
    comments.body_multiloc AS content_body_multiloc,
    NULL::character varying AS content_slug,
    comments.created_at,
    moderation_moderation_statuses.status AS moderation_status
   FROM ((public.comments
     LEFT JOIN public.moderation_moderation_statuses ON ((moderation_moderation_statuses.moderatable_id = comments.id)))
     LEFT JOIN public.initiatives ON ((initiatives.id = comments.post_id)))
  WHERE ((comments.post_type)::text = 'Initiative'::text);


--
-- Name: nav_bar_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nav_bar_items (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    code character varying NOT NULL,
    ordering integer,
    title_multiloc jsonb,
    static_page_id uuid,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: nlp_text_network_analysis_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nlp_text_network_analysis_tasks (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    task_id character varying NOT NULL,
    handler_class character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    type character varying,
    read_at timestamp without time zone,
    recipient_id uuid,
    post_id uuid,
    comment_id uuid,
    project_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    initiating_user_id uuid,
    spam_report_id uuid,
    invite_id uuid,
    reason_code character varying,
    other_reason character varying,
    post_status_id uuid,
    official_feedback_id uuid,
    phase_id uuid,
    post_type character varying,
    post_status_type character varying,
    project_folder_id uuid,
    inappropriate_content_flag_id uuid
);


--
-- Name: official_feedbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.official_feedbacks (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    body_multiloc jsonb DEFAULT '{}'::jsonb,
    author_multiloc jsonb DEFAULT '{}'::jsonb,
    user_id uuid,
    post_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    post_type character varying
);


--
-- Name: onboarding_campaign_dismissals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_campaign_dismissals (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    user_id uuid,
    campaign_name character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    action character varying NOT NULL,
    permitted_by character varying NOT NULL,
    permission_scope_id uuid,
    permission_scope_type character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: phase_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phase_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    phase_id uuid,
    file character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying
);


--
-- Name: phases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phases (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    start_at date,
    end_at date,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    participation_method character varying DEFAULT 'ideation'::character varying NOT NULL,
    posting_enabled boolean DEFAULT true,
    commenting_enabled boolean DEFAULT true,
    voting_enabled boolean DEFAULT true NOT NULL,
    upvoting_method character varying DEFAULT 'unlimited'::character varying NOT NULL,
    upvoting_limited_max integer DEFAULT 10,
    survey_embed_url character varying,
    survey_service character varying,
    presentation_mode character varying DEFAULT 'card'::character varying,
    max_budget integer,
    poll_anonymous boolean DEFAULT false NOT NULL,
    downvoting_enabled boolean DEFAULT true NOT NULL,
    ideas_count integer DEFAULT 0 NOT NULL,
    ideas_order character varying,
    input_term character varying DEFAULT 'idea'::character varying,
    min_budget integer DEFAULT 0,
    downvoting_method character varying DEFAULT 'unlimited'::character varying NOT NULL,
    downvoting_limited_max integer DEFAULT 10
);


--
-- Name: polls_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.polls_options (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    question_id uuid,
    title_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: polls_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.polls_questions (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    participation_context_id uuid NOT NULL,
    participation_context_type character varying NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    question_type character varying DEFAULT 'single_option'::character varying NOT NULL,
    max_options integer
);


--
-- Name: polls_response_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.polls_response_options (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    response_id uuid,
    option_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: polls_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.polls_responses (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    participation_context_id uuid NOT NULL,
    participation_context_type character varying NOT NULL,
    user_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: project_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid,
    file character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying
);


--
-- Name: project_folders_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_folders_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_folder_id uuid,
    file character varying,
    name character varying,
    ordering integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: project_folders_folders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_folders_folders (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb,
    description_multiloc jsonb,
    description_preview_multiloc jsonb,
    header_bg character varying,
    slug character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: project_folders_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_folders_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_folder_id uuid,
    image character varying,
    ordering integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: project_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    project_id uuid,
    image character varying,
    ordering integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: projects_allowed_input_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects_allowed_input_topics (
    project_id uuid,
    topic_id uuid,
    id uuid DEFAULT shared_extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    ordering integer
);


--
-- Name: projects_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects_topics (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    topic_id uuid NOT NULL,
    project_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: public_api_api_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_api_api_clients (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying,
    secret character varying,
    tenant_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: que_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.que_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: que_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.que_jobs_id_seq OWNED BY public.que_jobs.id;


--
-- Name: que_lockers; Type: TABLE; Schema: public; Owner: -
--

CREATE UNLOGGED TABLE public.que_lockers (
    pid integer NOT NULL,
    worker_count integer NOT NULL,
    worker_priorities integer[] NOT NULL,
    ruby_pid integer NOT NULL,
    ruby_hostname text NOT NULL,
    queues text[] NOT NULL,
    listening boolean NOT NULL,
    CONSTRAINT valid_queues CHECK (((array_ndims(queues) = 1) AND (array_length(queues, 1) IS NOT NULL))),
    CONSTRAINT valid_worker_priorities CHECK (((array_ndims(worker_priorities) = 1) AND (array_length(worker_priorities, 1) IS NOT NULL)))
);


--
-- Name: que_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.que_values (
    key text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT valid_value CHECK ((jsonb_typeof(value) = 'object'::text))
)
WITH (fillfactor='90');


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: spam_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spam_reports (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    spam_reportable_id uuid NOT NULL,
    spam_reportable_type character varying NOT NULL,
    reported_at timestamp without time zone NOT NULL,
    reason_code character varying,
    other_reason character varying,
    user_id uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: static_page_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.static_page_files (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    static_page_id uuid,
    file character varying,
    ordering integer,
    name character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: static_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.static_pages (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    body_multiloc jsonb DEFAULT '{}'::jsonb,
    slug character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    code character varying NOT NULL
);


--
-- Name: surveys_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.surveys_responses (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    participation_context_id uuid NOT NULL,
    participation_context_type character varying NOT NULL,
    survey_service character varying NOT NULL,
    external_survey_id character varying NOT NULL,
    external_response_id character varying NOT NULL,
    user_id uuid,
    started_at timestamp without time zone,
    submitted_at timestamp without time zone NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    name character varying,
    host character varying,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    logo character varying,
    header_bg character varying,
    favicon character varying,
    style jsonb DEFAULT '{}'::jsonb,
    deleted_at timestamp without time zone,
    creation_finalized_at timestamp without time zone
);


--
-- Name: text_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.text_images (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    imageable_type character varying NOT NULL,
    imageable_id uuid NOT NULL,
    imageable_field character varying,
    image character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    text_reference character varying NOT NULL
);


--
-- Name: texting_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.texting_campaigns (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    phone_numbers character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    message text NOT NULL,
    sent_at timestamp without time zone,
    status character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb,
    description_multiloc jsonb DEFAULT '{}'::jsonb,
    icon character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    ordering integer,
    code character varying DEFAULT 'custom'::character varying NOT NULL
);


--
-- Name: union_posts; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.union_posts AS
 SELECT ideas.id,
    ideas.title_multiloc,
    ideas.body_multiloc,
    ideas.publication_status,
    ideas.published_at,
    ideas.author_id,
    ideas.created_at,
    ideas.updated_at,
    ideas.upvotes_count,
    ideas.location_point,
    ideas.location_description,
    ideas.comments_count,
    ideas.slug,
    ideas.official_feedbacks_count
   FROM public.ideas
UNION ALL
 SELECT initiatives.id,
    initiatives.title_multiloc,
    initiatives.body_multiloc,
    initiatives.publication_status,
    initiatives.published_at,
    initiatives.author_id,
    initiatives.created_at,
    initiatives.updated_at,
    initiatives.upvotes_count,
    initiatives.location_point,
    initiatives.location_description,
    initiatives.comments_count,
    initiatives.slug,
    initiatives.official_feedbacks_count
   FROM public.initiatives;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    email character varying,
    password_digest character varying,
    slug character varying,
    roles jsonb DEFAULT '[]'::jsonb,
    reset_password_token character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    avatar character varying,
    first_name character varying,
    last_name character varying,
    locale character varying,
    bio_multiloc jsonb DEFAULT '{}'::jsonb,
    cl1_migrated boolean DEFAULT false,
    invite_status character varying,
    custom_field_values jsonb DEFAULT '{}'::jsonb,
    registration_completed_at timestamp without time zone,
    verified boolean DEFAULT false NOT NULL,
    email_confirmed_at timestamp without time zone,
    email_confirmation_code character varying,
    email_confirmation_retry_count integer DEFAULT 0 NOT NULL,
    email_confirmation_code_reset_count integer DEFAULT 0 NOT NULL,
    email_confirmation_code_sent_at timestamp without time zone,
    confirmation_required boolean DEFAULT true NOT NULL
);


--
-- Name: verification_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_verifications (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    user_id uuid,
    method_name character varying NOT NULL,
    hashed_uid character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: volunteering_causes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteering_causes (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    participation_context_id uuid NOT NULL,
    participation_context_type character varying NOT NULL,
    title_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    description_multiloc jsonb DEFAULT '{}'::jsonb NOT NULL,
    volunteers_count integer DEFAULT 0 NOT NULL,
    image character varying,
    ordering integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: volunteering_volunteers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteering_volunteers (
    id uuid DEFAULT shared_extensions.gen_random_uuid() NOT NULL,
    cause_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: que_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.que_jobs ALTER COLUMN id SET DEFAULT nextval('public.que_jobs_id_seq'::regclass);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: admin_publications admin_publications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_publications
    ADD CONSTRAINT admin_publications_pkey PRIMARY KEY (id);


--
-- Name: app_configurations app_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_configurations
    ADD CONSTRAINT app_configurations_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: areas_ideas areas_ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_ideas
    ADD CONSTRAINT areas_ideas_pkey PRIMARY KEY (id);


--
-- Name: areas_initiatives areas_initiatives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_initiatives
    ADD CONSTRAINT areas_initiatives_pkey PRIMARY KEY (id);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: areas_projects areas_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_projects
    ADD CONSTRAINT areas_projects_pkey PRIMARY KEY (id);


--
-- Name: baskets_ideas baskets_ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets_ideas
    ADD CONSTRAINT baskets_ideas_pkey PRIMARY KEY (id);


--
-- Name: baskets baskets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets
    ADD CONSTRAINT baskets_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: common_passwords common_passwords_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.common_passwords
    ADD CONSTRAINT common_passwords_pkey PRIMARY KEY (id);


--
-- Name: content_builder_layout_images content_builder_layout_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_builder_layout_images
    ADD CONSTRAINT content_builder_layout_images_pkey PRIMARY KEY (id);


--
-- Name: content_builder_layouts content_builder_layouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_builder_layouts
    ADD CONSTRAINT content_builder_layouts_pkey PRIMARY KEY (id);


--
-- Name: custom_field_options custom_field_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_options
    ADD CONSTRAINT custom_field_options_pkey PRIMARY KEY (id);


--
-- Name: custom_fields custom_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_fields
    ADD CONSTRAINT custom_fields_pkey PRIMARY KEY (id);


--
-- Name: custom_forms custom_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_forms
    ADD CONSTRAINT custom_forms_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_campaign_email_commands email_campaigns_campaign_email_commands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaign_email_commands
    ADD CONSTRAINT email_campaigns_campaign_email_commands_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_campaigns_groups email_campaigns_campaigns_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaigns_groups
    ADD CONSTRAINT email_campaigns_campaigns_groups_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_campaigns email_campaigns_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaigns
    ADD CONSTRAINT email_campaigns_campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_consents email_campaigns_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_consents
    ADD CONSTRAINT email_campaigns_consents_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_deliveries email_campaigns_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_deliveries
    ADD CONSTRAINT email_campaigns_deliveries_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns_unsubscription_tokens email_campaigns_unsubscription_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_unsubscription_tokens
    ADD CONSTRAINT email_campaigns_unsubscription_tokens_pkey PRIMARY KEY (id);


--
-- Name: email_snippets email_snippets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_snippets
    ADD CONSTRAINT email_snippets_pkey PRIMARY KEY (id);


--
-- Name: event_files event_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_files
    ADD CONSTRAINT event_files_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: flag_inappropriate_content_inappropriate_content_flags flag_inappropriate_content_inappropriate_content_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flag_inappropriate_content_inappropriate_content_flags
    ADD CONSTRAINT flag_inappropriate_content_inappropriate_content_flags_pkey PRIMARY KEY (id);


--
-- Name: groups_permissions groups_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_permissions
    ADD CONSTRAINT groups_permissions_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: groups_projects groups_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_projects
    ADD CONSTRAINT groups_projects_pkey PRIMARY KEY (id);


--
-- Name: idea_files idea_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_files
    ADD CONSTRAINT idea_files_pkey PRIMARY KEY (id);


--
-- Name: idea_images idea_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_images
    ADD CONSTRAINT idea_images_pkey PRIMARY KEY (id);


--
-- Name: idea_statuses idea_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_statuses
    ADD CONSTRAINT idea_statuses_pkey PRIMARY KEY (id);


--
-- Name: ideas_phases ideas_phases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_phases
    ADD CONSTRAINT ideas_phases_pkey PRIMARY KEY (id);


--
-- Name: ideas ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT ideas_pkey PRIMARY KEY (id);


--
-- Name: ideas_topics ideas_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_topics
    ADD CONSTRAINT ideas_topics_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: initiative_files initiative_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiative_files
    ADD CONSTRAINT initiative_files_pkey PRIMARY KEY (id);


--
-- Name: initiative_images initiative_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiative_images
    ADD CONSTRAINT initiative_images_pkey PRIMARY KEY (id);


--
-- Name: initiative_status_changes initiative_status_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiative_status_changes
    ADD CONSTRAINT initiative_status_changes_pkey PRIMARY KEY (id);


--
-- Name: initiative_statuses initiative_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiative_statuses
    ADD CONSTRAINT initiative_statuses_pkey PRIMARY KEY (id);


--
-- Name: initiatives initiatives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiatives
    ADD CONSTRAINT initiatives_pkey PRIMARY KEY (id);


--
-- Name: initiatives_topics initiatives_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiatives_topics
    ADD CONSTRAINT initiatives_topics_pkey PRIMARY KEY (id);


--
-- Name: insights_categories insights_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_categories
    ADD CONSTRAINT insights_categories_pkey PRIMARY KEY (id);


--
-- Name: insights_category_assignments insights_category_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_category_assignments
    ADD CONSTRAINT insights_category_assignments_pkey PRIMARY KEY (id);


--
-- Name: insights_data_sources insights_data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_data_sources
    ADD CONSTRAINT insights_data_sources_pkey PRIMARY KEY (id);


--
-- Name: insights_processed_flags insights_processed_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_processed_flags
    ADD CONSTRAINT insights_processed_flags_pkey PRIMARY KEY (id);


--
-- Name: insights_text_network_analysis_tasks_views insights_text_network_analysis_tasks_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_text_network_analysis_tasks_views
    ADD CONSTRAINT insights_text_network_analysis_tasks_views_pkey PRIMARY KEY (id);


--
-- Name: insights_text_networks insights_text_networks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_text_networks
    ADD CONSTRAINT insights_text_networks_pkey PRIMARY KEY (id);


--
-- Name: insights_views insights_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_views
    ADD CONSTRAINT insights_views_pkey PRIMARY KEY (id);


--
-- Name: insights_zeroshot_classification_tasks_inputs insights_zeroshot_classification_tasks_inputs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_zeroshot_classification_tasks_inputs
    ADD CONSTRAINT insights_zeroshot_classification_tasks_inputs_pkey PRIMARY KEY (id);


--
-- Name: insights_zeroshot_classification_tasks insights_zeroshot_classification_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_zeroshot_classification_tasks
    ADD CONSTRAINT insights_zeroshot_classification_tasks_pkey PRIMARY KEY (id);


--
-- Name: invites invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_pkey PRIMARY KEY (id);


--
-- Name: machine_translations_machine_translations machine_translations_machine_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machine_translations_machine_translations
    ADD CONSTRAINT machine_translations_machine_translations_pkey PRIMARY KEY (id);


--
-- Name: maps_layers maps_layers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps_layers
    ADD CONSTRAINT maps_layers_pkey PRIMARY KEY (id);


--
-- Name: maps_legend_items maps_legend_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps_legend_items
    ADD CONSTRAINT maps_legend_items_pkey PRIMARY KEY (id);


--
-- Name: maps_map_configs maps_map_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps_map_configs
    ADD CONSTRAINT maps_map_configs_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: moderation_moderation_statuses moderation_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moderation_moderation_statuses
    ADD CONSTRAINT moderation_statuses_pkey PRIMARY KEY (id);


--
-- Name: nav_bar_items nav_bar_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nav_bar_items
    ADD CONSTRAINT nav_bar_items_pkey PRIMARY KEY (id);


--
-- Name: nlp_text_network_analysis_tasks nlp_text_network_analysis_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nlp_text_network_analysis_tasks
    ADD CONSTRAINT nlp_text_network_analysis_tasks_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: official_feedbacks official_feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_feedbacks
    ADD CONSTRAINT official_feedbacks_pkey PRIMARY KEY (id);


--
-- Name: onboarding_campaign_dismissals onboarding_campaign_dismissals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_campaign_dismissals
    ADD CONSTRAINT onboarding_campaign_dismissals_pkey PRIMARY KEY (id);


--
-- Name: static_page_files page_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_page_files
    ADD CONSTRAINT page_files_pkey PRIMARY KEY (id);


--
-- Name: static_pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: phase_files phase_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phase_files
    ADD CONSTRAINT phase_files_pkey PRIMARY KEY (id);


--
-- Name: phases phases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT phases_pkey PRIMARY KEY (id);


--
-- Name: polls_options polls_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_options
    ADD CONSTRAINT polls_options_pkey PRIMARY KEY (id);


--
-- Name: polls_questions polls_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_questions
    ADD CONSTRAINT polls_questions_pkey PRIMARY KEY (id);


--
-- Name: polls_response_options polls_response_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_response_options
    ADD CONSTRAINT polls_response_options_pkey PRIMARY KEY (id);


--
-- Name: polls_responses polls_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_responses
    ADD CONSTRAINT polls_responses_pkey PRIMARY KEY (id);


--
-- Name: project_files project_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_pkey PRIMARY KEY (id);


--
-- Name: project_folders_files project_folder_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_folders_files
    ADD CONSTRAINT project_folder_files_pkey PRIMARY KEY (id);


--
-- Name: project_folders_images project_folder_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_folders_images
    ADD CONSTRAINT project_folder_images_pkey PRIMARY KEY (id);


--
-- Name: project_folders_folders project_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_folders_folders
    ADD CONSTRAINT project_folders_pkey PRIMARY KEY (id);


--
-- Name: project_images project_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_images
    ADD CONSTRAINT project_images_pkey PRIMARY KEY (id);


--
-- Name: projects_allowed_input_topics projects_allowed_input_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_allowed_input_topics
    ADD CONSTRAINT projects_allowed_input_topics_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: projects_topics projects_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_topics
    ADD CONSTRAINT projects_topics_pkey PRIMARY KEY (id);


--
-- Name: public_api_api_clients public_api_api_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_api_api_clients
    ADD CONSTRAINT public_api_api_clients_pkey PRIMARY KEY (id);


--
-- Name: que_jobs que_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.que_jobs
    ADD CONSTRAINT que_jobs_pkey PRIMARY KEY (id);


--
-- Name: que_lockers que_lockers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.que_lockers
    ADD CONSTRAINT que_lockers_pkey PRIMARY KEY (pid);


--
-- Name: que_values que_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.que_values
    ADD CONSTRAINT que_values_pkey PRIMARY KEY (key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: spam_reports spam_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spam_reports
    ADD CONSTRAINT spam_reports_pkey PRIMARY KEY (id);


--
-- Name: surveys_responses surveys_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.surveys_responses
    ADD CONSTRAINT surveys_responses_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: text_images text_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_images
    ADD CONSTRAINT text_images_pkey PRIMARY KEY (id);


--
-- Name: texting_campaigns texting_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.texting_campaigns
    ADD CONSTRAINT texting_campaigns_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: id_id_card_lookup_id_cards verification_id_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.id_id_card_lookup_id_cards
    ADD CONSTRAINT verification_id_cards_pkey PRIMARY KEY (id);


--
-- Name: verification_verifications verification_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_verifications
    ADD CONSTRAINT verification_verifications_pkey PRIMARY KEY (id);


--
-- Name: volunteering_causes volunteering_causes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteering_causes
    ADD CONSTRAINT volunteering_causes_pkey PRIMARY KEY (id);


--
-- Name: volunteering_volunteers volunteering_volunteers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteering_volunteers
    ADD CONSTRAINT volunteering_volunteers_pkey PRIMARY KEY (id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: inappropriate_content_flags_flaggable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inappropriate_content_flags_flaggable ON public.flag_inappropriate_content_inappropriate_content_flags USING btree (flaggable_id, flaggable_type);


--
-- Name: index_activities_on_acted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_activities_on_acted_at ON public.activities USING btree (acted_at);


--
-- Name: index_activities_on_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_activities_on_item ON public.activities USING btree (item_type, item_id);


--
-- Name: index_activities_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_activities_on_user_id ON public.activities USING btree (user_id);


--
-- Name: index_admin_publications_on_depth; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_depth ON public.admin_publications USING btree (depth);


--
-- Name: index_admin_publications_on_lft; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_lft ON public.admin_publications USING btree (lft);


--
-- Name: index_admin_publications_on_ordering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_ordering ON public.admin_publications USING btree (ordering);


--
-- Name: index_admin_publications_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_parent_id ON public.admin_publications USING btree (parent_id);


--
-- Name: index_admin_publications_on_rgt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_publications_on_rgt ON public.admin_publications USING btree (rgt);


--
-- Name: index_areas_ideas_on_area_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_ideas_on_area_id ON public.areas_ideas USING btree (area_id);


--
-- Name: index_areas_ideas_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_ideas_on_idea_id ON public.areas_ideas USING btree (idea_id);


--
-- Name: index_areas_ideas_on_idea_id_and_area_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_areas_ideas_on_idea_id_and_area_id ON public.areas_ideas USING btree (idea_id, area_id);


--
-- Name: index_areas_initiatives_on_area_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_initiatives_on_area_id ON public.areas_initiatives USING btree (area_id);


--
-- Name: index_areas_initiatives_on_initiative_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_initiatives_on_initiative_id ON public.areas_initiatives USING btree (initiative_id);


--
-- Name: index_areas_initiatives_on_initiative_id_and_area_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_areas_initiatives_on_initiative_id_and_area_id ON public.areas_initiatives USING btree (initiative_id, area_id);


--
-- Name: index_areas_projects_on_area_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_projects_on_area_id ON public.areas_projects USING btree (area_id);


--
-- Name: index_areas_projects_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_areas_projects_on_project_id ON public.areas_projects USING btree (project_id);


--
-- Name: index_baskets_ideas_on_basket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_baskets_ideas_on_basket_id ON public.baskets_ideas USING btree (basket_id);


--
-- Name: index_baskets_ideas_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_baskets_ideas_on_idea_id ON public.baskets_ideas USING btree (idea_id);


--
-- Name: index_baskets_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_baskets_on_user_id ON public.baskets USING btree (user_id);


--
-- Name: index_campaigns_groups; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_campaigns_groups ON public.email_campaigns_campaigns_groups USING btree (campaign_id, group_id);


--
-- Name: index_comments_on_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_author_id ON public.comments USING btree (author_id);


--
-- Name: index_comments_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_created_at ON public.comments USING btree (created_at);


--
-- Name: index_comments_on_lft; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_lft ON public.comments USING btree (lft);


--
-- Name: index_comments_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_parent_id ON public.comments USING btree (parent_id);


--
-- Name: index_comments_on_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_post_id ON public.comments USING btree (post_id);


--
-- Name: index_comments_on_post_id_and_post_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_post_id_and_post_type ON public.comments USING btree (post_id, post_type);


--
-- Name: index_comments_on_rgt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_rgt ON public.comments USING btree (rgt);


--
-- Name: index_common_passwords_on_password; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_common_passwords_on_password ON public.common_passwords USING btree (password);


--
-- Name: index_content_builder_layouts_content_buidable_type_id_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_content_builder_layouts_content_buidable_type_id_code ON public.content_builder_layouts USING btree (content_buildable_type, content_buildable_id, code);


--
-- Name: index_custom_field_options_on_custom_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_custom_field_options_on_custom_field_id ON public.custom_field_options USING btree (custom_field_id);


--
-- Name: index_custom_field_options_on_custom_field_id_and_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_custom_field_options_on_custom_field_id_and_key ON public.custom_field_options USING btree (custom_field_id, key);


--
-- Name: index_custom_fields_on_resource_type_and_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_custom_fields_on_resource_type_and_resource_id ON public.custom_fields USING btree (resource_type, resource_id);


--
-- Name: index_dismissals_on_campaign_name_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_dismissals_on_campaign_name_and_user_id ON public.onboarding_campaign_dismissals USING btree (campaign_name, user_id);


--
-- Name: index_email_campaigns_campaign_email_commands_on_recipient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaign_email_commands_on_recipient_id ON public.email_campaigns_campaign_email_commands USING btree (recipient_id);


--
-- Name: index_email_campaigns_campaigns_groups_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaigns_groups_on_campaign_id ON public.email_campaigns_campaigns_groups USING btree (campaign_id);


--
-- Name: index_email_campaigns_campaigns_groups_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaigns_groups_on_group_id ON public.email_campaigns_campaigns_groups USING btree (group_id);


--
-- Name: index_email_campaigns_campaigns_on_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaigns_on_author_id ON public.email_campaigns_campaigns USING btree (author_id);


--
-- Name: index_email_campaigns_campaigns_on_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_campaigns_on_type ON public.email_campaigns_campaigns USING btree (type);


--
-- Name: index_email_campaigns_consents_on_campaign_type_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_email_campaigns_consents_on_campaign_type_and_user_id ON public.email_campaigns_consents USING btree (campaign_type, user_id);


--
-- Name: index_email_campaigns_consents_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_consents_on_user_id ON public.email_campaigns_consents USING btree (user_id);


--
-- Name: index_email_campaigns_deliveries_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_deliveries_on_campaign_id ON public.email_campaigns_deliveries USING btree (campaign_id);


--
-- Name: index_email_campaigns_deliveries_on_campaign_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_deliveries_on_campaign_id_and_user_id ON public.email_campaigns_deliveries USING btree (campaign_id, user_id);


--
-- Name: index_email_campaigns_deliveries_on_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_deliveries_on_sent_at ON public.email_campaigns_deliveries USING btree (sent_at);


--
-- Name: index_email_campaigns_deliveries_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_deliveries_on_user_id ON public.email_campaigns_deliveries USING btree (user_id);


--
-- Name: index_email_campaigns_unsubscription_tokens_on_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_unsubscription_tokens_on_token ON public.email_campaigns_unsubscription_tokens USING btree (token);


--
-- Name: index_email_campaigns_unsubscription_tokens_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_campaigns_unsubscription_tokens_on_user_id ON public.email_campaigns_unsubscription_tokens USING btree (user_id);


--
-- Name: index_email_snippets_on_email_and_snippet_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_snippets_on_email_and_snippet_and_locale ON public.email_snippets USING btree (email, snippet, locale);


--
-- Name: index_event_files_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_event_files_on_event_id ON public.event_files USING btree (event_id);


--
-- Name: index_events_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_events_on_project_id ON public.events USING btree (project_id);


--
-- Name: index_groups_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_on_slug ON public.groups USING btree (slug);


--
-- Name: index_groups_permissions_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_permissions_on_group_id ON public.groups_permissions USING btree (group_id);


--
-- Name: index_groups_permissions_on_permission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_permissions_on_permission_id ON public.groups_permissions USING btree (permission_id);


--
-- Name: index_groups_projects_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_projects_on_group_id ON public.groups_projects USING btree (group_id);


--
-- Name: index_groups_projects_on_group_id_and_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_groups_projects_on_group_id_and_project_id ON public.groups_projects USING btree (group_id, project_id);


--
-- Name: index_groups_projects_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_projects_on_project_id ON public.groups_projects USING btree (project_id);


--
-- Name: index_id_id_card_lookup_id_cards_on_hashed_card_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_id_id_card_lookup_id_cards_on_hashed_card_id ON public.id_id_card_lookup_id_cards USING btree (hashed_card_id);


--
-- Name: index_idea_files_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idea_files_on_idea_id ON public.idea_files USING btree (idea_id);


--
-- Name: index_idea_images_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idea_images_on_idea_id ON public.idea_images USING btree (idea_id);


--
-- Name: index_ideas_on_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_author_id ON public.ideas USING btree (author_id);


--
-- Name: index_ideas_on_idea_status_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_idea_status_id ON public.ideas USING btree (idea_status_id);


--
-- Name: index_ideas_on_location_point; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_location_point ON public.ideas USING gist (location_point);


--
-- Name: index_ideas_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_on_project_id ON public.ideas USING btree (project_id);


--
-- Name: index_ideas_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_ideas_on_slug ON public.ideas USING btree (slug);


--
-- Name: index_ideas_phases_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_phases_on_idea_id ON public.ideas_phases USING btree (idea_id);


--
-- Name: index_ideas_phases_on_idea_id_and_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_ideas_phases_on_idea_id_and_phase_id ON public.ideas_phases USING btree (idea_id, phase_id);


--
-- Name: index_ideas_phases_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_phases_on_phase_id ON public.ideas_phases USING btree (phase_id);


--
-- Name: index_ideas_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_search ON public.ideas USING gin (((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text)))));


--
-- Name: index_ideas_topics_on_idea_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_topics_on_idea_id ON public.ideas_topics USING btree (idea_id);


--
-- Name: index_ideas_topics_on_idea_id_and_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_ideas_topics_on_idea_id_and_topic_id ON public.ideas_topics USING btree (idea_id, topic_id);


--
-- Name: index_ideas_topics_on_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ideas_topics_on_topic_id ON public.ideas_topics USING btree (topic_id);


--
-- Name: index_identities_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_identities_on_user_id ON public.identities USING btree (user_id);


--
-- Name: index_initiative_files_on_initiative_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiative_files_on_initiative_id ON public.initiative_files USING btree (initiative_id);


--
-- Name: index_initiative_images_on_initiative_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiative_images_on_initiative_id ON public.initiative_images USING btree (initiative_id);


--
-- Name: index_initiative_status_changes_on_initiative_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiative_status_changes_on_initiative_id ON public.initiative_status_changes USING btree (initiative_id);


--
-- Name: index_initiative_status_changes_on_initiative_status_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiative_status_changes_on_initiative_status_id ON public.initiative_status_changes USING btree (initiative_status_id);


--
-- Name: index_initiative_status_changes_on_official_feedback_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiative_status_changes_on_official_feedback_id ON public.initiative_status_changes USING btree (official_feedback_id);


--
-- Name: index_initiative_status_changes_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiative_status_changes_on_user_id ON public.initiative_status_changes USING btree (user_id);


--
-- Name: index_initiatives_on_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiatives_on_author_id ON public.initiatives USING btree (author_id);


--
-- Name: index_initiatives_on_location_point; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiatives_on_location_point ON public.initiatives USING gist (location_point);


--
-- Name: index_initiatives_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiatives_on_slug ON public.initiatives USING btree (slug);


--
-- Name: index_initiatives_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiatives_search ON public.initiatives USING gin (((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text)))));


--
-- Name: index_initiatives_topics_on_initiative_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiatives_topics_on_initiative_id ON public.initiatives_topics USING btree (initiative_id);


--
-- Name: index_initiatives_topics_on_initiative_id_and_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_initiatives_topics_on_initiative_id_and_topic_id ON public.initiatives_topics USING btree (initiative_id, topic_id);


--
-- Name: index_initiatives_topics_on_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_initiatives_topics_on_topic_id ON public.initiatives_topics USING btree (topic_id);


--
-- Name: index_insights_categories_on_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_categories_on_source ON public.insights_categories USING btree (source_type, source_id);


--
-- Name: index_insights_categories_on_source_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_categories_on_source_type ON public.insights_categories USING btree (source_type);


--
-- Name: index_insights_categories_on_view_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_categories_on_view_id ON public.insights_categories USING btree (view_id);


--
-- Name: index_insights_categories_on_view_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_insights_categories_on_view_id_and_name ON public.insights_categories USING btree (view_id, name);


--
-- Name: index_insights_category_assignments_on_approved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_category_assignments_on_approved ON public.insights_category_assignments USING btree (approved);


--
-- Name: index_insights_category_assignments_on_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_category_assignments_on_category_id ON public.insights_category_assignments USING btree (category_id);


--
-- Name: index_insights_category_assignments_on_input_type_and_input_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_category_assignments_on_input_type_and_input_id ON public.insights_category_assignments USING btree (input_type, input_id);


--
-- Name: index_insights_data_sources_on_origin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_data_sources_on_origin ON public.insights_data_sources USING btree (origin_type, origin_id);


--
-- Name: index_insights_data_sources_on_view_and_origin; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_insights_data_sources_on_view_and_origin ON public.insights_data_sources USING btree (view_id, origin_type, origin_id);


--
-- Name: index_insights_data_sources_on_view_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_data_sources_on_view_id ON public.insights_data_sources USING btree (view_id);


--
-- Name: index_insights_processed_flags_on_view_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_processed_flags_on_view_id ON public.insights_processed_flags USING btree (view_id);


--
-- Name: index_insights_text_network_analysis_tasks_views_on_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_text_network_analysis_tasks_views_on_task_id ON public.insights_text_network_analysis_tasks_views USING btree (task_id);


--
-- Name: index_insights_text_network_analysis_tasks_views_on_view_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_text_network_analysis_tasks_views_on_view_id ON public.insights_text_network_analysis_tasks_views USING btree (view_id);


--
-- Name: index_insights_text_networks_on_language; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_text_networks_on_language ON public.insights_text_networks USING btree (language);


--
-- Name: index_insights_text_networks_on_view_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_text_networks_on_view_id ON public.insights_text_networks USING btree (view_id);


--
-- Name: index_insights_text_networks_on_view_id_and_language; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_insights_text_networks_on_view_id_and_language ON public.insights_text_networks USING btree (view_id, language);


--
-- Name: index_insights_views_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_views_on_name ON public.insights_views USING btree (name);


--
-- Name: index_insights_zeroshot_classification_tasks_inputs_on_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_zeroshot_classification_tasks_inputs_on_task_id ON public.insights_zeroshot_classification_tasks_inputs USING btree (task_id);


--
-- Name: index_insights_zeroshot_classification_tasks_on_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_insights_zeroshot_classification_tasks_on_task_id ON public.insights_zeroshot_classification_tasks USING btree (task_id);


--
-- Name: index_insights_zsc_tasks_categories_on_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_zsc_tasks_categories_on_category_id ON public.insights_zeroshot_classification_tasks_categories USING btree (category_id);


--
-- Name: index_insights_zsc_tasks_categories_on_category_id_and_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_insights_zsc_tasks_categories_on_category_id_and_task_id ON public.insights_zeroshot_classification_tasks_categories USING btree (category_id, task_id);


--
-- Name: index_insights_zsc_tasks_categories_on_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_zsc_tasks_categories_on_task_id ON public.insights_zeroshot_classification_tasks_categories USING btree (task_id);


--
-- Name: index_insights_zsc_tasks_inputs_on_input; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_insights_zsc_tasks_inputs_on_input ON public.insights_zeroshot_classification_tasks_inputs USING btree (input_type, input_id);


--
-- Name: index_insights_zsc_tasks_inputs_on_input_and_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_insights_zsc_tasks_inputs_on_input_and_task_id ON public.insights_zeroshot_classification_tasks_inputs USING btree (input_id, input_type, task_id);


--
-- Name: index_invites_on_invitee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invites_on_invitee_id ON public.invites USING btree (invitee_id);


--
-- Name: index_invites_on_inviter_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invites_on_inviter_id ON public.invites USING btree (inviter_id);


--
-- Name: index_invites_on_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invites_on_token ON public.invites USING btree (token);


--
-- Name: index_maps_layers_on_map_config_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_maps_layers_on_map_config_id ON public.maps_layers USING btree (map_config_id);


--
-- Name: index_maps_legend_items_on_map_config_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_maps_legend_items_on_map_config_id ON public.maps_legend_items USING btree (map_config_id);


--
-- Name: index_maps_map_configs_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_maps_map_configs_on_project_id ON public.maps_map_configs USING btree (project_id);


--
-- Name: index_memberships_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_group_id ON public.memberships USING btree (group_id);


--
-- Name: index_memberships_on_group_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_memberships_on_group_id_and_user_id ON public.memberships USING btree (group_id, user_id);


--
-- Name: index_memberships_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_user_id ON public.memberships USING btree (user_id);


--
-- Name: index_nav_bar_items_on_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_nav_bar_items_on_code ON public.nav_bar_items USING btree (code);


--
-- Name: index_nav_bar_items_on_ordering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_nav_bar_items_on_ordering ON public.nav_bar_items USING btree (ordering);


--
-- Name: index_nav_bar_items_on_static_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_nav_bar_items_on_static_page_id ON public.nav_bar_items USING btree (static_page_id);


--
-- Name: index_nlp_text_network_analysis_tasks_on_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_nlp_text_network_analysis_tasks_on_task_id ON public.nlp_text_network_analysis_tasks USING btree (task_id);


--
-- Name: index_notifications_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_created_at ON public.notifications USING btree (created_at);


--
-- Name: index_notifications_on_inappropriate_content_flag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_inappropriate_content_flag_id ON public.notifications USING btree (inappropriate_content_flag_id);


--
-- Name: index_notifications_on_initiating_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_initiating_user_id ON public.notifications USING btree (initiating_user_id);


--
-- Name: index_notifications_on_invite_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_invite_id ON public.notifications USING btree (invite_id);


--
-- Name: index_notifications_on_official_feedback_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_official_feedback_id ON public.notifications USING btree (official_feedback_id);


--
-- Name: index_notifications_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_phase_id ON public.notifications USING btree (phase_id);


--
-- Name: index_notifications_on_post_id_and_post_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_post_id_and_post_type ON public.notifications USING btree (post_id, post_type);


--
-- Name: index_notifications_on_post_status_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_post_status_id ON public.notifications USING btree (post_status_id);


--
-- Name: index_notifications_on_post_status_id_and_post_status_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_post_status_id_and_post_status_type ON public.notifications USING btree (post_status_id, post_status_type);


--
-- Name: index_notifications_on_recipient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_recipient_id ON public.notifications USING btree (recipient_id);


--
-- Name: index_notifications_on_recipient_id_and_read_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_recipient_id_and_read_at ON public.notifications USING btree (recipient_id, read_at);


--
-- Name: index_notifications_on_spam_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_spam_report_id ON public.notifications USING btree (spam_report_id);


--
-- Name: index_official_feedbacks_on_post; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_official_feedbacks_on_post ON public.official_feedbacks USING btree (post_id, post_type);


--
-- Name: index_official_feedbacks_on_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_official_feedbacks_on_post_id ON public.official_feedbacks USING btree (post_id);


--
-- Name: index_official_feedbacks_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_official_feedbacks_on_user_id ON public.official_feedbacks USING btree (user_id);


--
-- Name: index_onboarding_campaign_dismissals_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_onboarding_campaign_dismissals_on_user_id ON public.onboarding_campaign_dismissals USING btree (user_id);


--
-- Name: index_permissions_on_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_permissions_on_action ON public.permissions USING btree (action);


--
-- Name: index_permissions_on_permission_scope_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_permissions_on_permission_scope_id ON public.permissions USING btree (permission_scope_id);


--
-- Name: index_phase_files_on_phase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_phase_files_on_phase_id ON public.phase_files USING btree (phase_id);


--
-- Name: index_phases_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_phases_on_project_id ON public.phases USING btree (project_id);


--
-- Name: index_poll_questions_on_participation_context; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_poll_questions_on_participation_context ON public.polls_questions USING btree (participation_context_type, participation_context_id);


--
-- Name: index_poll_responses_on_participation_context; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_poll_responses_on_participation_context ON public.polls_responses USING btree (participation_context_type, participation_context_id);


--
-- Name: index_polls_options_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_polls_options_on_question_id ON public.polls_options USING btree (question_id);


--
-- Name: index_polls_response_options_on_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_polls_response_options_on_option_id ON public.polls_response_options USING btree (option_id);


--
-- Name: index_polls_response_options_on_response_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_polls_response_options_on_response_id ON public.polls_response_options USING btree (response_id);


--
-- Name: index_polls_responses_on_participation_context_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_polls_responses_on_participation_context_and_user_id ON public.polls_responses USING btree (participation_context_id, participation_context_type, user_id);


--
-- Name: index_polls_responses_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_polls_responses_on_user_id ON public.polls_responses USING btree (user_id);


--
-- Name: index_processed_flags_on_input; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_processed_flags_on_input ON public.insights_processed_flags USING btree (input_type, input_id);


--
-- Name: index_project_files_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_files_on_project_id ON public.project_files USING btree (project_id);


--
-- Name: index_project_folders_files_on_project_folder_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_folders_files_on_project_folder_id ON public.project_folders_files USING btree (project_folder_id);


--
-- Name: index_project_folders_folders_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_folders_folders_on_slug ON public.project_folders_folders USING btree (slug);


--
-- Name: index_project_folders_images_on_project_folder_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_folders_images_on_project_folder_id ON public.project_folders_images USING btree (project_folder_id);


--
-- Name: index_project_images_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_images_on_project_id ON public.project_images USING btree (project_id);


--
-- Name: index_projects_allowed_input_topics_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_projects_allowed_input_topics_on_project_id ON public.projects_allowed_input_topics USING btree (project_id);


--
-- Name: index_projects_allowed_input_topics_on_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_projects_allowed_input_topics_on_topic_id ON public.projects_allowed_input_topics USING btree (topic_id);


--
-- Name: index_projects_on_custom_form_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_projects_on_custom_form_id ON public.projects USING btree (custom_form_id);


--
-- Name: index_projects_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_projects_on_slug ON public.projects USING btree (slug);


--
-- Name: index_projects_topics_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_projects_topics_on_project_id ON public.projects_topics USING btree (project_id);


--
-- Name: index_projects_topics_on_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_projects_topics_on_topic_id ON public.projects_topics USING btree (topic_id);


--
-- Name: index_public_api_api_clients_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_public_api_api_clients_on_tenant_id ON public.public_api_api_clients USING btree (tenant_id);


--
-- Name: index_single_category_assignment; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_single_category_assignment ON public.insights_category_assignments USING btree (category_id, input_id, input_type);


--
-- Name: index_single_processed_flags; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_single_processed_flags ON public.insights_processed_flags USING btree (input_id, input_type, view_id);


--
-- Name: index_spam_reports_on_reported_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_spam_reports_on_reported_at ON public.spam_reports USING btree (reported_at);


--
-- Name: index_spam_reports_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_spam_reports_on_user_id ON public.spam_reports USING btree (user_id);


--
-- Name: index_static_page_files_on_static_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_static_page_files_on_static_page_id ON public.static_page_files USING btree (static_page_id);


--
-- Name: index_static_pages_on_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_static_pages_on_code ON public.static_pages USING btree (code);


--
-- Name: index_static_pages_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_static_pages_on_slug ON public.static_pages USING btree (slug);


--
-- Name: index_surveys_responses_on_participation_context; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_surveys_responses_on_participation_context ON public.surveys_responses USING btree (participation_context_type, participation_context_id);


--
-- Name: index_surveys_responses_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_surveys_responses_on_user_id ON public.surveys_responses USING btree (user_id);


--
-- Name: index_tenants_on_creation_finalized_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tenants_on_creation_finalized_at ON public.tenants USING btree (creation_finalized_at);


--
-- Name: index_tenants_on_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tenants_on_deleted_at ON public.tenants USING btree (deleted_at);


--
-- Name: index_tenants_on_host; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tenants_on_host ON public.tenants USING btree (host);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_email ON public.users USING btree (email);


--
-- Name: index_users_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_slug ON public.users USING btree (slug);


--
-- Name: index_verification_verifications_on_hashed_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_verification_verifications_on_hashed_uid ON public.verification_verifications USING btree (hashed_uid);


--
-- Name: index_verification_verifications_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_verification_verifications_on_user_id ON public.verification_verifications USING btree (user_id);


--
-- Name: index_volunteering_causes_on_ordering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_volunteering_causes_on_ordering ON public.volunteering_causes USING btree (ordering);


--
-- Name: index_volunteering_causes_on_participation_context; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_volunteering_causes_on_participation_context ON public.volunteering_causes USING btree (participation_context_type, participation_context_id);


--
-- Name: index_volunteering_volunteers_on_cause_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_volunteering_volunteers_on_cause_id ON public.volunteering_volunteers USING btree (cause_id);


--
-- Name: index_volunteering_volunteers_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_volunteering_volunteers_on_user_id ON public.volunteering_volunteers USING btree (user_id);


--
-- Name: index_votes_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_votes_on_user_id ON public.votes USING btree (user_id);


--
-- Name: index_votes_on_votable_type_and_votable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_votes_on_votable_type_and_votable_id ON public.votes USING btree (votable_type, votable_id);


--
-- Name: index_votes_on_votable_type_and_votable_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_votes_on_votable_type_and_votable_id_and_user_id ON public.votes USING btree (votable_type, votable_id, user_id);


--
-- Name: machine_translations_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX machine_translations_lookup ON public.machine_translations_machine_translations USING btree (translatable_id, translatable_type, attribute_name, locale_to);


--
-- Name: machine_translations_translatable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX machine_translations_translatable ON public.machine_translations_machine_translations USING btree (translatable_id, translatable_type);


--
-- Name: moderation_statuses_moderatable; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX moderation_statuses_moderatable ON public.moderation_moderation_statuses USING btree (moderatable_type, moderatable_id);


--
-- Name: que_jobs_args_gin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX que_jobs_args_gin_idx ON public.que_jobs USING gin (args jsonb_path_ops);


--
-- Name: que_jobs_data_gin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX que_jobs_data_gin_idx ON public.que_jobs USING gin (data jsonb_path_ops);


--
-- Name: que_poll_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX que_poll_idx ON public.que_jobs USING btree (queue, priority, run_at, id) WHERE ((finished_at IS NULL) AND (expired_at IS NULL));


--
-- Name: spam_reportable_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX spam_reportable_index ON public.spam_reports USING btree (spam_reportable_type, spam_reportable_id);


--
-- Name: users_unique_lower_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_unique_lower_email_idx ON public.users USING btree (lower((email)::text));


--
-- Name: que_jobs que_job_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER que_job_notify AFTER INSERT ON public.que_jobs FOR EACH ROW EXECUTE FUNCTION public.que_job_notify();


--
-- Name: que_jobs que_state_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER que_state_notify AFTER INSERT OR DELETE OR UPDATE ON public.que_jobs FOR EACH ROW EXECUTE FUNCTION public.que_state_notify();


--
-- Name: events fk_rails_0434b48643; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_rails_0434b48643 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: invites fk_rails_06b2d7a3a8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT fk_rails_06b2d7a3a8 FOREIGN KEY (invitee_id) REFERENCES public.users(id);


--
-- Name: initiatives fk_rails_06c1835844; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiatives
    ADD CONSTRAINT fk_rails_06c1835844 FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: invites fk_rails_0b6ac3e1da; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT fk_rails_0b6ac3e1da FOREIGN KEY (inviter_id) REFERENCES public.users(id);


--
-- Name: spam_reports fk_rails_121f3a2011; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spam_reports
    ADD CONSTRAINT fk_rails_121f3a2011 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: insights_data_sources fk_rails_17b344203a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_data_sources
    ADD CONSTRAINT fk_rails_17b344203a FOREIGN KEY (view_id) REFERENCES public.insights_views(id);


--
-- Name: insights_text_network_analysis_tasks_views fk_rails_1e7db206db; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_text_network_analysis_tasks_views
    ADD CONSTRAINT fk_rails_1e7db206db FOREIGN KEY (view_id) REFERENCES public.insights_views(id);


--
-- Name: project_images fk_rails_2119c24213; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_images
    ADD CONSTRAINT fk_rails_2119c24213 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: insights_categories fk_rails_27c005f799; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_categories
    ADD CONSTRAINT fk_rails_27c005f799 FOREIGN KEY (view_id) REFERENCES public.insights_views(id);


--
-- Name: phase_files fk_rails_33852a9a71; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phase_files
    ADD CONSTRAINT fk_rails_33852a9a71 FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
-- Name: volunteering_volunteers fk_rails_33a154a9ba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteering_volunteers
    ADD CONSTRAINT fk_rails_33a154a9ba FOREIGN KEY (cause_id) REFERENCES public.volunteering_causes(id);


--
-- Name: nav_bar_items fk_rails_34143a680f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nav_bar_items
    ADD CONSTRAINT fk_rails_34143a680f FOREIGN KEY (static_page_id) REFERENCES public.static_pages(id);


--
-- Name: initiatives_topics fk_rails_39768eb1c3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiatives_topics
    ADD CONSTRAINT fk_rails_39768eb1c3 FOREIGN KEY (initiative_id) REFERENCES public.initiatives(id);


--
-- Name: baskets_ideas fk_rails_39a1b51358; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets_ideas
    ADD CONSTRAINT fk_rails_39a1b51358 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: initiatives fk_rails_3a983c39e6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiatives
    ADD CONSTRAINT fk_rails_3a983c39e6 FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: insights_text_network_analysis_tasks_views fk_rails_3e0e58a177; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_text_network_analysis_tasks_views
    ADD CONSTRAINT fk_rails_3e0e58a177 FOREIGN KEY (task_id) REFERENCES public.nlp_text_network_analysis_tasks(id);


--
-- Name: notifications fk_rails_46dd2ccfd1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_46dd2ccfd1 FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
-- Name: public_api_api_clients fk_rails_48aa32eb5a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_api_api_clients
    ADD CONSTRAINT fk_rails_48aa32eb5a FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: notifications fk_rails_4aea6afa11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_4aea6afa11 FOREIGN KEY (recipient_id) REFERENCES public.users(id);


--
-- Name: initiative_images fk_rails_4df6f76970; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiative_images
    ADD CONSTRAINT fk_rails_4df6f76970 FOREIGN KEY (initiative_id) REFERENCES public.initiatives(id);


--
-- Name: identities fk_rails_5373344100; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identities
    ADD CONSTRAINT fk_rails_5373344100 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications fk_rails_575368d182; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_575368d182 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: ideas fk_rails_5ac7668cd3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_rails_5ac7668cd3 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: initiatives_topics fk_rails_6ee3ffe8e1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiatives_topics
    ADD CONSTRAINT fk_rails_6ee3ffe8e1 FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: groups_permissions fk_rails_6fa6389d80; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_permissions
    ADD CONSTRAINT fk_rails_6fa6389d80 FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: email_campaigns_campaigns_groups fk_rails_712f4ad915; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaigns_groups
    ADD CONSTRAINT fk_rails_712f4ad915 FOREIGN KEY (campaign_id) REFERENCES public.email_campaigns_campaigns(id);


--
-- Name: ideas fk_rails_730408dafc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_rails_730408dafc FOREIGN KEY (idea_status_id) REFERENCES public.idea_statuses(id);


--
-- Name: groups_projects fk_rails_73e1dee5fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_projects
    ADD CONSTRAINT fk_rails_73e1dee5fd FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: insights_zeroshot_classification_tasks_categories fk_rails_7a1b53273b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_zeroshot_classification_tasks_categories
    ADD CONSTRAINT fk_rails_7a1b53273b FOREIGN KEY (task_id) REFERENCES public.insights_zeroshot_classification_tasks(id);


--
-- Name: maps_legend_items fk_rails_7c44736f5e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps_legend_items
    ADD CONSTRAINT fk_rails_7c44736f5e FOREIGN KEY (map_config_id) REFERENCES public.maps_map_configs(id);


--
-- Name: activities fk_rails_7e11bb717f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT fk_rails_7e11bb717f FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: email_campaigns_campaign_email_commands fk_rails_7f284a4f09; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaign_email_commands
    ADD CONSTRAINT fk_rails_7f284a4f09 FOREIGN KEY (recipient_id) REFERENCES public.users(id);


--
-- Name: polls_response_options fk_rails_80d00e60ae; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_response_options
    ADD CONSTRAINT fk_rails_80d00e60ae FOREIGN KEY (option_id) REFERENCES public.polls_options(id);


--
-- Name: projects_allowed_input_topics fk_rails_812b6d9149; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_allowed_input_topics
    ADD CONSTRAINT fk_rails_812b6d9149 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: projects_topics fk_rails_812b6d9149; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_topics
    ADD CONSTRAINT fk_rails_812b6d9149 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: areas_initiatives fk_rails_81a9922de4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_initiatives
    ADD CONSTRAINT fk_rails_81a9922de4 FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: areas_ideas fk_rails_81e27f10eb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_ideas
    ADD CONSTRAINT fk_rails_81e27f10eb FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: ideas_phases fk_rails_845d7ca944; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_phases
    ADD CONSTRAINT fk_rails_845d7ca944 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: notifications fk_rails_849e0c7eb7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_849e0c7eb7 FOREIGN KEY (spam_report_id) REFERENCES public.spam_reports(id);


--
-- Name: email_campaigns_campaigns fk_rails_87e592c9f5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_campaigns
    ADD CONSTRAINT fk_rails_87e592c9f5 FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: areas_projects fk_rails_8fb43a173d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_projects
    ADD CONSTRAINT fk_rails_8fb43a173d FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: initiative_files fk_rails_8fcd2c6036; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.initiative_files
    ADD CONSTRAINT fk_rails_8fcd2c6036 FOREIGN KEY (initiative_id) REFERENCES public.initiatives(id);


--
-- Name: notifications fk_rails_9268535f02; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_9268535f02 FOREIGN KEY (comment_id) REFERENCES public.comments(id);


--
-- Name: notifications fk_rails_97eb4c3a35; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_97eb4c3a35 FOREIGN KEY (invite_id) REFERENCES public.invites(id);


--
-- Name: memberships fk_rails_99326fb65d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_99326fb65d FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: areas_projects fk_rails_9ecfc9d2b9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_projects
    ADD CONSTRAINT fk_rails_9ecfc9d2b9 FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: notifications fk_rails_a2016447bc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_a2016447bc FOREIGN KEY (initiating_user_id) REFERENCES public.users(id);


--
-- Name: notifications fk_rails_a2cfad997d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_a2cfad997d FOREIGN KEY (official_feedback_id) REFERENCES public.official_feedbacks(id);


--
-- Name: event_files fk_rails_a590d6ddde; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_files
    ADD CONSTRAINT fk_rails_a590d6ddde FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: groups_permissions fk_rails_a5c3527604; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_permissions
    ADD CONSTRAINT fk_rails_a5c3527604 FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: areas_initiatives fk_rails_a67ac3c9d1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_initiatives
    ADD CONSTRAINT fk_rails_a67ac3c9d1 FOREIGN KEY (initiative_id) REFERENCES public.initiatives(id);


--
-- Name: ideas fk_rails_a7a91f1df3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_rails_a7a91f1df3 FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: memberships fk_rails_aaf389f138; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_aaf389f138 FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: maps_layers fk_rails_abbf8658b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maps_layers
    ADD CONSTRAINT fk_rails_abbf8658b2 FOREIGN KEY (map_config_id) REFERENCES public.maps_map_configs(id);


--
-- Name: phases fk_rails_b0efe660f5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT fk_rails_b0efe660f5 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: baskets fk_rails_b3d04c10d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets
    ADD CONSTRAINT fk_rails_b3d04c10d5 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: custom_field_options fk_rails_b48da9e6c7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_field_options
    ADD CONSTRAINT fk_rails_b48da9e6c7 FOREIGN KEY (custom_field_id) REFERENCES public.custom_fields(id);


--
-- Name: polls_options fk_rails_bb813b4549; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_options
    ADD CONSTRAINT fk_rails_bb813b4549 FOREIGN KEY (question_id) REFERENCES public.polls_questions(id);


--
-- Name: ideas_phases fk_rails_bd36415a82; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_phases
    ADD CONSTRAINT fk_rails_bd36415a82 FOREIGN KEY (phase_id) REFERENCES public.phases(id);


--
-- Name: project_files fk_rails_c26fbba4b3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT fk_rails_c26fbba4b3 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: ideas fk_rails_c32c787647; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_rails_c32c787647 FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: idea_images fk_rails_c349bb4ac3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_images
    ADD CONSTRAINT fk_rails_c349bb4ac3 FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: notifications fk_rails_c76d81b062; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_c76d81b062 FOREIGN KEY (inappropriate_content_flag_id) REFERENCES public.flag_inappropriate_content_inappropriate_content_flags(id);


--
-- Name: email_campaigns_deliveries fk_rails_c87ec11171; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns_deliveries
    ADD CONSTRAINT fk_rails_c87ec11171 FOREIGN KEY (campaign_id) REFERENCES public.email_campaigns_campaigns(id);


--
-- Name: insights_zeroshot_classification_tasks_categories fk_rails_c902b207ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_zeroshot_classification_tasks_categories
    ADD CONSTRAINT fk_rails_c902b207ea FOREIGN KEY (category_id) REFERENCES public.insights_categories(id);


--
-- Name: votes fk_rails_c9b3bef597; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT fk_rails_c9b3bef597 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: static_page_files fk_rails_d0209b82ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_page_files
    ADD CONSTRAINT fk_rails_d0209b82ff FOREIGN KEY (static_page_id) REFERENCES public.static_pages(id);


--
-- Name: projects fk_rails_d1892257e3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_rails_d1892257e3 FOREIGN KEY (default_assignee_id) REFERENCES public.users(id);


--
-- Name: groups_projects fk_rails_d6353758d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups_projects
    ADD CONSTRAINT fk_rails_d6353758d5 FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: projects_allowed_input_topics fk_rails_db7813bfef; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_allowed_input_topics
    ADD CONSTRAINT fk_rails_db7813bfef FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: projects_topics fk_rails_db7813bfef; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_topics
    ADD CONSTRAINT fk_rails_db7813bfef FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: project_folders_files fk_rails_dc7aeb6534; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_folders_files
    ADD CONSTRAINT fk_rails_dc7aeb6534 FOREIGN KEY (project_folder_id) REFERENCES public.project_folders_folders(id);


--
-- Name: project_folders_images fk_rails_dcbc962cfe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_folders_images
    ADD CONSTRAINT fk_rails_dcbc962cfe FOREIGN KEY (project_folder_id) REFERENCES public.project_folders_folders(id);


--
-- Name: insights_category_assignments fk_rails_dd144cbdf0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_category_assignments
    ADD CONSTRAINT fk_rails_dd144cbdf0 FOREIGN KEY (category_id) REFERENCES public.insights_categories(id);


--
-- Name: official_feedbacks fk_rails_ddd7e21dfa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_feedbacks
    ADD CONSTRAINT fk_rails_ddd7e21dfa FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: baskets_ideas fk_rails_dfb57cbce2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets_ideas
    ADD CONSTRAINT fk_rails_dfb57cbce2 FOREIGN KEY (basket_id) REFERENCES public.baskets(id);


--
-- Name: polls_response_options fk_rails_e871bf6e26; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls_response_options
    ADD CONSTRAINT fk_rails_e871bf6e26 FOREIGN KEY (response_id) REFERENCES public.polls_responses(id);


--
-- Name: areas_ideas fk_rails_e96a71e39f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas_ideas
    ADD CONSTRAINT fk_rails_e96a71e39f FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: insights_zeroshot_classification_tasks_inputs fk_rails_ee8a3a2c3d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_zeroshot_classification_tasks_inputs
    ADD CONSTRAINT fk_rails_ee8a3a2c3d FOREIGN KEY (task_id) REFERENCES public.insights_zeroshot_classification_tasks(id);


--
-- Name: idea_files fk_rails_efb12f53ad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idea_files
    ADD CONSTRAINT fk_rails_efb12f53ad FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: insights_text_networks fk_rails_f3e4924881; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insights_text_networks
    ADD CONSTRAINT fk_rails_f3e4924881 FOREIGN KEY (view_id) REFERENCES public.insights_views(id);


--
-- Name: comments fk_rails_f44b1e3c8a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_rails_f44b1e3c8a FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: ideas_topics fk_rails_fd874ecf4b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_topics
    ADD CONSTRAINT fk_rails_fd874ecf4b FOREIGN KEY (idea_id) REFERENCES public.ideas(id);


--
-- Name: ideas_topics fk_rails_ff1788eb50; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ideas_topics
    ADD CONSTRAINT fk_rails_ff1788eb50 FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO public,shared_extensions;

INSERT INTO "schema_migrations" (version) VALUES
('20170301182502'),
('20170302155043'),
('20170314053812'),
('20170317133413'),
('20170317151309'),
('20170318141825'),
('20170318143940'),
('20170318144700'),
('20170318155729'),
('20170318181018'),
('20170319000059'),
('20170330122943'),
('20170407113052'),
('20170410152320'),
('20170415160722'),
('20170418104454'),
('20170424201042'),
('20170503161621'),
('20170509093623'),
('20170520132308'),
('20170520134018'),
('20170525125712'),
('20170531144653'),
('20170602105428'),
('20170607123146'),
('20170620074738'),
('20170620083943'),
('20170703234313'),
('20170704729304'),
('20170705093051'),
('20170705093317'),
('20170718095819'),
('20170718121258'),
('20170719160834'),
('20170719172958'),
('20170918101800'),
('20171010091219'),
('20171010114629'),
('20171010114644'),
('20171020101837'),
('20171022182428'),
('20171023192224'),
('20171029143741'),
('20171031131310'),
('20171101102506'),
('20171106212610'),
('20171113100102'),
('20171115092024'),
('20171117114456'),
('20171117155422'),
('20171127103900'),
('20171204155602'),
('20171209082850'),
('20171218134052'),
('20171221145649'),
('20180103163513'),
('20180108134711'),
('20180108144026'),
('20180108144119'),
('20180108153406'),
('20180117103530'),
('20180117105551'),
('20180118125241'),
('20180206132516'),
('20180209161249'),
('20180215090033'),
('20180215130118'),
('20180220142344'),
('20180220144702'),
('20180221143137'),
('20180302100342'),
('20180302145039'),
('20180307132304'),
('20180309160219'),
('20180327085216'),
('20180327132833'),
('20180328123240'),
('20180404092302'),
('20180405090646'),
('20180405195146'),
('20180412140227'),
('20180423120217'),
('20180423123552'),
('20180423123610'),
('20180423123634'),
('20180424190023'),
('20180424190024'),
('20180516143348'),
('20180610165230'),
('20180705085133'),
('20180801130039'),
('20180809133236'),
('20180809134021'),
('20180813093429'),
('20180815114121'),
('20180815114122'),
('20180815114123'),
('20180815114124'),
('20180824094903'),
('20180829162620'),
('20180912135727'),
('20180913085107'),
('20180913085920'),
('20180913155502'),
('20180919144612'),
('20180920155012'),
('20180920155127'),
('20181011143305'),
('20181022092934'),
('20181205134744'),
('20181210113428'),
('20190107123605'),
('20190124094814'),
('20190129100321'),
('20190211103921'),
('20190211134223'),
('20190215155920'),
('20190220152327'),
('20190312154517'),
('20190313091027'),
('20190318145229'),
('20190325142711'),
('20190325155516'),
('20190527091133'),
('20190528101954'),
('20190531143638'),
('20190603100709'),
('20190603100803'),
('20190603135926'),
('20190603141415'),
('20190603142853'),
('20190604135000'),
('20190605125206'),
('20190607132326'),
('20190701091036'),
('20190724095644'),
('20190730131947'),
('20190816143358'),
('20190904135343'),
('20190904135344'),
('20190905123108'),
('20190905123110'),
('20190906093107'),
('20190909124937'),
('20190909124938'),
('20191008115234'),
('20191014135916'),
('20191023121111'),
('20191114092523'),
('20191209135917'),
('20191209183623'),
('20191210205216'),
('20191211104007'),
('20191213112024'),
('20191213130342'),
('20191218161144'),
('20200109163736'),
('20200131124534'),
('20200131130350'),
('20200131133006'),
('20200206081103'),
('20200206162013'),
('20200206165218'),
('20200213001613'),
('20200226124456'),
('20200306160918'),
('20200310101259'),
('20200311132551'),
('20200316142820'),
('20200316142821'),
('20200316142822'),
('20200316155355'),
('20200318220614'),
('20200318220615'),
('20200319101312'),
('20200325160114'),
('20200423123927'),
('20200519164633'),
('20200527093956'),
('20200527094026'),
('20200805132331'),
('20200807132541'),
('20200820141351'),
('20200902151045'),
('20200911150057'),
('20201001174500'),
('20201007102916'),
('20201014180247'),
('20201015180356'),
('20201018122834'),
('20201022160000'),
('20201029180155'),
('20201102093045'),
('20201116092906'),
('20201116092907'),
('20201120173700'),
('20201120190900'),
('20201127160903'),
('20201130161115'),
('20201204134337'),
('20201217170635'),
('20210112155555'),
('20210119144531'),
('20210127105555'),
('20210127112755'),
('20210127112825'),
('20210127112937'),
('20210211144443'),
('20210217112905'),
('20210304203413'),
('20210312123927'),
('20210316113654'),
('20210317114360'),
('20210317114361'),
('20210319100008'),
('20210319161957'),
('20210324164613'),
('20210324164740'),
('20210324181315'),
('20210324181814'),
('20210402103419'),
('20210413172107'),
('20210430154637'),
('20210506151054'),
('20210512094502'),
('20210518143118'),
('20210521101107'),
('20210601061247'),
('20210619133856'),
('20210624163536'),
('20210722110109'),
('20210902121355'),
('20210902121356'),
('20210902121357'),
('20211806161354'),
('20211806161355'),
('20211806161356'),
('20211806161357'),
('20211906161359'),
('20211906161360'),
('20211906161361'),
('20211906161362'),
('20212006161357'),
('20212006161358'),
('20220112081701'),
('20220114095033'),
('20220120154239'),
('20220126110341'),
('20220207103216'),
('20220211143841'),
('20220214110500'),
('20220302143958'),
('20220308184000'),
('20220324073642'),
('20220407131522');


