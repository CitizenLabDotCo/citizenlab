# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Shared idea-join helpers for extractors turning Decidim items into ideas: the `ideas_phase` link
    # surfacing the idea in its phase, the `ideas_input_topic` tag to its category's `InputTopic`, and the
    # `IdeaImport` holding the Decidim data an idea has no field for.
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

      # Every imported idea gets an `IdeaImport`. It marks the idea as imported and keeps Decidim data
      # with no Go Vocal field in `extra_info`. Returns the record so that data can be added to it.
      def register_idea_import(uid, idea)
        idea_import = Record.new('bulk_import_ideas/idea_import', { 'extra_info' => {} })
        idea_import.reference('idea', idea)
        ref_map.register("#{uid}-idea-import", idea_import)
      end

      # Parks a pointer back to the `Area` the idea's Decidim scope became. Go Vocal ideas have no area
      # association (areas hang off projects/users), so the link lives in the idea import's `extra_info`
      # under the `decidim_scope` key. The value is *seeded* with the area record's own (shared) attributes
      # hash: {ScopesExtractor} imported the scope as an area, and the area's real id only exists after the
      # template is applied, so {DecidimImporter::Importer.resolve_scope_areas!} swaps this hash for
      # `{ 'area_id' => …, 'title_multiloc' => … }` once it does. No-op when the row has no scope or the
      # scope wasn't imported as an area.
      def register_scope_area(idea_import, scope_uid)
        area = ref_map.fetch(present_value(scope_uid))
        return unless area&.model_name == 'area'

        idea_import.attributes['extra_info']['decidim_scope'] = area.attributes
      end

      # Parks the proposal's *original* Decidim status (its token + citizen-facing label) in the idea
      # import's `extra_info` under the `decidim_status` key, for provenance — the Go Vocal status the
      # proposal was mapped onto is the idea's own `idea_status`, so this only needs the source value.
      # Unlike {#register_scope_area} it stores literal data, so no post-import resolution is needed. No-op
      # when neither token nor label is known (e.g. a proposal with a blank state). See {ProposalStatusResolver}.
      def register_decidim_status(idea_import, decision)
        original = {}
        original['token'] = decision.token if decision.token.present?
        original['title_multiloc'] = decision.original_title_multiloc if decision.original_title_multiloc.present?
        return if original.empty?

        idea_import.attributes['extra_info']['decidim_status'] = original
      end
    end
  end
end
