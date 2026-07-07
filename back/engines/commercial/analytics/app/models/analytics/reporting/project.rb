# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_projects
#
#  id                 :uuid             primary key
#  title              :text
#  publication_status :string
#  start_at           :datetime
#  end_at             :datetime
#  folder_id          :uuid
#  hidden             :boolean
#  listed             :boolean
#
module Analytics
  module Reporting
    class Project < Analytics::ApplicationRecordView
      self.table_name = 'reporting_projects'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per project, the container in which all participation happens.
          A project consists of one or more phases (see reporting_phases). All
          timestamps are in UTC.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Project primary key. Joins to reporting_phases.project_id and reporting_pageviews.project_id.',
          'title' => 'Project title, resolved to the platform primary locale.',
          'publication_status' => <<~DOC.squish,
            Lifecycle state: 'draft' (not yet visible to residents), 'published'
            (live), or 'archived' (visible but closed). Count only 'published'
            and 'archived' projects unless explicitly asked about drafts.
          DOC
          'start_at' => 'Start of the earliest phase. NULL when the project has no phases yet.',
          'end_at' => <<~DOC.squish,
            End of the latest phase. NULL when the project has no phases yet or
            when any phase is open-ended, meaning the project has no planned end.
            A project is finished when end_at is in the past.
          DOC
          'folder_id' => 'The folder this project is grouped under, or NULL when not in a folder.',
          'hidden' => <<~DOC.squish,
            TRUE for internal system projects that residents never see as projects
            (for example the hidden project that holds the community monitor
            survey). Exclude hidden projects when counting projects, but their
            participation data is still meaningful.
          DOC
          'listed' => 'FALSE when the project is unlisted: live and reachable via direct link, but not shown in public project listings.'
        }
      end
    end
  end
end
