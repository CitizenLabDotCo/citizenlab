# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_phases
#
#  id                        :uuid             primary key
#  project_id                :uuid
#  title                     :text
#  title_multiloc            :jsonb
#  start_at                  :datetime
#  end_at                    :datetime
#  participation_method      :string
#  created_at                :datetime
#  online_voters_count       :integer
#  offline_voters_count      :integer
#  offline_voters_updated_at :datetime
#  visitors_count            :bigint
#  non_staff_visitors_count  :bigint
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
            on the platform: the figure residents see on the phase as "people
            submitted their votes online". 0 for other phases. Report it as the
            phase's number of voters. Count reporting_contributions vote rows
            only to break voters down (for example by demographics): those rows
            can miss a voter whose picked inputs were all deleted later, whom
            this count keeps.
          DOC
          'offline_voters_count' => <<~DOC.squish,
            For 'voting' phases, the number of people who voted offline (for
            example on paper), as entered by an administrator. Administrators
            can only enter it for participatory budgeting. 0 for other phases,
            and 0 when none was entered (offline_voters_updated_at tells an
            entered 0 apart). For
            single and multiple voting there is no such count: admins enter only
            offline votes per input (reporting_inputs.offline_votes_count), with
            no number of people behind them. Never work out offline voters from
            offline votes. The
            platform never shows a total of online and offline voters: it only
            uses online_voters_count + offline_voters_count to work out each
            input's share of voters in budgeting results. Report offline voters
            separately from online_voters_count, and say so if you add them
            together. Offline voters have no rows in any other table, so they
            can't be broken down.
          DOC
          'offline_voters_updated_at' => <<~DOC.squish,
            When an administrator last changed offline_voters_count (UTC), or
            NULL if never. NULL for other phases.
          DOC
          'visitors_count' => <<~DOC.squish,
            The number of people who visited the phase's project while the phase
            ran, from start_at up to end_at: the phase's reach, as the phase
            insights show it. Use this column for a phase's visitors; a recount
            from reporting_pageviews will not match the insights.
          DOC
          'non_staff_visitors_count' => <<~DOC.squish
            visitors_count without platform staff (admins and moderators), as
            the phase insights show it when staff are excluded.
          DOC
        }
      end

      def self.foreign_keys
        { 'project_id' => 'reporting_projects.id' }
      end
    end
  end
end
