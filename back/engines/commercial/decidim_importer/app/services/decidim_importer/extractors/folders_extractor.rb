# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim participatory process groups (`01--participatory-process-groups.csv`) ──▶ Go Vocal
    # `ProjectFolders::Folder`.
    #
    # Each folder's nested `admin_publication_attributes` hash is referenced by projects placed inside it
    # via `parent_attributes_ref`. Process groups are single-level, so no hierarchy flattening; the
    # `metadata` JSON column (hashtag, group_url, scopes) is not mapped — no GV folder equivalent.
    #
    # A folder's description goes onto the Content Builder, so it is staged as a description-only
    # `project_folder_description` layout. The `FolderTitle`/`Published` widgets that complete the
    # standard folder layout need the folder id, which only exists once the template is applied, so
    # {ConsultationsFolder} finishes the layout post-import.
    class FoldersExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        description: 'description',
        hero_image: 'hero_image',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      FRAME_PROPS = { 'id' => 'e2e-content-builder-frame' }.freeze

      def run
        rows.filter_map { |row| build_folder(row) }
      end

      private

      def build_folder(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        attributes = {
          'title_multiloc' => title_multiloc(uid, row),
          'admin_publication_attributes' => { 'publication_status' => 'published' },
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        }
        hero = present_value(row[COLUMNS[:hero_image]])
        attributes['remote_header_bg_url'] = hero if hero

        folder = ref_map.register(uid, Record.new('project_folders/folder', attributes))
        register_description_layout(uid, folder, multiloc(row[COLUMNS[:description]]))
        folder
      end

      # Decidim lets a group be saved with every title locale blank, but a folder needs a title: such a
      # group gets a generic one, logged so the admins can rename the folder.
      def title_multiloc(uid, row)
        title = multiloc(row[COLUMNS[:title]])
        return title if title.present?

        adjust(uid, 'process group has no title: imported as an untitled folder')
        i18n_multiloc('untitled_folder', locales: [primary_locale])
      end

      def register_description_layout(uid, folder, description)
        return if description.blank?

        layout = Record.new('content_builder/layout', {
          'code' => ContentBuilder::LayoutProvisioningService::FOLDER_LAYOUT_CODE,
          'enabled' => true,
          'craftjs_json' => description_craftjs(description)
        })
        layout.reference('content_buildable', folder)
        ref_map.register("#{uid}-description-layout", layout)
      end

      # ROOT canvas holding a single `TextMultiloc`, keyed `TEXT` to match the slot the standard folder
      # layout keeps its description in.
      def description_craftjs(description)
        {
          'ROOT' => {
            'type' => 'div', 'nodes' => ['TEXT'], 'props' => FRAME_PROPS.dup, 'custom' => {},
            'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {}
          },
          'TEXT' => {
            'type' => { 'resolvedName' => 'TextMultiloc' }, 'nodes' => [], 'props' => { 'text' => description },
            'custom' => {}, 'hidden' => false, 'parent' => 'ROOT', 'isCanvas' => false,
            'displayName' => 'TextMultiloc', 'linkedNodes' => {}
          }
        }
      end
    end
  end
end
