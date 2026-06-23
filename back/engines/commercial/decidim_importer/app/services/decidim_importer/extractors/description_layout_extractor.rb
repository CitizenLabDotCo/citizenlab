# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Builds a Content Builder project-description layout (`ContentBuilder::Layout`, code
    # `project_description`) for each project, taking the place of the plain `description_multiloc`.
    #
    # The layout's `craftjs_json` holds, in order: an optional `TextMultiloc` block linking back to the
    # original Decidim project (only with `include_source_url`), a `TextMultiloc` block for the Decidim
    # description, one `PageLink` block per project static page, and one `FileAttachment` block per
    # project file. The blocks reference pages/files by the explicit UUIDs the static-page and file
    # records were assigned, so the ids resolve once those records are created. The layout's own `after_save`
    # (`sync_file_attachments`) creates the layout's `Files::FileAttachment`s from the `FileAttachment`
    # nodes, so we don't emit those here.
    #
    # Runs after the projects/static-pages/files extractors so their records (and ids) are registered.
    class DescriptionLayoutExtractor < BaseExtractor
      COLUMNS = { uid: 'uid', description: 'description', source_url: 'url' }.freeze
      FRAME_PROPS = { 'id' => 'e2e-content-builder-frame' }.freeze

      # When `include_source_url` is on, prepend a TextMultiloc block linking back to the original
      # Decidim project (its `url` column), so the imported description records its provenance.
      def initialize(*, include_source_url: false, **)
        super(*, **)
        @include_source_url = include_source_url
      end

      def run
        rows.filter_map { |row| build_layout(row) }
      end

      private

      def build_layout(row)
        uid = present_value(row[COLUMNS[:uid]])
        return nil if uid.nil?

        project = ref_map.fetch(uid)
        return nil if project.nil?

        blocks = content_blocks(row, project)
        return nil if blocks.empty?

        layout = Record.new('content_builder/layout', {
          'code' => 'project_description',
          'enabled' => true,
          'craftjs_json' => craftjs_tree(blocks)
        })
        layout.reference('content_buildable', project)
        ref_map.register("#{uid}-description-layout", layout)
      end

      # The ordered `[id, component, props]` content blocks for the layout: the optional import-source
      # link, the description, a link per static page, then a file attachment per file. An empty list
      # means there's nothing to show, so no layout is built.
      def content_blocks(row, project)
        description = multiloc(row[COLUMNS[:description]])
        source = source_multiloc(row, description)

        blocks = []
        blocks << ['source', 'TextMultiloc', { 'text' => source }] if source
        blocks << ['description', 'TextMultiloc', { 'text' => description }] if description.present?
        static_page_ids_for(project).each_with_index { |id, i| blocks << ["page#{i}", 'PageLink', { 'pageId' => id }] }
        file_ids_for(project).each_with_index { |id, i| blocks << ["file#{i}", 'FileAttachment', { 'fileId' => id }] }
        blocks
      end

      # Wraps the ordered `[id, component, props]` blocks in a craft.js ROOT canvas, preserving order.
      def craftjs_tree(blocks)
        nodes = blocks.to_h do |id, resolved_name, props|
          [id, {
            'type' => { 'resolvedName' => resolved_name }, 'nodes' => [], 'props' => props,
            'custom' => {}, 'hidden' => false, 'parent' => 'ROOT', 'isCanvas' => false,
            'displayName' => resolved_name, 'linkedNodes' => {}
          }]
        end

        { 'ROOT' => {
          'type' => 'div', 'nodes' => blocks.map(&:first), 'props' => FRAME_PROPS.dup, 'custom' => {},
          'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {}
        } }.merge(nodes)
      end

      # A TextMultiloc text linking to the original Decidim project, in each locale the description
      # uses (falling back to the primary locale). Nil unless `include_source_url` is on and the row
      # carries a `url`.
      def source_multiloc(row, description)
        return nil unless @include_source_url

        url = present_value(row[COLUMNS[:source_url]])
        return nil if url.nil?

        href = CGI.escapeHTML(url)
        html = %(<p>Import source: <a href="#{href}" target="_blank" rel="noreferrer noopener nofollow">#{href}</a></p>)
        locales = description.keys.presence || [primary_locale]
        locales.index_with { html }
      end

      # The explicit ids of the static pages registered against this project (shared-hash identity).
      def static_page_ids_for(project)
        ref_map.records
          .select { |r| r.model_name == 'static_page' && r.attributes['project_ref'].equal?(project.attributes) }
          .filter_map { |r| r.attributes['id'] }
      end

      # The explicit ids of the files owned by this project, via the files_project ownership join.
      # The file records are keyed by their attributes-hash *identity*, matching how `reference` links
      # a files_project to its file (the same hash object).
      def file_ids_for(project)
        files_by_attrs = {}.compare_by_identity
        ref_map.records.each { |r| files_by_attrs[r.attributes] = r if r.model_name == 'files/file' }
        ref_map.records
          .select { |r| r.model_name == 'files/files_project' && r.attributes['project_ref'].equal?(project.attributes) }
          .filter_map { |fp| files_by_attrs[fp.attributes['file_ref']]&.attributes&.dig('id') }
      end
    end
  end
end
