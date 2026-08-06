# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposals ──▶ Go Vocal `Idea` (in an ideation phase), plus the `ideas_phase` join that
    # surfaces the idea in its phase and, when the proposal was answered, an `OfficialFeedback`.
    #
    # The component already became an ideation phase via {PhaseProjector} (registered under the component
    # uid), so the join's `phase` resolves through the ref map. The idea's status comes from its Decidim
    # state via the {ProposalStatusResolver}: a standard status resolves to a real id at apply time by
    # {IdeaStatuses.resolve!} (an `idea_status_code`), a custom one is referenced directly.
    class ProposalsExtractor < BaseExtractor
      include IdeaAssociations

      COLUMNS = {
        uid: 'uid',
        process: 'decidim_participatory_process',
        component: 'decidim_component',
        authors: 'authors',
        category: 'category',
        scope: 'scope',
        title: 'title',
        body: 'body',
        address: 'address',
        latitude: 'latitude',
        longitude: 'longitude',
        answer: 'answer',
        answered_at: 'answered_at',
        state_token: 'state_token',
        published_at: 'published_at'
      }.freeze

      OFFICIAL_FEEDBACK_AUTHOR = 'Administration'

      # @param status_resolver [ProposalStatusResolver, nil] maps each proposal's Decidim state to a Go
      #   Vocal idea_status (a standard code or a custom record) and supplies the original status for
      #   provenance. When nil, the status is derived from the state token alone via {IdeaStatuses} and no
      #   provenance is stored — the pre-mapping path kept for callers/tests that don't build a resolver.
      def initialize(rows, ref_map, locale_mapper:, primary_locale: 'fr-FR', status_resolver: nil)
        super(rows, ref_map, locale_mapper: locale_mapper, primary_locale: primary_locale)
        @status_resolver = status_resolver
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
        return skip(uid, 'no project/phase for proposal') if project.nil? || phase.nil?

        idea = Record.new('idea', idea_attributes(row))
        idea.reference('project', project)
        # Ideation is *transitive*, so the idea links to its phase only through the ideas_phase join
        # below — setting `creation_phase` is rejected (that's for non-transitive methods).
        author = author_record(row)
        idea.reference('author', author) if author
        ref_map.register(uid, idea)

        register_ideas_phase(uid, idea, phase)
        register_input_topic(uid, idea, row[COLUMNS[:category]])
        register_scope_area(idea, row[COLUMNS[:scope]])
        apply_status(idea, row)
        register_official_feedback(uid, idea, row)
        idea
      end

      def idea_attributes(row)
        # The export only dates a proposal by its publication; use that for created/submitted too, so the
        # imported idea isn't stamped with today's date.
        published = timestamp(row[COLUMNS[:published_at]])
        attributes = {
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'body_multiloc' => multiloc(row[COLUMNS[:body]]),
          'publication_status' => 'published',
          'created_at' => published,
          'published_at' => published,
          'submitted_at' => published
        }
        add_location(attributes, row)
        attributes
      end

      # Sets the idea's status from its Decidim state. With a {ProposalStatusResolver} the state maps to a
      # standard code (kept as `idea_status_code`, resolved to a tenant id by {IdeaStatuses.resolve!}) or a
      # custom `idea_status` record (referenced), and the original Decidim status is parked in
      # `custom_field_values` for provenance. Without a resolver, the status is derived from the token alone.
      def apply_status(idea, row)
        unless @status_resolver
          idea.attributes['idea_status_code'] = IdeaStatuses.code_for_state_token(row[COLUMNS[:state_token]])
          return
        end

        decision = @status_resolver.resolve(present_value(row[COLUMNS[:component]]), row[COLUMNS[:state_token]])
        if decision.idea_status_record
          idea.reference('idea_status', decision.idea_status_record)
        else
          idea.attributes['idea_status_code'] = decision.idea_status_code
        end
        register_decidim_status(idea, decision)
      end

      # Proposals can carry a geocoded address (`address` + `latitude`/`longitude`). Map the free-text
      # address to `location_description` and the coordinates to the idea's map pin, when present.
      def add_location(attributes, row)
        address = present_value(row[COLUMNS[:address]])
        attributes['location_description'] = address if address
        point = location_point_geojson(row[COLUMNS[:latitude]], row[COLUMNS[:longitude]])
        attributes['location_point_geojson'] = point if point
      end

      # Decidim `authors` is a JSON array of uids; keep the first resolving to an imported user. Non-user
      # authors and filtered users leave the idea author-less, which Go Vocal allows (`Idea#author` optional).
      def author_record(row)
        author_uids(row).filter_map { |uid| ref_map.fetch(uid) }.find do |record|
          record.model_name == 'user'
        end
      end

      def author_uids(row)
        Array(Parsing.parse_json(row[COLUMNS[:authors]])).filter_map { |uid| present_value(uid) }
      end

      def register_official_feedback(uid, idea, row)
        # An answered-but-empty proposal carries a visually-blank body (e.g. `<p><br></p>`); dropping the
        # content-less locales here keeps it from failing OfficialFeedback's body-presence validation.
        body = html_present_multiloc(multiloc(row[COLUMNS[:answer]]))
        return if body.empty?

        # Date the feedback by when the proposal was answered, falling back to the proposal's own date
        # rather than the import date. (`updated_at` is then mirrored from this by the importer.)
        feedback = Record.new('official_feedback', {
          'body_multiloc' => body,
          'author_multiloc' => body.keys.index_with { OFFICIAL_FEEDBACK_AUTHOR },
          'created_at' => timestamp(row[COLUMNS[:answered_at]]) || timestamp(row[COLUMNS[:published_at]])
        })
        feedback.reference('idea', idea)
        ref_map.register("#{uid}-official-feedback", feedback)
      end
    end
  end
end
