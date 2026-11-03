# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim participatory processes and assemblies ──▶ Go Vocal `Project`.
    #
    # A process/assembly in a group is nested under the corresponding folder via
    # `admin_publication_attributes.parent_attributes_ref`. Publication status follows whether it was
    # published. The `participatory_process_group` column holds the group's `uid` — blank when ungrouped,
    # and stamped by {ExportReader} with the synthetic Assemblies folder uid for assemblies (no Decidim
    # group).
    class ProjectsExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        short_description: 'short_description',
        hero_image: 'hero_image',
        group: 'participatory_process_group',
        published_at: 'published_at',
        created_at: 'created_at',
        updated_at: 'updated_at',
        url: 'url',
        slug: 'slug'
      }.freeze

      def initialize(*args, **kwargs)
        super
        @claimed_slugs = Set.new
      end

      def run
        rows.filter_map { |row| build_project(row) }
      end

      private

      def build_project(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        # The Decidim `description` becomes a Content Builder layout block, not `description_multiloc`
        # (see {DescriptionLayoutExtractor}). Only the plain-text preview is kept on the project.
        attributes = {
          'title_multiloc' => multiloc(row[COLUMNS[:title]]),
          'description_preview_multiloc' => plain_text_multiloc(row[COLUMNS[:short_description]]),
          'admin_publication_attributes' => admin_publication_attributes(row),
          'created_at' => timestamp(row[COLUMNS[:created_at]]),
          'updated_at' => timestamp(row[COLUMNS[:updated_at]])
        }
        hero = present_value(row[COLUMNS[:hero_image]])
        attributes['remote_header_bg_url'] = hero if hero
        # Keep the Decidim slug as the project's slug so original URLs stay stable and imported links
        # resolve (see {Links::Resolver}). Decidim slugs are unique only *within* a space type, but
        # `Project#slug` is global, so only the first claim keeps it; the rest fall back to a title-derived slug.
        # `decidim_slug` sanitizes to a valid Go Vocal slug (nil when unsalvageable), so `Sluggable` never
        # rejects it — an unset slug lets the model derive one from the title instead.
        slug = claim_slug(decidim_slug(row))
        attributes['slug'] = slug if slug

        project = ref_map.register(uid, Record.new('project', attributes))
        register_card_image(uid, project, hero) if hero
        project
      end

      # Decidim ships one process image (the hero). Reuse it as the project's card image (the first
      # `ProjectImage`, shown on the project card in listings) besides the page header background.
      def register_card_image(uid, project, hero_url)
        image = Record.new('project_image', { 'remote_image_url' => hero_url, 'ordering' => 0 })
        image.reference('project', project)
        ref_map.register("#{uid}-card-image", image)
      end

      # The Decidim slug: taken from the container URL (`…/processes/<slug>` or `…/assemblies/<slug>`),
      # falling back to the explicit `slug` column that older exports carry instead of a `url`. Sanitized
      # to a valid Go Vocal slug — nil when neither is present or nothing slug-worthy remains.
      def decidim_slug(row)
        url = present_value(row[COLUMNS[:url]])
        raw = url && url[%r{/(?:processes|assemblies)/([^/?#]+)}, 1]
        raw ||= present_value(row[COLUMNS[:slug]])
        Slug.sanitize(raw)
      end

      # Returns the slug the first time it's seen (claiming it), else nil — so only one project keeps a
      # given Decidim slug, avoiding a `Project#slug` uniqueness clash on import.
      def claim_slug(slug)
        slug if slug && @claimed_slugs.add?(slug)
      end

      # Decidim's `short_description` is HTML, but Go Vocal's `description_preview_multiloc` is a
      # plain-text teaser — convert to plain text, dropping any locale left blank.
      def plain_text_multiloc(value)
        multiloc(value)
          .transform_values { |html| plain_text(html) }
          .reject { |_, text| text.empty? }
      end

      # Plain text from an HTML fragment. Nokogiri (not a tag-stripper) decodes named entities like
      # `&nbsp;`/`&eacute;` that `strip_tags` leaves encoded; the whitespace collapse then normalises spaces.
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
