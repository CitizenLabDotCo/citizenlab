# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim `blogs` posts (`04---posts.csv`) ──▶ Go Vocal project-level `StaticPage`.
    #
    # Go Vocal has no blog concept, so — like the `pages` component ({Extractors::StaticPagesExtractor}) —
    # each post becomes a custom, project-scoped static page (title → page title, body → top info section).
    # Difference from a plain page is downstream: the importer feeds these page ids to
    # {Extractors::DescriptionLayoutExtractor}, which links them in their own "Blog" section.
    #
    # Unpublished (Decidim draft) posts are skipped — static pages are always live.
    class BlogPostsExtractor < BaseExtractor
      COLUMNS = {
        uid: 'uid',
        title: 'title',
        body: 'body',
        published_at: 'published_at',
        created_at: 'created_at',
        updated_at: 'updated_at',
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
        return skip(uid, 'no project for post') if project.nil?
        return skip(uid, 'unpublished post') if present_value(row[COLUMNS[:published_at]]).nil?

        title = multiloc(row[COLUMNS[:title]])
        return skip(uid, 'post has no title') if title.empty?

        register_static_page(uid, project, title: title, body: multiloc(row[COLUMNS[:body]]),
          created_at: timestamp(row[COLUMNS[:created_at]]), updated_at: timestamp(row[COLUMNS[:updated_at]]))
      end
    end
  end
end
