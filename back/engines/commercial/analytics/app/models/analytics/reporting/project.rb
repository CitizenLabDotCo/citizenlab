# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_projects
#
#  id                    :uuid             primary key
#  title                 :text
#  title_multiloc        :jsonb
#  publication_status    :string
#  start_at              :datetime
#  end_at                :datetime
#  folder_id             :uuid
#  hidden                :boolean
#  listed                :boolean
#  visible_to            :string
#  first_published_at    :datetime
#  created_at            :datetime
#  folder_title          :text
#  topics                :text             is an Array
#  areas                 :text             is an Array
#  participation_methods :text             is an Array
#
module Analytics
  module Reporting
    class Project < Analytics::ApplicationRecordView
      self.table_name = 'reporting_projects'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per project, the container in which all participation happens.
          A project consists of one or more phases (see reporting_phases).
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'title' => 'Project title, resolved to the platform primary locale.',
          'title_multiloc' => <<~DOC.squish,
            Project title in all its languages, as a JSON object keyed by locale,
            for example {"en": "Budget 2026"}. Read one locale with the ->>
            operator; prefer the plain title column unless a specific locale is needed.
          DOC
          'publication_status' => <<~DOC.squish,
            Lifecycle state: 'draft' (not yet visible to residents), 'published'
            (live), or 'archived' (visible but closed). Count only 'published'
            and 'archived' projects unless explicitly asked about drafts.
          DOC
          'start_at' => 'Start of the earliest phase (UTC). NULL when the project has no phases yet.',
          'end_at' => <<~DOC.squish,
            End of the latest phase (UTC). NULL when the project has no phases yet or
            when any phase is open-ended, meaning the project has no planned end.
            A project is finished when end_at is in the past.
          DOC
          'folder_id' => 'The folder this project is grouped under, or NULL when not in a folder. Its name is in folder_title.',
          'hidden' => <<~DOC.squish,
            TRUE for internal system projects that residents never see as projects, currently
            used for the project that holds the community monitor survey. Exclude hidden projects
            when counting projects, but their participation data is still meaningful.
          DOC
          'listed' => 'An unlisted project is never shown in resident-facing project listings, only accessible via direct link.',
          'visible_to' => <<~DOC.squish,
            Who can see the project: 'public' (everyone), 'groups' (only members
            of selected user groups), or 'admins' (only admins and moderators).
          DOC
          'first_published_at' => 'When the project first went live (UTC). NULL for projects that were never published.',
          'created_at' => 'When the project was created as a draft (UTC), which can be well before first_published_at.',
          'folder_title' => 'Title of the folder the project is in, resolved to the platform primary locale. NULL when not in a folder.',
          'topics' => <<~DOC.squish,
            The project's topics (themes such as 'Mobility' or 'Nature'), resolved
            to the platform primary locale. An empty array when none. Filter
            with 'Mobility' = ANY(topics), or count per topic with
            unnest(topics). Not the same as the tags on inputs (see reporting_input_tags).
          DOC
          'areas' => <<~DOC.squish,
            The geographic areas the project is about, resolved to the platform
            primary locale. A project that admins marked as being about all
            areas lists every area, matching how the platform filters projects
            by area. An empty array when none. Filter with 'North' = ANY(areas).
          DOC
          'participation_methods' => <<~DOC.squish
            The distinct participation methods of the project's phases, in the
            order they first appear on the timeline (see
            reporting_phases.participation_method for values). An empty array
            when the project has no phases.
          DOC
        }
      end

      def self.foreign_keys
        {}
      end
    end
  end
end
