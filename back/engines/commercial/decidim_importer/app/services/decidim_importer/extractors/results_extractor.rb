# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim accountability results (`03---results.csv`) ──▶ Go Vocal `Idea`s in the accountability
    # component's ideation phase (the component becomes that phase via {PhaseProjector}).
    #
    # Each result becomes an idea (author-less — results have no author) tagged with its category, in
    # the phase registered under the component uid. A bulleted `Progress` (the percentage) + `Status`
    # (`<name> - <description>`) block is prepended to the description. The status comes from the
    # component's statuses (`02---statuses.csv`): the progress % is mapped to them — because a result's
    # stored `status` and its actual `progress` can disagree — preferring the result's own status when
    # it sits at that %. The `Progress`/`Status` labels are translatable back-end strings.
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

      # The description with a bulleted `Progress` + `Status` block prepended, per locale. Unchanged when
      # the result has no progress. The trailing space after the `%` keeps the two lines from running
      # together when the body is flattened to plain text.
      def progress_description(row)
        description = multiloc(row[COLUMNS[:description]])
        pct = percent(row[COLUMNS[:progress]])
        return description if pct.nil?

        status = status_for(row, pct)
        locales = description.keys.presence || [primary_locale]
        progress_label = label_multiloc('accountability_progress', locales)
        status_label = label_multiloc('accountability_status', locales)
        locales.each_with_object({}) do |locale, acc|
          items = "<li><strong>#{at(progress_label, locale)}:</strong> #{pct}% </li>"
          text = status_text(status, locale)
          items << "<li><strong>#{at(status_label, locale)}:</strong> #{text}</li>" if text
          acc[locale] = "<ul>#{items}</ul>#{description[locale]}"
        end
      end

      # The status a result's progress maps to: the component status(es) at that exact %, preferring the
      # result's own status when it's one of them; falling back to the result's own status, or nil.
      def status_for(row, pct)
        statuses = statuses_for(present_value(row[COLUMNS[:component]]))
        return nil if statuses.empty?

        own = statuses.find { |status| status[:uid] == present_value(row[COLUMNS[:status]]) }
        at_pct = statuses.select { |status| status[:pct] == pct }
        (own if own && at_pct.include?(own)) || at_pct.first || own
      end

      # The status line text for a locale: `<name> - <description>` (or just the name when it has no
      # description), or nil when there is no status.
      def status_text(status, locale)
        return nil unless status

        name = at(status[:name], locale)
        return nil if name.nil?

        description = at(status[:description], locale)
        description.present? ? "#{name} - #{description}" : name
      end

      # A multiloc value for a locale, falling back to the first value present.
      def at(multiloc, locale)
        multiloc[locale] || multiloc.values.first
      end

      # The translatable label per locale, always populated: a locale without its own translation falls
      # back to the English string (rather than being dropped) so the label never renders empty.
      def label_multiloc(key, locales)
        full_key = "decidim_importer.#{key}"
        default = I18n.t(full_key, locale: :en)
        locales.index_with { |locale| I18n.t(full_key, locale: locale, default: default) }
      end

      def statuses_for(component_uid)
        statuses_by_component[component_uid] || []
      end

      def statuses_by_component
        @statuses_by_component ||= @statuses.group_by { |row| row['decidim_component'] }.transform_values do |rows|
          rows.map do |row|
            { uid: present_value(row['uid']), pct: percent(row['progress']),
              name: multiloc(row['name']), description: multiloc(row['description']) }
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
