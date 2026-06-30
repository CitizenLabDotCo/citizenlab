# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Builds a Content Builder project-description layout (`ContentBuilder::Layout`, code
    # `project_description`) for each project, taking the place of the plain `description_multiloc`.
    #
    # The layout's `craftjs_json` holds, in order: a `TwoColumn` (`2-1`) main section with the process
    # subtitle (an `H2`) above the Decidim description on the left and, on the right, an optional
    # import-source link (only with `include_source_url`), the participation widget (`AboutBox`, only
    # when the project has a participation phase), then a `PageLink` per project static page (the left
    # content spans full width instead when that right column would be empty); then the project's
    # files. Files that
    # belong to a Decidim *attachment collection* are nested inside an `AccordionMultiloc` (titled with
    # the collection name, opening with a `TextMultiloc` of the collection description when it has one),
    # under a "Documents to consult" H2 heading; files with no collection stay at the layout root. The
    # blocks reference
    # pages/files by the explicit UUIDs the static-page and file records were assigned, so the ids
    # resolve once those records are created. The layout's own `after_save` (`sync_file_attachments`)
    # creates the layout's `Files::FileAttachment`s from the `FileAttachment` nodes (including the nested
    # ones — it scans every node), so we don't emit those here.
    #
    # An `AccordionMultiloc` nests its children in a *linked* `Container` canvas (craft.js `<Element
    # id="accordion-content" is={Container} canvas />`), referenced from the accordion node's
    # `linkedNodes['accordion-content']` — not its `nodes` array.
    #
    # Runs after the projects/static-pages/files extractors so their records (and ids) are registered.
    class DescriptionLayoutExtractor < BaseExtractor
      COLUMNS = { uid: 'uid', subtitle: 'subtitle', description: 'description', source_url: 'url' }.freeze
      ATTACHMENT = { uid: 'uid', collection: 'collection' }.freeze
      COLLECTION = { uid: 'uid', name: 'name', description: 'description', weight: 'weight',
                     collection_for: 'collection_for' }.freeze
      FRAME_PROPS = { 'id' => 'e2e-content-builder-frame' }.freeze

      # @param attachments [Array<Hash>] the attachment rows, read to map each file to its collection.
      # @param attachment_collections [Array<Hash>] the collection rows (per project), each becoming an
      #   accordion grouping its files.
      def initialize(*, include_source_url: false, attachments: [], attachment_collections: [], **)
        super(*, **)
        @include_source_url = include_source_url
        @attachments = attachments
        @attachment_collections = attachment_collections
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

        blocks = content_blocks(row, project, uid)
        return nil if blocks.empty?

        layout = Record.new('content_builder/layout', {
          'code' => 'project_description',
          'enabled' => true,
          'craftjs_json' => craftjs_tree(blocks)
        })
        layout.reference('content_buildable', project)
        ref_map.register("#{uid}-description-layout", layout)
      end

      # The ordered content blocks for the layout: the optional import-source link, a two-column main
      # section (the description on the left; the participation widget + page links on the right), then
      # the files (collection-less ones at root, collected ones in accordions). An empty list means
      # there's nothing to show, so no layout is built. A block is a leaf (`{ id:, component:, props: }`),
      # an accordion (`{ id:, title:, children: [leaf, …] }`), or a two-column
      # (`{ id:, columnLayout:, left: [leaf, …], right: [leaf, …] }`).
      def content_blocks(row, project, process_uid)
        description = multiloc(row[COLUMNS[:description]])
        subtitle = subtitle_multiloc(row)
        source = source_multiloc(row, description)

        blocks = []
        append_main_section(blocks, subtitle, description, source, static_page_ids_for(project),
          participation_phase?(project))
        append_file_blocks(blocks, project, process_uid)
        blocks
      end

      # The main section. Left column: the process subtitle (an `H2`) above the description. Right column:
      # the participation widget (`AboutBox`, only when the project has a participation phase), a
      # `PageLink` per page, then — when `include_source_url` — a `WhiteSpace` and the import-source link
      # at the bottom. With content on the right these sit in a `2-1` `TwoColumn` (wider left); with
      # nothing on the right the left content spans the full width instead of a lopsided two-column.
      def append_main_section(blocks, subtitle, description, source, page_ids, participation)
        left = []
        left << leaf('subtitle', 'TextMultiloc', { 'text' => subtitle }) if subtitle.present?
        left << leaf('description', 'TextMultiloc', { 'text' => description }) if description.present?

        right = []
        right << leaf('about', 'AboutBox', {}) if participation
        page_ids.each_with_index { |id, i| right << leaf("page#{i}", 'PageLink', { 'pageId' => id }) }
        if source
          right << leaf('source-space', 'WhiteSpace', { 'size' => 'medium' })
          right << leaf('source', 'TextMultiloc', { 'text' => source })
        end

        if right.any?
          blocks << { id: 'main', columnLayout: '2-1', left: left, right: right }
        else
          blocks.concat(left) # nothing for the side column — the left content spans the full width
        end
      end

      # The process subtitle as an `H2`, in each locale it's given. Empty when the process has no subtitle.
      def subtitle_multiloc(row)
        multiloc(row[COLUMNS[:subtitle]]).transform_values { |text| "<h2>#{text}</h2>" }
      end

      # Whether the project has any participation phase (anything other than the information backbone) —
      # only then is the `AboutBox` participation widget meaningful.
      def participation_phase?(project)
        ref_map.records.any? do |r|
          r.model_name == 'phase' && r.attributes['project_ref'].equal?(project.attributes) &&
            r.attributes['participation_method'] != 'information'
        end
      end

      # Root-level `FileAttachment`s for collection-less files (as before), then one `AccordionMultiloc`
      # per non-empty collection (ordered by collection weight) nesting its files — preceded, when the
      # collection has one, by a `TextMultiloc` block with the collection's description. A file whose
      # collection isn't found among the project's collections falls back to the root.
      def append_file_blocks(blocks, project, process_uid)
        file_ids = file_ids_for(project)
        collections = collections_for(process_uid)
        collected_uids = collections.to_set { |collection| collection[:uid] }

        root_ids = file_ids.reject { |id| collected_uids.include?(collection_by_file_id[id]) }
        root_ids.each_with_index { |id, i| blocks << leaf("file#{i}", 'FileAttachment', { 'fileId' => id }) }

        grouped = file_ids.group_by { |id| collection_by_file_id[id] }
        accordions = collections.each_with_index.filter_map do |collection, ci|
          ids = grouped[collection[:uid]]
          next if ids.blank?

          { id: "accordion#{ci}", title: collection[:title], children: accordion_children(collection, ids, ci) }
        end
        return if accordions.empty?

        heading = documents_heading(collections)
        blocks << leaf('documents-heading', 'TextMultiloc', { 'text' => heading }) if heading.present?
        blocks.concat(accordions)
      end

      # An H2 heading introducing the document accordions, translated for the collections' locales
      # (falling back to the primary locale). The copy lives in the back-end locales
      # (`decidim_importer.documents_to_consult`); it's wrapped in an `<h2>` so the rich-text block
      # renders it as a heading.
      def documents_heading(collections)
        locales = collections.flat_map { |collection| collection[:title].keys }.uniq.presence || [primary_locale]
        MultilocService.new
          .i18n_to_multiloc('decidim_importer.documents_to_consult', locales: locales, raise_on_missing: false)
          .transform_values { |text| "<h2>#{text}</h2>" }
      end

      # An accordion's content: the collection description (a `TextMultiloc`, when present) followed by a
      # `FileAttachment` per file.
      def accordion_children(collection, file_ids, index)
        children = []
        children << leaf("accordion#{index}-desc", 'TextMultiloc', { 'text' => collection[:description] }) if collection[:description].present?
        file_ids.each_with_index { |id, fi| children << leaf("accordion#{index}-file#{fi}", 'FileAttachment', { 'fileId' => id }) }
        children
      end

      def leaf(id, component, props)
        { id: id, component: component, props: props }
      end

      # Wraps the ordered blocks in a craft.js ROOT canvas, expanding accordions and two-columns into
      # their node + linked `Container` canvas(es) + nested children.
      def craftjs_tree(blocks)
        nodes = {}
        blocks.each do |block|
          if block[:columnLayout]
            add_two_column(nodes, block)
          elsif block[:children]
            add_accordion(nodes, block)
          else
            nodes[block[:id]] = component_node(block, 'ROOT')
          end
        end

        { 'ROOT' => root_node(blocks.pluck(:id)) }.merge(nodes)
      end

      def add_accordion(nodes, block)
        canvas_id = "#{block[:id]}-content"
        nodes[block[:id]] = {
          'type' => { 'resolvedName' => 'AccordionMultiloc' }, 'nodes' => [],
          'props' => { 'title' => block[:title], 'openByDefault' => false }, 'custom' => {},
          'hidden' => false, 'parent' => 'ROOT', 'isCanvas' => false, 'displayName' => 'Accordion',
          'linkedNodes' => { 'accordion-content' => canvas_id }
        }
        add_container(nodes, canvas_id, block[:id], block[:children])
      end

      def add_two_column(nodes, block)
        left_id = "#{block[:id]}-left"
        right_id = "#{block[:id]}-right"
        nodes[block[:id]] = {
          'type' => { 'resolvedName' => 'TwoColumn' }, 'nodes' => [],
          'props' => { 'columnLayout' => block[:columnLayout] }, 'custom' => {},
          'hidden' => false, 'parent' => 'ROOT', 'isCanvas' => false, 'displayName' => 'TwoColumn',
          'linkedNodes' => { 'left' => left_id, 'right' => right_id }
        }
        add_container(nodes, left_id, block[:id], block[:left])
        add_container(nodes, right_id, block[:id], block[:right])
      end

      # A linked `Container` canvas holding the given leaf children (parented to it).
      def add_container(nodes, canvas_id, parent_id, children)
        nodes[canvas_id] = {
          'type' => { 'resolvedName' => 'Container' }, 'nodes' => children.pluck(:id), 'props' => {},
          'custom' => {}, 'hidden' => false, 'parent' => parent_id, 'isCanvas' => true,
          'displayName' => 'Container', 'linkedNodes' => {}
        }
        children.each { |child| nodes[child[:id]] = component_node(child, canvas_id) }
      end

      def component_node(block, parent)
        {
          'type' => { 'resolvedName' => block[:component] }, 'nodes' => [], 'props' => block[:props],
          'custom' => {}, 'hidden' => false, 'parent' => parent, 'isCanvas' => false,
          'displayName' => block[:component], 'linkedNodes' => {}
        }
      end

      def root_node(children)
        {
          'type' => 'div', 'nodes' => children, 'props' => FRAME_PROPS.dup, 'custom' => {},
          'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {}
        }
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

      # file id (the explicit UUID) → its Decidim attachment-collection uid, for files that have one.
      # Files are registered under their attachment uid by {Extractors::FilesExtractor}.
      def collection_by_file_id
        @collection_by_file_id ||= @attachments.each_with_object({}) do |row, map|
          collection_uid = present_value(row[ATTACHMENT[:collection]])
          next unless collection_uid

          file_id = ref_map.fetch(present_value(row[ATTACHMENT[:uid]]))&.attributes&.dig('id')
          map[file_id] = collection_uid if file_id
        end
      end

      # The project's collections (`collection_for` is the process uid), ordered by weight, as
      # `{ uid:, title: <multiloc>, description: <multiloc> }`.
      def collections_for(process_uid)
        @attachment_collections
          .select { |row| present_value(row[COLLECTION[:collection_for]]) == process_uid }
          .sort_by { |row| present_value(row[COLLECTION[:weight]]).to_i }
          .map do |row|
            { uid: present_value(row[COLLECTION[:uid]]), title: multiloc(row[COLLECTION[:name]]),
              description: multiloc(row[COLLECTION[:description]]) }
          end
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
