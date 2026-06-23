# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Builds a Content Builder project-description layout (`ContentBuilder::Layout`, code
    # `project_description`) for each project, taking the place of the plain `description_multiloc`.
    #
    # The layout's `craftjs_json` holds, in order: a `TextMultiloc` block (the Decidim description),
    # one `PageLink` block per project static page, and one `FileAttachment` block per project file.
    # The blocks reference pages/files by the explicit UUIDs the static-page and file records were
    # assigned, so the ids resolve once those records are created. The layout's own `after_save`
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

        description = multiloc(row[COLUMNS[:description]])
        source = source_multiloc(row, description)
        page_ids = static_page_ids_for(project)
        file_ids = file_ids_for(project)
        return nil if source.nil? && description.empty? && page_ids.empty? && file_ids.empty?

        layout = Record.new('content_builder/layout', {
          'code' => 'project_description',
          'enabled' => true,
          'craftjs_json' => build_craftjs(source, description, page_ids, file_ids)
        })
        layout.reference('content_buildable', project)
        ref_map.register("#{uid}-description-layout", layout)
      end

      # Assembles the craft.js node tree: a ROOT canvas holding (optionally) the import-source link,
      # then the description text, then a link to each static page, then each file attachment.
      def build_craftjs(source, description, page_ids, file_ids)
        children = []
        nodes = {}
        add = lambda do |id, resolved_name, props|
          children << id
          nodes[id] = {
            'type' => { 'resolvedName' => resolved_name }, 'nodes' => [], 'props' => props,
            'custom' => {}, 'hidden' => false, 'parent' => 'ROOT', 'isCanvas' => false,
            'displayName' => resolved_name, 'linkedNodes' => {}
          }
        end

        add.call('source', 'TextMultiloc', { 'text' => source }) if source
        add.call('description', 'TextMultiloc', { 'text' => description }) unless description.empty?
        page_ids.each_with_index { |id, i| add.call("page#{i}", 'PageLink', { 'pageId' => id }) }
        file_ids.each_with_index { |id, i| add.call("file#{i}", 'FileAttachment', { 'fileId' => id }) }

        { 'ROOT' => {
          'type' => 'div', 'nodes' => children, 'props' => FRAME_PROPS.dup, 'custom' => {},
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
