# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim steps ──▶ Go Vocal `Phase`.
    #
    # For the base-scaffold iteration every step is imported as an **information** phase (title +
    # description + dates only). Decidim steps are sequential and non-overlapping, which matches Go
    # Vocal's timeline, so dates carry over directly. Steps with no usable dates are skipped and
    # reported so the client can correct them before re-import.
    #
    # NOTE: column names are still assumed — the participatory-process-steps CSV isn't part of the
    # first sample export. The `process` column is expected to be the project's `uid`.
    class PhasesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        process: 'decidim_participatory_process',
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
        uid = present_value(row[COLUMNS[:uid]])
        process_uid = present_value(row[COLUMNS[:process]])
        return nil if uid.nil? || process_uid.nil?

        project = ref_map.fetch(process_uid)
        if project.nil?
          @skipped << { uid: uid, reason: "no project for process #{process_uid}" }
          return nil
        end

        start_at = present_value(row[COLUMNS[:start_date]])
        if start_at.nil?
          # Dates may be recoverable from the Decidim admin log; flagged for manual review meanwhile.
          @skipped << { uid: uid, reason: 'missing start_date' }
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
        ref_map.register(uid, record)
      end
    end
  end
end
