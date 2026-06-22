# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim participatory processes (and, for early migrations, assemblies) ──▶ Go Vocal `Project`.
    #
    # A process that belongs to a process group is nested under the corresponding folder by pointing
    # its `admin_publication_attributes.parent_attributes_ref` at the folder's nested
    # admin-publication hash. Publication status is derived from whether the process was published.
    #
    # Columns match the export's per-process `01---participatory-process.csv`. The
    # `participatory_process_group` column holds the group's `uid` (blank when the process isn't
    # grouped).
    class ProjectsExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        description: 'description',
        short_description: 'short_description',
        hero_image: 'hero_image',
        group: 'participatory_process_group',
        published_at: 'published_at',
        created_at: 'created_at',
        updated_at: 'updated_at'
      }.freeze

      def run
        rows.filter_map { |row| build_project(row) }
      end

      private

      def build_project(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        attributes = {
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'description_multiloc' => multiloc(row[COLUMNS[:description]]),
          'description_preview_multiloc' => plain_text_multiloc(row[COLUMNS[:short_description]]),
          'admin_publication_attributes' => admin_publication_attributes(row),
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        }
        hero = present_value(row[COLUMNS[:hero_image]])
        attributes['remote_header_bg_url'] = hero if hero

        ref_map.register(uid, Record.new('project', attributes))
      end

      # Decidim's `short_description` is HTML, but Go Vocal's `description_preview_multiloc` is a
      # plain-text teaser — strip all tags, dropping any locale left blank.
      def plain_text_multiloc(value)
        multiloc(value)
          .transform_values { |html| ActionController::Base.helpers.strip_tags(html).strip }
          .reject { |_, text| text.empty? }
      end

      def admin_publication_attributes(row)
        published = present_value(row[COLUMNS[:published_at]])
        ap = { 'publication_status' => published ? 'published' : 'draft' }

        group_uid = present_value(row[COLUMNS[:group]])
        if group_uid
          folder = ref_map.fetch(group_uid)
          # Share the folder's nested admin-publication hash object so the deserializer resolves the
          # parent once the folder has been created.
          ap['parent_attributes_ref'] = folder.attributes['admin_publication_attributes'] if folder
        end

        ap
      end
    end
  end
end
