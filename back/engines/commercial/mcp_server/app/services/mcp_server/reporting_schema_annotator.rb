# frozen_string_literal: true

module McpServer
  # Applies Postgres COMMENT ON statements that document the reporting tables and
  # their columns. These comments are the semantic contract the get_reporting_sql_schema
  # tool surfaces to the client AI, so it writes correct SQL instead of guessing.
  #
  # Like AnalyticsReaderProvisioner, this is one idempotent service with three call sites:
  #   - the backfill migration   -> all existing tenants (Apartment runs it per schema);
  #   - finalize_creation         -> each new tenant (idempotent; covers the clone either way);
  #   - the reannotate rake task  -> re-apply after a scenic view-version bump (which drops
  #                                  VIEW comments) or after editing the text below.
  #
  # COMMENT ON is naturally idempotent (it overwrites), and the relation kind
  # (VIEW vs TABLE) is detected at run time so the right keyword is used.
  class ReportingSchemaAnnotator
    # The documentation, keyed by relation. `table` is the relation-level comment;
    # `columns` are per-column. Keep this in sync with REPORTING_TABLES.
    ANNOTATIONS = {
      'analytics_fact_participations' => {
        table:
          'Fact table with one row per participation action: a published idea or native-survey ' \
          'response, a comment, a reaction (like/dislike), a poll response, a volunteering sign-up, ' \
          'a basket (participatory-budgeting submission) or an event attendance. Count distinct ' \
          'participants with participant_id (it handles anonymous actions), not dimension_user_id. ' \
          'Join the dimension_* keys to the matching analytics_dimension_* tables.',
        columns: {
          'id' =>
            'Identifier of the underlying source record (idea, comment, reaction, poll response, ' \
            'volunteer, basket or event attendance). Unique per row.',
          'dimension_user_id' =>
            'Acting user; foreign key to analytics_dimension_users.id. NULL for anonymous actions. ' \
            'Do not count participants on this column (anonymous rows would be dropped); use participant_id.',
          'participant_id' =>
            'Stable per-participant key for distinct counts. Equals the user id when known. For ' \
            'anonymous ideas, native-survey responses and comments it falls back to a stable author ' \
            'hash, so repeat actions de-duplicate. For anonymous reactions, poll responses, baskets ' \
            'and volunteering it falls back to the row id, so each such action counts as a separate ' \
            'participant. Event attendances use the attendee id only.',
          'dimension_project_id' =>
            'Project the action belongs to; foreign key to analytics_dimension_projects.id. Can be ' \
            'NULL when the action is not linked to a project.',
          'dimension_type_id' =>
            'Participation type; foreign key to analytics_dimension_types.id. In this fact the type ' \
            'is one of idea, survey, comment, reaction, poll, volunteer, basket or event_attendance.',
          'dimension_date_created_id' =>
            'Creation date (created_at truncated to a date); foreign key to analytics_dimension_dates.date. ' \
            'Date only, in UTC, so it can differ from the tenant-local date near midnight.',
          'reactions_count' =>
            'Reactions associated with the row. For idea and comment rows: likes plus dislikes received ' \
            'by that item. For reaction rows: always 1 (the reaction itself). 0 for polls, volunteering, ' \
            'baskets and event attendances.',
          'likes_count' =>
            'Likes (up-votes). For idea and comment rows: likes received by the item. For reaction rows: ' \
            '1 when the reaction is a like, else 0. 0 for the other types.',
          'dislikes_count' =>
            'Dislikes (down-votes). For idea and comment rows: dislikes received by the item. For reaction ' \
            'rows: 1 when the reaction is a dislike, else 0. 0 for the other types.'
        }
      },
      'analytics_dimension_dates' => {
        table:
          'Date dimension with one row per calendar date, used to bucket facts by day, week, month or ' \
          'year. Join a fact dimension_date_*_id to this date column. Dates are calendar dates in UTC ' \
          'and are not adjusted to the tenant timezone.',
        columns: {
          'date' => 'Calendar date and primary key. Target of the fact dimension_date_*_id foreign keys.',
          'year' => 'Year as text, for example 2026.',
          'month' => 'Month as YYYY-MM text, for example 2026-06.',
          'week' => 'Date of the Monday that starts the week containing this date (the week bucket).'
        }
      },
      'analytics_dimension_types' => {
        table:
          'Type dimension describing the kind of participation. Referenced by ' \
          'analytics_fact_participations.dimension_type_id (and other facts). Each row is a (name, parent) pair.',
        columns: {
          'id' => 'Primary key. Target of fact dimension_type_id foreign keys.',
          'name' =>
            'Type name. One of idea, proposal, comment, reaction, poll, volunteer, survey, basket, ' \
            'event_attendance or follower.',
          'parent' =>
            'Category the type applies to: post for idea and proposal; idea or proposal for comment; ' \
            'idea or comment for reaction; the followed entity (for example project or phase) for ' \
            'follower; NULL for poll, volunteer, survey, basket and event_attendance.'
        }
      },
      'analytics_dimension_projects' => {
        table:
          'Project dimension with descriptive attributes for projects (participation containers). ' \
          'Referenced by analytics_fact_participations.dimension_project_id.',
        columns: {
          'id' => 'Project primary key. Target of fact dimension_project_id foreign keys.',
          'title_multiloc' =>
            'Project title as a multiloc JSON object keyed by locale, for example {"en": "Budget 2026"}. ' \
            "Read one locale with the ->> operator, for example title_multiloc->>'en'."
        }
      },
      'analytics_dimension_users' => {
        table:
          'User dimension with classification attributes, one row per user. Referenced by facts via ' \
          'dimension_user_id.',
        columns: {
          'id' => 'User primary key. Target of fact dimension_user_id foreign keys.',
          'role' =>
            'Highest role of the user, taken from the first entry of their roles. One of admin, ' \
            'project_moderator, project_folder_moderator or space_moderator, or citizen for ordinary ' \
            'users with no special role.',
          'invite_status' =>
            'Invitation state: pending (invited, not yet accepted), accepted, or NULL when the user ' \
            'registered directly rather than by invitation.',
          'has_visits' =>
            'True when the user has at least one recorded visit. Visits here come from the Matomo-based ' \
            'visits fact, which can differ from the visitor numbers shown on dashboards (a different source).'
        }
      }
    }.freeze

    class << self
      def annotate!(schema = Apartment::Tenant.current)
        ANNOTATIONS.each do |relation, doc|
          kind = relation_kind(schema, relation)
          next unless kind # relation absent in this schema: skip rather than error

          rel = quote_rel(schema, relation)
          execute("COMMENT ON #{kind} #{rel} IS #{quote(doc[:table])}")
          doc[:columns].each do |column, comment|
            execute("COMMENT ON COLUMN #{rel}.#{quote_ident(column)} IS #{quote(comment)}")
          end
        end
      end

      # Tenant-creation-safe variant: a failure here must never abort tenant
      # creation. Mirrors AnalyticsReaderProvisioner.provision_safely.
      def annotate_safely(schema = Apartment::Tenant.current)
        ActiveRecord::Base.transaction(requires_new: true) do
          annotate!(schema)
        end
        true
      rescue StandardError => e
        Rails.logger.error("[#{name}] annotating reporting schema failed for '#{schema}': #{e.message}")
        Sentry.capture_exception(e) if defined?(Sentry)
        false
      end

      # Removes the comments (sets them to NULL). Used by the migration's #down.
      def clear!(schema = Apartment::Tenant.current)
        ANNOTATIONS.each do |relation, doc|
          kind = relation_kind(schema, relation)
          next unless kind

          rel = quote_rel(schema, relation)
          execute("COMMENT ON #{kind} #{rel} IS NULL")
          doc[:columns].each_key do |column|
            execute("COMMENT ON COLUMN #{rel}.#{quote_ident(column)} IS NULL")
          end
        end
      end

      private

      # 'VIEW' / 'MATERIALIZED VIEW' / 'TABLE', or nil when the relation is absent.
      def relation_kind(schema, relation)
        relkind = connection.select_value(<<~SQL.squish)
          SELECT c.relkind FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = #{quote(schema)} AND c.relname = #{quote(relation)}
        SQL
        case relkind
        when 'v' then 'VIEW'
        when 'm' then 'MATERIALIZED VIEW'
        when 'r', 'p' then 'TABLE'
        end
      end

      def quote_rel(schema, relation) = "#{quote_ident(schema)}.#{quote_ident(relation)}"
      def quote_ident(name) = connection.quote_column_name(name)
      def quote(value) = connection.quote(value)
      def execute(sql) = connection.execute(sql)
      def connection = ActiveRecord::Base.connection
    end
  end
end
