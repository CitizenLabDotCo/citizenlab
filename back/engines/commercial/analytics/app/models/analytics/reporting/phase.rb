# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_phases
#
#  id                            :uuid             primary key
#  project_id                    :uuid
#  title                         :text
#  title_multiloc                :jsonb
#  start_at                      :datetime
#  end_at                        :datetime
#  participation_method          :string
#  created_at                    :datetime
#  online_voters_count           :integer
#  manual_voters_amount          :integer
#  manual_voters_last_updated_at :datetime
#
module Analytics
  module Reporting
    class Phase < Analytics::ApplicationRecordView
      self.table_name = 'reporting_phases'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          A phase is a consecutive step in a project's
          timeline with exactly one participation method.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'project_id' => 'The project this phase belongs to.',
          'title' => 'Phase title, resolved to the platform primary locale.',
          'title_multiloc' => <<~DOC.squish,
            Phase title in all its languages, as a JSON object keyed by locale,
            for example {"en": "Vote on proposals"}. Read one locale with the ->>
            operator; prefer the plain title column unless a specific locale is needed.
          DOC
          'start_at' => 'When the phase starts (UTC).',
          'end_at' => 'When the phase ends (UTC). NULL means the phase is open-ended.',
          'participation_method' => <<~DOC.squish,
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
          'created_at' => 'When the phase was created by an admin (UTC), not when it starts (see start_at).',
          'online_voters_count' => <<~DOC.squish,
            For 'voting' phases, the number of people who submitted their votes
            on the platform, as the voting results show it. 0 for other phases.
            Use it, plus manual_voters_amount, for a phase's voter total. Count
            reporting_contributions vote rows only to break voters down (for
            example by demographics): those rows can miss a voter whose picked
            inputs were all deleted later, whom this count keeps.
          DOC
          'manual_voters_amount' => <<~DOC.squish,
            For 'voting' phases, the number of people who voted offline (for
            example on paper), as entered by an administrator. NULL when none was
            entered. The voter total the platform shows is online_voters_count +
            COALESCE(manual_voters_amount, 0). Offline voters have no rows in
            any other table, so they can't be broken down.
          DOC
          'manual_voters_last_updated_at' => 'When an administrator last changed manual_voters_amount (UTC), or NULL if never.'
        }
      end

      def self.foreign_keys
        { 'project_id' => 'reporting_projects.id' }
      end
    end
  end
end
