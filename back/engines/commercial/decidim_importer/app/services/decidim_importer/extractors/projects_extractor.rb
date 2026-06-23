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

        # The Decidim `description` is not imported into `description_multiloc`; it becomes the
        # TextMultiloc block of a Content Builder project-description layout instead (see
        # {DescriptionLayoutExtractor}). Only the plain-text preview is kept on the project.
        attributes = {
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'description_preview_multiloc' => plain_text_multiloc(row[COLUMNS[:short_description]]),
          'admin_publication_attributes' => admin_publication_attributes(row),
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        }
        hero = present_value(row[COLUMNS[:hero_image]])
        attributes['remote_header_bg_url'] = hero if hero

        project = ref_map.register(uid, Record.new('project', attributes))
        register_card_image(uid, project, hero) if hero
        project
      end

      # Decidim only ships one process image (the hero). Besides using it as the page header
      # background (above), reuse it as the project's card image — the first `ProjectImage`, which is
      # what the project card/tile in listings displays.
      def register_card_image(uid, project, hero_url)
        image = Record.new('project_image', { 'remote_image_url' => hero_url, 'ordering' => 0 })
        image.reference('project', project)
        ref_map.register("#{uid}-card-image", image)
      end

      # Decidim's `short_description` is HTML, but Go Vocal's `description_preview_multiloc` is a
      # plain-text teaser — convert to plain text, dropping any locale left blank.
      def plain_text_multiloc(value)
        multiloc(value)
          .transform_values { |html| plain_text(html) }
          .reject { |_, text| text.empty? }
      end

      # Plain text from an HTML fragment. Parsing with Nokogiri (rather than a tag-stripper) decodes
      # HTML entities — including named ones like `&nbsp;`/`&eacute;` that `strip_tags` leaves
      # encoded — and the whitespace collapse turns the resulting non-breaking spaces and block-level
      # line breaks into single spaces.
      def plain_text(html)
        Nokogiri::HTML.fragment(html.to_s).text.gsub(/[[:space:]]/, ' ').squeeze(' ').strip
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
