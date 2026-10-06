# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_reports
#
#  id                :uuid             primary key
#  name              :string
#  phase_id          :uuid
#  project_id        :uuid
#  visible           :boolean
#  year              :integer
#  quarter           :integer
#  community_monitor :boolean
#  created_at        :datetime
#  updated_at        :datetime
#
module Analytics
  module Reporting
    class Report < Analytics::ApplicationRecordView
      self.table_name = 'reporting_reports'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per report built in the platform's report builder. Reports
          linked to a phase are how a project shares its results with
          residents: residents see one only when it is visible and its phase
          has started (join reporting_phases and compare start_at with now()).
          Reports without a phase are internal to administrators. Use this to
          measure how often projects close the loop with a published report.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'name' => 'Report name given by administrators. Often NULL for phase reports.',
          'phase_id' => 'The phase the report is published on, or NULL for an internal report.',
          'project_id' => 'The project of that phase, or NULL for an internal report.',
          'visible' => <<~DOC.squish,
            TRUE when administrators turned on publication to residents. Always
            FALSE for reports without a phase. A visible report on a phase that
            has not started yet is not shown until the phase starts.
          DOC
          'year' => 'For community monitor quarterly reports, the year the report covers. NULL otherwise.',
          'quarter' => 'For community monitor quarterly reports, the quarter (1-4) the report covers. NULL otherwise.',
          'community_monitor' => 'TRUE for community monitor quarterly reports.',
          'created_at' => 'When the report was created (UTC).',
          'updated_at' => 'When the report was last edited (UTC).'
        }
      end

      def self.foreign_keys
        {
          'phase_id' => 'reporting_phases.id',
          'project_id' => 'reporting_projects.id'
        }
      end
    end
  end
end
