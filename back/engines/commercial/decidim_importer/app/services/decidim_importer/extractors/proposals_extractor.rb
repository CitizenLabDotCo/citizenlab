# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposals ──▶ Go Vocal `Idea` (in an ideation phase), plus the `ideas_phase` join that
    # surfaces the idea in its phase and, when the proposal was answered, an `OfficialFeedback`.
    #
    # Each proposal row is stamped by the importer with its owning process (`decidim_participatory_process`)
    # and proposals component (`decidim_component`) — the directories are the association. The component
    # already became an ideation phase via {PhaseProjector} (registered under the component uid), so the
    # idea's `creation_phase` and the join's `phase` both resolve through the ref map.
    #
    # The imported idea carries a `idea_status_code` rather than an `idea_status_ref`: the tenant's
    # statuses already exist and are resolved to a real id at apply time by {IdeaStatuses.resolve!}.
    class ProposalsExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        process: 'decidim_participatory_process',
        component: 'decidim_component',
        authors: 'authors',
        title: 'title',
        body: 'body',
        answer: 'answer',
        state_token: 'state_token',
        published_at: 'published_at'
      }.freeze

      OFFICIAL_FEEDBACK_AUTHOR = 'Administration'

      attr_reader :skipped

      def initialize(*args, **kwargs)
        super
        @skipped = []
      end

      def run
        rows.filter_map { |row| build_idea(row) }
      end

      private

      def build_idea(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        project = ref_map.fetch(present_value(row[COLUMNS[:process]]))
        phase = ref_map.fetch(present_value(row[COLUMNS[:component]]))
        if project.nil? || phase.nil?
          @skipped << { uid: uid, reason: 'no project/phase for proposal' }
          return nil
        end

        idea = Record.new('idea', idea_attributes(row))
        idea.reference('project', project)
        # Ideation is a *transitive* participation method, so the idea links to its phase only through
        # the ideas_phase join below — setting `creation_phase` is rejected (that's for non-transitive
        # methods like proposals/native_survey).
        author = author_record(row)
        idea.reference('author', author) if author
        ref_map.register(uid, idea)

        register_ideas_phase(uid, idea, phase)
        register_official_feedback(uid, idea, row)
        idea
      end

      def idea_attributes(row)
        {
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'body_multiloc' => multiloc(row[COLUMNS[:body]]),
          'publication_status' => 'published',
          'published_at' => timestamp(row[COLUMNS[:published_at]]),
          'idea_status_code' => IdeaStatuses.code_for_state_token(row[COLUMNS[:state_token]])
        }
      end

      # Decidim `authors` is a JSON array of uids; we keep the first that resolves to an imported user.
      # Non-user authors (meetings, organizations) and filtered users (spam/unconfirmed) leave the idea
      # author-less, which Go Vocal allows (`Idea#author` is optional).
      def author_record(row)
        author_uids(row).filter_map { |uid| ref_map.fetch(uid) }.find do |record|
          record.model_name == 'user'
        end
      end

      def author_uids(row)
        parsed = parse_json_array(row[COLUMNS[:authors]])
        Array(parsed).filter_map { |uid| present_value(uid) }
      end

      def register_ideas_phase(uid, idea, phase)
        join = Record.new('ideas_phase', {})
        join.reference('idea', idea)
        join.reference('phase', phase)
        ref_map.register("#{uid}-ideas-phase", join)
      end

      def register_official_feedback(uid, idea, row)
        body = multiloc(row[COLUMNS[:answer]])
        return if body.empty?

        feedback = Record.new('official_feedback', {
          'body_multiloc' => body,
          'author_multiloc' => body.keys.index_with { OFFICIAL_FEEDBACK_AUTHOR }
        })
        feedback.reference('idea', idea)
        ref_map.register("#{uid}-official-feedback", feedback)
      end

      def parse_json_array(value)
        return value if value.is_a?(Array)

        str = value.to_s.strip
        return [] unless str.start_with?('[')

        JSON.parse(str)
      rescue JSON::ParserError
        []
      end
    end
  end
end
