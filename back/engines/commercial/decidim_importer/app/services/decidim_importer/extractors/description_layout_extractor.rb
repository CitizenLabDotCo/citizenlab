# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Builds a Content Builder project page (`ContentBuilder::Layout`, code `project_page`) per project
    # from the Decidim description, carrying it into the canonical page body.
    #
    # The imported body holds, in order: a `2-1` `TwoColumn` main section (subtitle/short/full
    # description on the left; optional source link, participation `AboutBox`, and regular page links on
    # the right — left spans full width when the right column is empty); a separate "Blog" section for
    # pages imported from `blogs` posts; then the project's files (collection-less at root, otherwise
    # nested in an `AccordionMultiloc` per Decidim attachment collection under a "Documents to consult"
    # heading). Blocks reference pages/files by the explicit UUIDs those records were assigned, so ids
    # resolve once the records exist. The layout's `after_save` (`sync_file_attachments`) creates the
    # `Files::FileAttachment`s from the `FileAttachment` nodes (it scans every node), so we don't emit those.
    #
    # An `AccordionMultiloc` nests its children in a *linked* `Container` canvas, referenced from the
    # accordion node's `linkedNodes['accordion-content']` — not its `nodes` array.
    #
    # Runs after the projects/static-pages/files extractors so their records (and ids) are registered.
    class DescriptionLayoutExtractor < BaseExtractor
      COLUMNS = { uid: 'uid', subtitle: 'subtitle', short_description: 'short_description',
                  description: 'description', source_url: 'url' }.freeze
      ATTACHMENT = { uid: 'uid', collection: 'collection' }.freeze
      COLLECTION = { uid: 'uid', name: 'name', description: 'description', weight: 'weight',
                     collection_for: 'collection_for' }.freeze
      FRAME_PROPS = { 'id' => 'e2e-content-builder-frame' }.freeze

      # @param attachments [Array<Hash>] attachment rows, read to map each file to its collection.
      # @param attachment_collections [Array<Hash>] collection rows (per project), each becoming an
      #   accordion grouping its files.
      # @param blog_page_ids [Array<String>] ids of static pages from `blogs` posts, linked in their own
      #   "Blog" section instead of beside the regular page links.
      def initialize(*, include_source_url: false, attachments: [], attachment_collections: [],
        blog_page_ids: [], **)
        super(*, **)
        @include_source_url = include_source_url
        @attachments = attachments
        @attachment_collections = attachment_collections
        @blog_page_ids = blog_page_ids.to_set
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
          'code' => ContentBuilder::ProjectPageLayoutService::CODE,
          'enabled' => true,
          'craftjs_json' => project_page_craftjs(blocks)
        })
        layout.reference('content_buildable', project)
        ref_map.register("#{uid}-description-layout", layout)
      end

      # The ordered content blocks: main two-column section, optional blog section, then the files. Empty
      # means nothing to show, so no layout is built. A block is a leaf (`{ id:, component:, props: }`),
      # an accordion (`{ id:, title:, children: [leaf, …] }`), or a two-column
      # (`{ id:, columnLayout:, left: [leaf, …], right: [leaf, …] }`).
      def content_blocks(row, project, process_uid)
        description = multiloc(row[COLUMNS[:description]])
        short_description = multiloc(row[COLUMNS[:short_description]])
        subtitle = subtitle_multiloc(row)
        source = source_multiloc(row, description)

        blog_ids, regular_page_ids = static_page_ids_for(project).partition { |id| @blog_page_ids.include?(id) }

        blocks = []
        append_main_section(blocks, subtitle, short_description, description, source,
          regular_page_ids, participation_phase?(project))
        append_blog_section(blocks, blog_ids, description)
        append_file_blocks(blocks, project, process_uid)
        blocks
      end

      # A "Blog" section for pages from `blogs` posts: a `WhiteSpace`, an `<h2>` heading, then a
      # `PageLink` per page. Kept separate from the main section's page links. Omitted when there are none.
      def append_blog_section(blocks, page_ids, description)
        return if page_ids.empty?

        blocks << leaf('blog-space', 'WhiteSpace', { 'size' => 'medium' })
        blocks << leaf('blog-heading', 'TextMultiloc', { 'text' => blog_heading(description) })
        page_ids.each_with_index { |id, i| blocks << leaf("blog-page#{i}", 'PageLink', { 'pageId' => id }) }
      end

      # An H2 "Blog" heading (`decidim_importer.blog`), translated for the description's locales
      # (falling back to the primary locale), wrapped in `<h2>`.
      def blog_heading(description)
        i18n_multiloc('blog', locales: description.keys.presence || [primary_locale])
          .transform_values { |text| "<h2>#{text}</h2>" }
      end

      # The main section. Left: subtitle (`H2`), short and full description, each a `TextMultiloc`. Right:
      # participation `AboutBox` (only with a participation phase), a `PageLink` per page, then — with
      # `include_source_url` — the import-source link. With content on the right these sit in a `2-1`
      # `TwoColumn`; with nothing on the right the left content spans full width.
      def append_main_section(blocks, subtitle, short_description, description, source, page_ids, participation)
        left = []
        left << leaf('subtitle', 'TextMultiloc', { 'text' => subtitle }) if subtitle.present?
        left << leaf('short-description', 'TextMultiloc', { 'text' => short_description }) if short_description.present?
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

      # Whether the project has any phase — only proposals/surveys become phases, so a phase means real
      # participation, and only then is the `AboutBox` widget meaningful.
      def participation_phase?(project)
        ref_map.records.any? do |r|
          r.model_name == 'phase' && r.attributes['project_ref'].equal?(project.attributes)
        end
      end

      # Root-level `FileAttachment`s for collection-less files, then one `AccordionMultiloc` per non-empty
      # collection (ordered by weight) nesting its files. A file whose collection isn't among the
      # project's collections falls back to the root.
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
        if heading.present?
          # A blank space sets the documents section apart from the content above its heading.
          blocks << leaf('documents-space', 'WhiteSpace', { 'size' => 'medium' })
          blocks << leaf('documents-heading', 'TextMultiloc', { 'text' => heading })
        end
        blocks.concat(accordions)
      end

      # An H2 heading (`decidim_importer.documents_to_consult`) introducing the document accordions,
      # translated for the collections' locales (falling back to the primary locale), wrapped in `<h2>`.
      def documents_heading(collections)
        locales = collections.flat_map { |collection| collection[:title].keys }.uniq.presence || [primary_locale]
        i18n_multiloc('documents_to_consult', locales: locales).transform_values { |text| "<h2>#{text}</h2>" }
      end

      # An accordion's content: the collection description (`TextMultiloc`, when present) then a
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

      # The imported blocks, wrapped in the canonical project page (banner, title, body, phases, events).
      def project_page_craftjs(blocks)
        ContentBuilder::ProjectPageLayoutService.new.craftjs_json_from_body(craftjs_tree(blocks))
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

      # A TextMultiloc linking to the original Decidim project, in each locale the description uses
      # (falling back to the primary locale). Nil unless `include_source_url` is on and the row has a `url`.
      def source_multiloc(row, description)
        return nil unless @include_source_url

        url = present_value(row[COLUMNS[:source_url]])
        return nil if url.nil?

        href = CGI.escapeHTML(strip_url_port(url))
        # Tag the link so the post-import {Links::Rewriter} leaves it pointing at the original Decidim URL
        # rather than rewriting it to the imported project (see {Links::Map::KEEP_HREF_REL}).
        rel = "noreferrer noopener nofollow #{Links::Map::KEEP_HREF_REL}"
        html = %(<p>Import source: <a href="#{href}" target="_blank" rel="#{rel}">#{href}</a></p>)
        locales = description.keys.presence || [primary_locale]
        locales.index_with { html }
      end

      # Decidim can leak its internal server port into exported URLs (e.g. `decidim.example.org:3000/…`);
      # drop it so the visible import-source link points at the real public host, not `:3000`.
      def strip_url_port(url)
        url.sub(%r{\A(https?://[^/:@?#]+):\d+}i, '\1')
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

      # The explicit ids of the files owned by this project (via the files_project join), excluding files
      # already attached to a specific resource (an idea, via a proposal attachment) — surfacing those
      # here would re-attach the file and trip `FileAttachment`'s idea-uniqueness validation. Files are
      # keyed by attributes-hash *identity*, matching how `reference` links a files_project to its file.
      def file_ids_for(project)
        attached = attached_file_object_ids
        files_by_attrs = {}.compare_by_identity
        ref_map.records.each { |r| files_by_attrs[r.attributes] = r if r.model_name == 'files/file' }
        ref_map.records
          .select { |r| r.model_name == 'files/files_project' && r.attributes['project_ref'].equal?(project.attributes) }
          .reject { |fp| attached.include?(fp.attributes['file_ref'].object_id) }
          .filter_map { |fp| files_by_attrs[fp.attributes['file_ref']]&.attributes&.dig('id') }
      end

      # Object ids of the file attribute-hashes that carry a `files/file_attachment` (idea attachments).
      def attached_file_object_ids
        ref_map.records
          .select { |r| r.model_name == 'files/file_attachment' }
          .to_set { |r| r.attributes['file_ref'].object_id }
      end
    end
  end
end
