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
#
module Analytics
  module Reporting
    class Phase < Analytics::ApplicationRecordView
      self.table_name = 'reporting_phases'
      self.primary_key = :id

      # Must give the visitors the phase insights show (Insights::VisitsService
      # for the phase's project and dates), or reports will disagree with them:
      # visitors with a pageview of the project from start_at up to, not
      # including, end_at.
      VISITORS_SQL = <<~SQL.squish
        SELECT COUNT(DISTINCT s.visitor_id)
        FROM reporting_phases ph
        JOIN reporting_pageviews pv
          ON pv.project_id = ph.project_id
          AND pv.created_at >= ph.start_at
          AND (ph.end_at IS NULL OR pv.created_at < ph.end_at)
        JOIN reporting_sessions s ON s.id = pv.session_id
        WHERE ph.id = '<phase id>'
      SQL

      def self.table_description
        <<~DOC.squish
          A phase is a consecutive step in a project's
          timeline with exactly one participation method.
          A phase has no pageviews of its own: count its visitors (reach) as
          the phase insights do, with #{VISITORS_SQL}. Use it exactly as given,
          replacing <phase id>. To leave out platform staff, as the insights
          can, add AND (s.highest_role IS NULL OR s.highest_role = 'user').
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
            can only enter it for participatory budgeting. 0 when none was
            entered (offline_voters_updated_at tells an entered 0 apart). The
            platform never shows a total of online and offline voters: it only
            uses online_voters_count + offline_voters_count to work out each
            input's share of voters in budgeting results. Report offline voters
            separately from online_voters_count, and say so if you add them
            together. Offline voters have no rows in any other table, so they
            can't be broken down.
          DOC
          'offline_voters_updated_at' => 'When an administrator last changed offline_voters_count (UTC), or NULL if never.'
        }
      end

      def self.foreign_keys
        { 'project_id' => 'reporting_projects.id' }
      end
    end
  end
end
