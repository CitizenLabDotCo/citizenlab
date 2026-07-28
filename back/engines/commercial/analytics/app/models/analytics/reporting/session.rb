# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_sessions
#
#  id           :uuid             primary key
#  started_at   :datetime
#  user_id      :uuid
#  anonymous_id :string
#  visitor_id   :text
#  highest_role :string
#  device       :string
#  referrer     :string
#
module Analytics
  module Reporting
    class Session < Analytics::ApplicationRecordView
      self.table_name = 'reporting_sessions'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per browser session on the platform. Bot traffic is filtered
          out before sessions are recorded, and sessions are recorded regardless
          of cookie consent. Count visitors as COUNT(DISTINCT visitor_id): this
          slightly overcounts unique people because anonymous_id changes at
          calendar-month boundaries.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'started_at' => 'When the session started (UTC).',
          'user_id' => 'The signed-in user, or NULL for signed-out visitors.',
          'anonymous_id' => <<~DOC.squish,
            Privacy-preserving fingerprint of the visitor. Stable only within a
            calendar month, so distinct counts across month boundaries overcount
            unique people.
          DOC
          'visitor_id' => <<~DOC.squish,
            The canonical visitor identity: user_id when signed in, otherwise
            anonymous_id. Use COUNT(DISTINCT visitor_id) for visitor counts, and
            for visitor counts per project join reporting_pageviews on its
            project_id.
          DOC
          'highest_role' => <<~DOC.squish,
            Highest platform role of the signed-in user at session start: one of
            'super_admin', 'admin', 'space_moderator', 'project_folder_moderator',
            'project_moderator', 'user', or NULL for signed-out visitors. Filter
            to 'user' (or NULL) to measure resident traffic without platform staff.
          DOC
          'device' => "Device class: 'mobile', 'tablet', or 'desktop_or_other'. NULL when unknown.",
          'referrer' => 'Full URL the visitor came from, or NULL for direct visits.'
        }
      end

      def self.foreign_keys
        { 'user_id' => 'reporting_users.id' }
      end
    end
  end
end
