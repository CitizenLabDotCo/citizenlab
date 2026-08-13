# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim `pages` components ──▶ Go Vocal project-level `StaticPage`.
    #
    # A Decidim page is a single block of rich text (the `body` multiloc in the component's
    # `specific_data`). It becomes a custom, project-scoped static page: the component name becomes the
    # page title and the body its top info section. Unpublished pages (Decidim drafts) are skipped —
    # static pages are always live, so importing a draft would publish unreviewed content.
    class StaticPagesExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        name: 'name',
        published_at: 'published_at',
        specific_data: 'specific_data',
        process: 'decidim_participatory_process'
      }.freeze

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

        register_static_page(uid, project, title: title, body: body_multiloc(row))
      end

      # The page body lives as a `body` multiloc inside the component manifest's `specific_data` JSON.
      def body_multiloc(row)
        parsed = Parsing.parse_json(row[COLUMNS[:specific_data]])
        multiloc(parsed.is_a?(Hash) ? parsed['body'] : nil)
      end
    end
  end
end
