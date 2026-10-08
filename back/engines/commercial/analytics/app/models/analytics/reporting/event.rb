# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_events
#
#  id                        :uuid             primary key
#  project_id                :uuid
#  title                     :text
#  title_multiloc            :jsonb
#  start_at                  :datetime
#  end_at                    :datetime
#  location                  :text
#  location_details          :text
#  online_link               :text
#  external_registration_url :text
#  attendees_count           :integer
#  maximum_attendees         :integer
#  created_at                :datetime
#
module Analytics
  module Reporting
    class Event < Analytics::ApplicationRecordView
      self.table_name = 'reporting_events'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per event: an in-person or online meeting organised within a
          project. People register for an event on the platform; each
          registration is a reporting_contributions row with type 'attendance'
          and parent_id set to the event id.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'project_id' => 'The project the event belongs to.',
          'title' => 'Event title, resolved to the platform primary locale.',
          'title_multiloc' => <<~DOC.squish,
            Event title in all its languages, as a JSON object keyed by locale,
            for example {"en": "Info session"}. Read one locale with the ->>
            operator; prefer the plain title column unless a specific locale is needed.
          DOC
          'start_at' => 'When the event starts (UTC).',
          'end_at' => 'When the event ends (UTC).',
          'location' => 'Where the event takes place: the address shown on the event page. NULL for online-only events.',
          'location_details' => <<~DOC.squish,
            Extra location details shown below the address, such as a building,
            room or floor, resolved to the platform primary locale. NULL when none.
          DOC
          'online_link' => 'Link to join the event online, or NULL when it is not held online.',
          'external_registration_url' => <<~DOC.squish,
            When set, people register on this external site instead of on the
            platform, so the event has no attendance rows and attendees_count
            stays 0. Report its registrations as unknown, not as zero.
          DOC
          'attendees_count' => 'Number of people registered on the platform. Equals the attendance rows for this event in reporting_contributions.',
          'maximum_attendees' => 'Registration capacity, or NULL when unlimited.',
          'created_at' => 'When the event was created by an admin (UTC), not when it takes place (see start_at).'
        }
      end

      def self.foreign_keys
        { 'project_id' => 'reporting_projects.id' }
      end
    end
  end
end
