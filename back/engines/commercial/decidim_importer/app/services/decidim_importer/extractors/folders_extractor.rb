# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim process groups ──▶ Go Vocal `ProjectFolders::Folder`.
    #
    # Go Vocal folders are single-level, so a multi-level Decidim group hierarchy is **flattened**:
    # a child group's title is prefixed with its parent's title (planning decision). Each folder
    # carries a nested `admin_publication_attributes` hash that projects placed inside it reference
    # via `parent_attributes_ref`.
    class FoldersExtractor < BaseExtractor
      TABLE = 'decidim_participatory_process_groups'

      COLUMNS = {
        id: 'id',
        title: 'title',
        description: 'description',
        parent_id: 'parent_id',
        hero_image_url: 'hero_image_url',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      def run
        rows.filter_map { |row| build_folder(row) }
      end

      private

      def build_folder(row)
        id = present_value(row[COLUMNS[:id]])
        return nil if id.nil?

        attributes = {
          'title_multiloc' => flattened_title(row),
          'description_multiloc' => multiloc(row[COLUMNS[:description]]),
          'admin_publication_attributes' => { 'publication_status' => 'published' },
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        }
        hero = present_value(row[COLUMNS[:hero_image_url]])
        attributes['remote_header_bg_url'] = hero if hero

        ref_map.register(TABLE, id, Record.new('project_folders/folder', attributes))
      end

      # Prefix the parent group's title when nested, since Go Vocal can't represent the hierarchy.
      def flattened_title(row)
        own = multiloc(row[COLUMNS[:title]])
        parent_id = present_value(row[COLUMNS[:parent_id]])
        return own if parent_id.nil?

        parent = ref_map.fetch(TABLE, parent_id)
        return own if parent.nil?

        parent_title = parent.attributes['title_multiloc']
        own.each_with_object({}) do |(locale, text), acc|
          prefix = parent_title[locale]
          acc[locale] = prefix ? "#{prefix} / #{text}" : text
        end
      end
    end
  end
end
