# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim budget projects (`NN---projects.csv`) ──▶ Go Vocal `Idea`s in the component's voting phase
    # (the component becomes that phase via {PhaseProjector}).
    #
    # Each becomes an author-less idea (budget projects carry no author) tagged with its category, in the
    # phase registered under the component uid. `budget_amount` becomes the idea's `budget` — the cost
    # the budgeting voting method charges a basket that picks it.
    class BudgetProjectsExtractor < BaseExtractor
      include IdeaAssociations

      COLUMNS = {
        uid: 'uid',
        process: 'decidim_participatory_process',
        component: 'decidim_component',
        category: 'category',
        title: 'title',
        description: 'description',
        budget_amount: 'budget_amount',
        address: 'address',
        latitude: 'latitude',
        longitude: 'longitude',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      def run
        rows.filter_map { |row| build_idea(row) }
      end

      private

      def build_idea(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        project = ref_map.fetch(present_value(row[COLUMNS[:process]]))
        phase = ref_map.fetch(present_value(row[COLUMNS[:component]]))
        return skip(uid, 'no project/phase for budget project') if project.nil? || phase.nil?

        idea = Record.new('idea', idea_attributes(row))
        idea.reference('project', project)
        ref_map.register(uid, idea)

        register_ideas_phase(uid, idea, phase)
        register_input_topic(uid, idea, row[COLUMNS[:category]])
        idea
      end

      def idea_attributes(row)
        created = timestamp(row[COLUMNS[:created_at]])
        attributes = {
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'body_multiloc' => multiloc(row[COLUMNS[:description]]),
          'publication_status' => 'published',
          'created_at' => created,
          'published_at' => created,
          'submitted_at' => created,
          'updated_at' => timestamp(row[COLUMNS[:updated_at]]),
          'idea_status_code' => IdeaStatuses::DEFAULT_CODE
        }
        budget = present_value(row[COLUMNS[:budget_amount]])
        attributes['budget'] = budget.to_i if budget
        address = present_value(row[COLUMNS[:address]])
        attributes['location_description'] = address if address
        point = location_point_geojson(row[COLUMNS[:latitude]], row[COLUMNS[:longitude]])
        attributes['location_point_geojson'] = point if point
        attributes
      end
    end
  end
end
