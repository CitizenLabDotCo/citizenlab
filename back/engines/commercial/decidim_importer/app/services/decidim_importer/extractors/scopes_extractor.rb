# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim scopes ──▶ Go Vocal `Area`.
    #
    # Decidim scopes are hierarchical (each has an optional `parent`); Go Vocal areas are flat, so the
    # hierarchy is flattened — every scope becomes a top-level area, parents included. Orderings are
    # assigned sequentially: Decidim's `weight` is unreliable (all zero in real exports) and Go Vocal's
    # `areas.ordering` is uniquely indexed, so reusing weight would collide. Scopes are registered under
    # their `uid` so a later pass could link them to projects/ideas (not done yet).
    class ScopesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        name: 'name',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      def run
        rows.each_with_index.filter_map { |row, index| build_area(row, index) }
      end

      private

      def build_area(row, ordering)
        uid = present_value(row[COLUMNS[:uid]])
        title = multiloc(row[COLUMNS[:name]])
        return nil if uid.nil? || title.empty?

        attributes = {
          'title_multiloc' => title,
          'ordering' => ordering,
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        }
        ref_map.register(uid, Record.new('area', attributes))
      end
    end
  end
end
