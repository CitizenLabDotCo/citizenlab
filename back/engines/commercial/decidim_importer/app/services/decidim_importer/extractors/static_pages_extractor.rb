# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim `pages` components ──▶ Go Vocal project-level `StaticPage`.
    #
    # A Decidim page is a single block of rich text — the `body` multiloc inside the component
    # manifest's `specific_data` — scoped to a participatory process. Go Vocal models the equivalent
    # as a custom, project-scoped static page: the component name becomes the page title and the page
    # body its top info section, attached to the process's project via `project_ref`.
    #
    # The component CSV is stamped by the importer with its owning process
    # (`decidim_participatory_process`) — the directory is the association — so the project is looked
    # up in the ref map. Unpublished pages (Decidim drafts) are skipped: static pages are always live,
    # so importing a draft would publish unreviewed content.
    class StaticPagesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        name: 'name',
        published_at: 'published_at',
        specific_data: 'specific_data',
        process: 'decidim_participatory_process'
      }.freeze

      attr_reader :skipped

      def initialize(*args, **kwargs)
        super
        @skipped = []
      end

      def run
        rows.filter_map { |row| build_static_page(row) }
      end

      private

      def build_static_page(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        project = ref_map.fetch(present_value(row[COLUMNS[:process]]))
        return skip(uid, 'no project for page') if project.nil?
        return skip(uid, 'unpublished page') if present_value(row[COLUMNS[:published_at]]).nil?

        title = multiloc(row[COLUMNS[:name]])
        return skip(uid, 'page has no title') if title.empty?

        # An explicit id so the project-description layout's PageLink block can reference this page
        # (craftjs stores the page id verbatim; refs can't reach into the JSONB blob).
        page = Record.new('static_page', {
          'id' => SecureRandom.uuid,
          'title_multiloc' => title,
          'code' => 'custom',
          'top_info_section_enabled' => true,
          'top_info_section_multiloc' => body_multiloc(row)
        })
        page.reference('project', project)
        ref_map.register(uid, page)
      end

      # The page body lives as a `body` multiloc inside the component manifest's `specific_data` JSON.
      def body_multiloc(row)
        parsed = try_parse_json(row[COLUMNS[:specific_data]])
        multiloc(parsed.is_a?(Hash) ? parsed['body'] : nil)
      end

      def skip(uid, reason)
        @skipped << { uid: uid, reason: reason }
        nil
      end
    end
  end
end
