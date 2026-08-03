# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim `meetings` components (one meeting per subdirectory) ──▶ Go Vocal project-level `Event`.
    #
    # A meeting's title, description, time window, location (address + lat/lng) and attendee count map
    # onto an `Event` scoped to the process's project. The map pin travels as `location_point_geojson`
    # (a GeoJSON Hash), mass-assigned by the deserializer through `GeoJsonHelpers`, exactly as `Idea` does.
    #
    # Unpublished (Decidim draft) and withdrawn meetings are skipped — events are always live. A
    # meeting's comments/followers/registration/poll data has no event equivalent and isn't imported;
    # its attachments are handled by {Extractors::MeetingAttachmentsExtractor}.
    class MeetingsExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        description: 'description',
        location: 'location',
        address: 'address',
        latitude: 'latitude',
        longitude: 'longitude',
        online_meeting_url: 'online_meeting_url',
        attendees_count: 'attendees_count',
        start_time: 'start_time',
        end_time: 'end_time',
        published_at: 'published_at',
        withdrawn: 'withdrawn',
        created_at: 'created_at',
        updated_at: 'updated_at',
        process: 'decidim_participatory_process'
      }.freeze

      def run
        rows.filter_map { |row| build_event(row) }
      end

      private

      def build_event(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        project = ref_map.fetch(present_value(row[COLUMNS[:process]]))
        return skip(uid, 'no project for meeting') if project.nil?
        return skip(uid, 'unpublished meeting') if present_value(row[COLUMNS[:published_at]]).nil?
        return skip(uid, 'withdrawn meeting') if truthy?(row[COLUMNS[:withdrawn]])

        title = multiloc(row[COLUMNS[:title]])
        return skip(uid, 'meeting has no title') if title.empty?

        event = Record.new('event', event_attributes(row, title))
        event.reference('project', project)
        ref_map.register(uid, event)
      end

      def event_attributes(row, title)
        attributes = {
          'title_multiloc' => title,
          'description_multiloc' => multiloc(row[COLUMNS[:description]]),
          'location_multiloc' => multiloc(row[COLUMNS[:location]]),
          'start_at' => timestamp(row[COLUMNS[:start_time]]),
          'end_at' => timestamp(row[COLUMNS[:end_time]]),
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        }
        address = present_value(row[COLUMNS[:address]])
        attributes['address_1'] = address if address
        online_link = online_link_for(row)
        attributes['online_link'] = online_link if online_link
        attendees = present_value(row[COLUMNS[:attendees_count]])
        attributes['attendees_count'] = attendees.to_i if attendees
        point = location_point_geojson(row)
        attributes['location_point_geojson'] = point if point
        attributes
      end

      # Only an absolute http(s) URL is a valid `online_link` (the model url-validates it); anything else
      # (blank, or a Decidim placeholder) is left off.
      def online_link_for(row)
        url = present_value(row[COLUMNS[:online_meeting_url]])
        url if url&.match?(%r{\Ahttps?://}i)
      end

      # A GeoJSON point Hash `{ 'type' => 'Point', 'coordinates' => [lng, lat] }` (GeoJSON is lng-first),
      # when both coordinates parse as numbers. Nil otherwise.
      def location_point_geojson(row)
        lat = Float(present_value(row[COLUMNS[:latitude]]), exception: false)
        lng = Float(present_value(row[COLUMNS[:longitude]]), exception: false)
        return nil unless lat && lng

        { 'type' => 'Point', 'coordinates' => [lng, lat] }
      end
    end
  end
end
