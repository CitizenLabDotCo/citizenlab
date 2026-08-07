# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Shared idea-join helpers for extractors turning Decidim items into ideas: the `ideas_phase` link
    # surfacing the idea in its phase, and the `ideas_input_topic` tag to its category's `InputTopic`.
    module IdeaAssociations
      private

      def register_ideas_phase(uid, idea, phase)
        join = Record.new('ideas_phase', {})
        join.reference('idea', idea)
        join.reference('phase', phase)
        ref_map.register("#{uid}-ideas-phase", join)
      end

      # A GeoJSON `Point` for the idea's `location_point_geojson` from the export's `latitude`/`longitude`
      # columns, or nil when either is blank or non-numeric. GeoJSON orders coordinates `[lon, lat]`.
      def location_point_geojson(latitude, longitude)
        lat = present_value(latitude)
        lon = present_value(longitude)
        return nil if lat.nil? || lon.nil?

        { 'type' => 'Point', 'coordinates' => [Float(lon), Float(lat)] }
      rescue ArgumentError
        nil
      end

      # Tags the idea with the input topic imported from `category_uid`. No-op when there's no category
      # or it wasn't imported as an `input_topic`.
      def register_input_topic(uid, idea, category_uid)
        topic = ref_map.fetch(present_value(category_uid))
        return unless topic&.model_name == 'input_topic'

        join = Record.new('ideas_input_topic', {})
        join.reference('idea', idea)
        join.reference('input_topic', topic)
        ref_map.register("#{uid}-ideas-input-topic", join)
      end
    end
  end
end
