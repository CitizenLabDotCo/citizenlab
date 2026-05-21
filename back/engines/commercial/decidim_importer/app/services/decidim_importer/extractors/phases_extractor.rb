# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim steps ──▶ Go Vocal `Phase`.
    #
    # For the base-scaffold iteration every step is imported as an **information** phase (title +
    # description + dates only). Decidim steps are sequential and non-overlapping, which matches Go
    # Vocal's timeline, so dates carry over directly. Steps with no usable dates are skipped and
    # reported so the client can correct them before re-import.
    class PhasesExtractor < BaseExtractor
      TABLE = 'decidim_participatory_process_steps'
      PROJECT_TABLE = ProjectsExtractor::TABLE

      COLUMNS = {
        id: 'id',
        process_id: 'decidim_participatory_process_id',
        title: 'title',
        description: 'description',
        start_date: 'start_date',
        end_date: 'end_date',
        position: 'position'
      }.freeze

      attr_reader :skipped

      def initialize(*args, **kwargs)
        super
        @skipped = []
      end

      def run
        rows
          .sort_by { |row| present_value(row[COLUMNS[:position]]).to_i }
          .filter_map { |row| build_phase(row) }
      end

      private

      def build_phase(row)
        id = present_value(row[COLUMNS[:id]])
        process_id = present_value(row[COLUMNS[:process_id]])
        return nil if id.nil? || process_id.nil?

        project = ref_map.fetch(PROJECT_TABLE, process_id)
        if project.nil?
          @skipped << { id: id, reason: "no project for process #{process_id}" }
          return nil
        end

        start_at = present_value(row[COLUMNS[:start_date]])
        if start_at.nil?
          # Dates may be recoverable from the Decidim admin log; flagged for manual review meanwhile.
          @skipped << { id: id, reason: 'missing start_date' }
          return nil
        end

        attributes = {
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'description_multiloc' => multiloc(row[COLUMNS[:description]]),
          'participation_method' => 'information',
          'start_at' => start_at,
          'end_at' => present_value(row[COLUMNS[:end_date]])
        }

        record = Record.new('phase', attributes)
        record.reference('project', project)
        ref_map.register(TABLE, id, record)
      end
    end
  end
end
