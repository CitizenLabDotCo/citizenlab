# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim participatory process groups (`participatory-processes/01--participatory-process-groups.csv`)
    # ──▶ Go Vocal `ProjectFolders::Folder`.
    #
    # Each folder carries a nested `admin_publication_attributes` hash that projects placed inside
    # it reference via `parent_attributes_ref`. Decidim process groups are a single-level list, so
    # no hierarchy flattening is needed; the `metadata` JSON column (hashtag, group_url, scope
    # descriptors) is not yet mapped — folder semantics on GV don't carry the same fields.
    class FoldersExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        description: 'description',
        hero_image: 'hero_image',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      def run
        rows.filter_map { |row| build_folder(row) }
      end

      private

      def build_folder(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        attributes = {
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'description_multiloc' => multiloc(row[COLUMNS[:description]]),
          'admin_publication_attributes' => { 'publication_status' => 'published' },
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        }
        hero = present_value(row[COLUMNS[:hero_image]])
        attributes['remote_header_bg_url'] = hero if hero

        ref_map.register(uid, Record.new('project_folders/folder', attributes))
      end
    end
  end
end
