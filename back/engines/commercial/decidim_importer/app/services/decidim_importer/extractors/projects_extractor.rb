# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim participatory processes (and, for early migrations, assemblies) ──▶ Go Vocal `Project`.
    #
    # A process that belongs to a process group is nested under the corresponding folder by pointing
    # its `admin_publication_attributes.parent_attributes_ref` at the folder's nested
    # admin-publication hash. Publication status is derived from whether the process was published.
    class ProjectsExtractor < BaseExtractor
      TABLE = 'decidim_participatory_processes'
      FOLDER_TABLE = FoldersExtractor::TABLE

      COLUMNS = {
        id: 'id',
        title: 'title',
        description: 'description',
        short_description: 'short_description',
        hero_image_url: 'hero_image_url',
        group_id: 'decidim_participatory_process_group_id',
        published_at: 'published_at',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      def run
        rows.filter_map { |row| build_project(row) }
      end

      private

      def build_project(row)
        id = present_value(row[COLUMNS[:id]])
        return nil if id.nil?

        attributes = {
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'description_multiloc' => multiloc(row[COLUMNS[:description]]),
          'description_preview_multiloc' => multiloc(row[COLUMNS[:short_description]]),
          'admin_publication_attributes' => admin_publication_attributes(row),
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        }
        hero = present_value(row[COLUMNS[:hero_image_url]])
        attributes['remote_header_bg_url'] = hero if hero

        ref_map.register(TABLE, id, Record.new('project', attributes))
      end

      def admin_publication_attributes(row)
        published = present_value(row[COLUMNS[:published_at]])
        ap = { 'publication_status' => published ? 'published' : 'draft' }

        group_id = present_value(row[COLUMNS[:group_id]])
        if group_id
          folder = ref_map.fetch(FOLDER_TABLE, group_id)
          # Share the folder's nested admin-publication hash object so the deserializer resolves the
          # parent once the folder has been created.
          ap['parent_attributes_ref'] = folder.attributes['admin_publication_attributes'] if folder
        end

        ap
      end
    end
  end
end
