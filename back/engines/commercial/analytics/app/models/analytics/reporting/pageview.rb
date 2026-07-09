# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_pageviews
#
#  id         :uuid             primary key
#  session_id :uuid
#  created_at :datetime
#  path       :string
#  project_id :uuid
#  locale     :text
#
module Analytics
  module Reporting
    class Pageview < Analytics::ApplicationRecordView
      self.table_name = 'reporting_pageviews'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per pageview: a single page displayed to a visitor. Join to
          reporting_sessions via session_id for visitor identity, device, and referrer.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'session_id' => 'The browser session this pageview belongs to.',
          'created_at' => 'When the page was displayed (UTC).',
          'path' => "URL path of the page, starting with the locale segment, for example '/en/projects/my-project'.",
          'project_id' => <<~DOC.squish,
            The project the page belongs to, or NULL for pages outside any
            project (such as the home page). Use this to count visitors or
            pageviews per project.
          DOC
          'locale' => <<~DOC.squish
            Interface language of the pageview, parsed from the path (for
            example 'en' or 'nl-BE'). NULL when the path carries no currently
            configured locale.
          DOC
        }
      end

      def self.foreign_keys
        { 'session_id' => 'reporting_sessions.id', 'project_id' => 'reporting_projects.id' }
      end
    end
  end
end
