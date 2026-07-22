# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim `meetings` components (each meeting in its own `NN---decidim--meetings--meeting--N/`
    # subdirectory) ──▶ Go Vocal project-level `Event`.
    #
    # A Decidim meeting carries a title, description, a time window and a location (a free-text address
    # plus lat/lng); Go Vocal models the equivalent as an `Event` scoped to the process's project. The
    # map pin travels through the tenant-template pipeline as `location_point_geojson` (a GeoJSON Hash),
    # exactly as `Idea` does — the deserializer mass-assigns it, routing through `GeoJsonHelpers`.
    #
    # The meeting row is stamped by {ExportReader} with its owning process
    # (`decidim_participatory_process`), so the project is looked up in the ref map. Unpublished
    # (Decidim draft) and withdrawn meetings are skipped — events are always live. A meeting's
    # comments/followers/registration/poll data has no Go Vocal event equivalent and is not imported;
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
        start_time: 'start_time',
        end_time: 'end_time',
        published_at: 'published_at',
        withdrawn: 'withdrawn',
        created_at: 'created_at',
        updated_at: 'updated_at',
        process: 'decidim_participatory_process'
      }.freeze

      attr_reader :skipped

      def initialize(*args, **kwargs)
        super
        @skipped = []
      end

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

      # A GeoJSON point Hash `{ 'type' => 'Point', 'coordinates' => [lng, lat] }` (GeoJSON is x/y, i.e.
      # longitude first), when both coordinates parse as numbers. Nil otherwise — most in-person meetings
      # still carry an address even without a pin.
      def location_point_geojson(row)
        lat = Float(present_value(row[COLUMNS[:latitude]]), exception: false)
        lng = Float(present_value(row[COLUMNS[:longitude]]), exception: false)
        return nil unless lat && lng

        { 'type' => 'Point', 'coordinates' => [lng, lat] }
      end

      def skip(uid, reason)
        @skipped << { uid: uid, reason: reason }
        nil
      end
    end
  end
end
