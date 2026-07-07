# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim accountability results (`03---results.csv`) ──▶ Go Vocal `Idea`s in the accountability
    # component's ideation phase (the component becomes that phase via {PhaseProjector}).
    #
    # Each result becomes an idea (author-less — results have no author) tagged with its category, in
    # the phase registered under the component uid. Its `progress` (a percentage) is prepended to the
    # description as a bold line, together with the matching status's title: the progress % is mapped to
    # the component's statuses (`02---statuses.csv`) — because a result's stored `status` and its actual
    # `progress` can disagree — preferring the result's own status when it sits at that %.
    class ResultsExtractor < BaseExtractor
      include IdeaAssociations

      COLUMNS = {
        uid: 'uid',
        process: 'decidim_participatory_process',
        component: 'decidim_component',
        category: 'category',
        title: 'title',
        description: 'description',
        status: 'status',
        progress: 'progress',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      # @param statuses [Array<Hash>] the accountability status rows (`uid, name, progress,
      #   decidim_component`), used to title each result's progress line.
      def initialize(*, statuses: [], **)
        super(*, **)
        @statuses = statuses
        @skipped = []
      end

      attr_reader :skipped

      def run
        rows.filter_map { |row| build_result(row) }
      end

      private

      def build_result(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        project = ref_map.fetch(present_value(row[COLUMNS[:process]]))
        phase = ref_map.fetch(present_value(row[COLUMNS[:component]]))
        if project.nil? || phase.nil?
          @skipped << { uid: uid, reason: 'no project/phase for result' }
          return nil
        end

        idea = Record.new('idea', idea_attributes(row))
        idea.reference('project', project)
        ref_map.register(uid, idea)

        register_ideas_phase(uid, idea, phase)
        register_input_topic(uid, idea, row[COLUMNS[:category]])
        idea
      end

      def idea_attributes(row)
        created = timestamp(row[COLUMNS[:created_at]])
        {
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'body_multiloc' => progress_description(row),
          'publication_status' => 'published',
          'created_at' => created,
          'published_at' => created,
          'submitted_at' => created,
          'updated_at' => timestamp(row[COLUMNS[:updated_at]]),
          # Results carry no Decidim proposal state; the real progress/status goes in the description.
          'idea_status_code' => IdeaStatuses::DEFAULT_CODE
        }
      end

      # The description with the progress line prepended: `<progress>%` plus the title of the status the
      # progress maps to. Unchanged when the result has no progress.
      def progress_description(row)
        description = multiloc(row[COLUMNS[:description]])
        pct = percent(row[COLUMNS[:progress]])
        return description if pct.nil?

        title = status_title(row, pct)
        (description.keys | title.keys | [primary_locale]).each_with_object({}) do |locale, acc|
          label = title[locale] || title.values.first
          heading = label ? "#{label} — #{pct}%" : "#{pct}%"
          acc[locale] = "<p><strong>#{heading}</strong></p>#{description[locale]}"
        end
      end

      # The status title (multiloc) for a result's progress: the component status(es) at that exact %,
      # preferring the result's own status when it's one of them; falling back to the result's own
      # status otherwise, or `{}` when nothing matches.
      def status_title(row, pct)
        statuses = statuses_for(present_value(row[COLUMNS[:component]]))
        return {} if statuses.empty?

        own = statuses.find { |status| status[:uid] == present_value(row[COLUMNS[:status]]) }
        at_pct = statuses.select { |status| status[:pct] == pct }
        chosen = (own if own && at_pct.include?(own)) || at_pct.first || own
        chosen&.fetch(:name) || {}
      end

      def statuses_for(component_uid)
        statuses_by_component[component_uid] || []
      end

      def statuses_by_component
        @statuses_by_component ||= @statuses.group_by { |row| row['decidim_component'] }.transform_values do |rows|
          rows.map do |row|
            { uid: present_value(row['uid']), pct: percent(row['progress']), name: multiloc(row['name']) }
          end
        end
      end

      # A progress value (`"100.0"`, `"40"`) as a rounded integer percent, or nil when blank.
      def percent(value)
        present_value(value)&.to_f&.round
      end
    end
  end
end
