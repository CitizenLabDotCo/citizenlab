# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_phases
#
#  id                   :uuid             primary key
#  project_id           :uuid
#  title                :text
#  start_at             :datetime
#  end_at               :datetime
#  participation_method :string
#
module Analytics
  module Reporting
    class Phase < Analytics::ApplicationRecordView
      self.table_name = 'reporting_phases'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per phase. A phase is a consecutive step in a project's
          timeline with exactly one participation method. All timestamps are in
          UTC.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Phase primary key.',
          'project_id' => 'The project this phase belongs to. Joins to reporting_projects.id.',
          'title' => 'Phase title, resolved to the platform primary locale.',
          'start_at' => 'When the phase starts.',
          'end_at' => 'When the phase ends. NULL means the phase is open-ended.',
          'participation_method' => <<~DOC.squish
            How residents participate in this phase. One of: 'ideation' (posting
            and discussing ideas), 'proposals' (resident-initiated proposals),
            'voting' (voting or participatory budgeting over ideas),
            'native_survey' (survey built on the platform),
            'community_monitor_survey' (recurring sentiment survey), 'survey'
            (embedded third-party survey), 'poll' (quick multiple-choice poll),
            'volunteering' (signing up for causes), 'common_ground' (reacting to
            statements), 'document_annotation' (annotating a document), or
            'information' (no participation, informational content only).
          DOC
        }
      end
    end
  end
end
