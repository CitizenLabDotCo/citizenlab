# frozen_string_literal: true

module ContentBuilder
  class ProjectPageLayoutService
    CODE = 'project_page'

    ROOT_ID = 'ROOT'
    BANNER_ID = 'PROJECT_PAGE_BANNER'
    TITLE_ID = 'PROJECT_PAGE_TITLE'
    BODY_ID = 'PROJECT_PAGE_BODY'
    PHASES_ID = 'PROJECT_PAGE_PHASES'
    EVENTS_ID = 'PROJECT_PAGE_EVENTS'

    INTRO_COLUMNS_ID = 'PROJECT_PAGE_INTRO_COLUMNS'
    INTRO_LEFT_ID = 'PROJECT_PAGE_INTRO_LEFT'
    INTRO_TEXT_ID = 'PROJECT_PAGE_INTRO_TEXT'
    INTRO_RIGHT_ID = 'PROJECT_PAGE_INTRO_RIGHT'
    PARTICIPATION_BOX_ID = 'PROJECT_PAGE_PARTICIPATION_BOX'
    DETAILS_COLUMNS_ID = 'PROJECT_PAGE_DETAILS_COLUMNS'
    DETAILS_LEFT_ID = 'PROJECT_PAGE_DETAILS_LEFT'
    DETAILS_TEXT_ID = 'PROJECT_PAGE_DETAILS_TEXT'
    DETAILS_RIGHT_ID = 'PROJECT_PAGE_DETAILS_RIGHT'

    # The `type` a project page's ROOT node carries (description and folder layouts
    # use a plain 'div').
    ROOT_TYPE = { 'resolvedName' => 'ProjectPageRoot' }.freeze

    # The scaffold node that holds all page content; its `nodes` array is the
    # top-level order.
    BODY_WIDGET = 'ProjectPageBody'

    # The fixed page scaffold: every project page has exactly one node of each of
    # these types, and none of them may be added, deleted or edited. The one editable
    # part is BODY_WIDGET's `nodes` array.
    #
    # The seeded phases and events widgets are deliberately absent: they are
    # ordinary widgets the FE toolbox can move or delete.
    SCAFFOLD_WIDGETS = ['ProjectPageRoot', 'ProjectBanner', 'ProjectTitle', BODY_WIDGET].freeze

    # Scaffold widgets rendered from the project record rather than from layout props.
    PROJECT_RECORD_WIDGETS = %w[ProjectBanner ProjectTitle].freeze

    # Whether a node is part of the fixed scaffold; nil (an id absent from the
    # graph) is not.
    def self.scaffold?(node)
      !node.nil? && SCAFFOLD_WIDGETS.include?(Craftjs::Query.resolved_name(node))
    end

    # Widgets that only make sense on a folder description and would crash the
    # project page resolver, so they are dropped when body nodes are imported.
    UNSUPPORTED_WIDGETS = %w[
      FolderFiles
      FolderTitle
      Published
      Selection
      Spotlight
    ].freeze

    INJECTED_ID_PREFIX = 'd_'

    # Fully qualified: a relative `Craftjs::Query` would not resolve inside delegate's module_eval.
    delegate :resolved_name, to: :'ContentBuilder::Craftjs::Query', private: true

    def craftjs_json_for(project)
      append_file_nodes(default_page_nodes, project)
    end

    def append_file_nodes(craftjs_json, project)
      return craftjs_json if craftjs_json.blank?

      attachments = ::Files::FileAttachment.where(attachable: project).ordered
      return craftjs_json if attachments.empty?

      json = craftjs_json.deep_dup
      parent_id = find_node_id(json, 'ProjectDescriptionSection') || find_node_id(json, BODY_WIDGET)
      return craftjs_json unless parent_id

      referenced_file_ids = json.each_value.filter_map do |node|
        node.dig('props', 'fileId') if node.is_a?(Hash) && resolved_name(node) == 'FileAttachment'
      end
      missing = attachments.reject { |attachment| referenced_file_ids.include?(attachment.file_id) }
      return craftjs_json if missing.empty?

      space_id = "#{INJECTED_ID_PREFIX}files_space"
      columns_id = "#{INJECTED_ID_PREFIX}files_columns"
      left_id = "#{INJECTED_ID_PREFIX}files_left"
      right_id = "#{INJECTED_ID_PREFIX}files_right"

      json[space_id] = white_space_node(parent_id)
      json[columns_id] = two_column_node(parent_id, [left_id, right_id])
      json[right_id] = container_node('right', columns_id, [])

      file_node_ids = missing.map do |attachment|
        node_id = "#{INJECTED_ID_PREFIX}file_#{attachment.file_id}"
        json[node_id] = Craftjs::Nodes.file_attachment(attachment.file_id, left_id)
        node_id
      end
      json[left_id] = container_node('left', columns_id, file_node_ids)

      insert_before_phases(json, parent_id, space_id)
      insert_before_phases(json, parent_id, columns_id)

      json
    end

    # Wraps a plain ROOT-canvas craftjs tree (as built by the Decidim importer) in
    # the canonical project page — banner, title, the imported nodes inside the page
    # body, then phases and events. Falls back to the default page when the tree
    # holds nothing renderable.
    #
    # The nodes go in the body as they come: importers decide their own layout, and
    # only add a participation box when the project actually has participation.
    def craftjs_json_from_body(body_craftjs)
      injected_nodes, injected_top_level_ids = inject_body(body_craftjs || {})
      return default_page_nodes if injected_top_level_ids.empty?

      injected_top_level_ids.each { |id| injected_nodes[id]['parent'] = BODY_ID }
      canonical_nodes(injected_top_level_ids).merge(injected_nodes)
    end

    private

    def inject_body(body)
      root = body[ROOT_ID]
      return [{}, []] unless root.is_a?(Hash)

      unsupported = unsupported_ids(body)
      id_map = build_id_map(body, unsupported)

      nodes = {}
      body.each do |id, node|
        next if id == ROOT_ID
        next if unsupported.include?(id)
        next unless node.is_a?(Hash)

        nodes[id_map.fetch(id)] = remap_node(node, id_map, unsupported)
      end

      top_level_ids = Array(root['nodes'])
        .reject { |id| unsupported.include?(id) }
        .filter_map { |id| id_map[id] }

      [nodes, top_level_ids]
    end

    def unsupported_ids(body)
      ids = Set.new
      queue = body.filter_map do |id, node|
        id if id != ROOT_ID && node.is_a?(Hash) && UNSUPPORTED_WIDGETS.include?(resolved_name(node))
      end

      until queue.empty?
        id = queue.shift
        next if ids.include?(id)

        ids << id
        node = body[id]
        next unless node.is_a?(Hash)

        queue.concat(Array(node['nodes']))
        queue.concat(Array(node['linkedNodes']).pluck(1))
      end

      ids
    end

    def build_id_map(body, unsupported)
      body.each_key.with_object({}) do |id, map|
        next if id == ROOT_ID || unsupported.include?(id)

        map[id] = "#{INJECTED_ID_PREFIX}#{id}"
      end
    end

    def remap_node(node, id_map, unsupported)
      remapped = Marshal.load(Marshal.dump(node))

      if remapped.key?('parent') && remapped['parent'] != ROOT_ID
        remapped['parent'] = id_map[remapped['parent']] || remapped['parent']
      end

      remapped['nodes'] = Array(remapped['nodes'])
        .reject { |id| unsupported.include?(id) }
        .filter_map { |id| id_map[id] }

      if remapped['linkedNodes'].is_a?(Hash)
        remapped['linkedNodes'] = remapped['linkedNodes']
          .reject { |_slot, id| unsupported.include?(id) }
          .transform_values { |id| id_map[id] || id }
      end

      remapped
    end

    def find_node_id(json, name)
      json.find { |id, node| id != ROOT_ID && node.is_a?(Hash) && resolved_name(node) == name }&.first
    end

    def insert_before_phases(json, parent_id, node_id)
      nodes = Array(json[parent_id]['nodes'])
      index = nodes.index { |id| json[id].is_a?(Hash) && resolved_name(json[id]) == 'PhasesWidget' } || nodes.length
      json[parent_id]['nodes'] = nodes.dup.insert(index, node_id)
    end

    def white_space_node(parent_id)
      {
        'type' => { 'resolvedName' => 'WhiteSpace' },
        'nodes' => [],
        'props' => { 'size' => 'small' },
        'custom' => {
          'title' => message('app.containers.AdminPage.ProjectDescription.whiteSpace', 'White space')
        },
        'hidden' => false,
        'parent' => parent_id,
        'isCanvas' => false,
        'displayName' => 'WhiteSpace',
        'linkedNodes' => {}
      }
    end

    def two_column_node(parent_id, child_ids)
      {
        'type' => { 'resolvedName' => 'TwoColumn' },
        'nodes' => child_ids,
        'props' => { 'columnLayout' => '2-1' },
        'custom' => {
          'title' => message('app.containers.admin.ContentBuilder.twoColumnLayout', '2 column'),
          'hasChildren' => true
        },
        'hidden' => false,
        'parent' => parent_id,
        'isCanvas' => false,
        'displayName' => 'TwoColumn',
        'linkedNodes' => {}
      }
    end

    def container_node(side, parent_id, child_ids)
      {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => child_ids,
        'props' => { 'id' => side },
        'custom' => {},
        'hidden' => false,
        'parent' => parent_id,
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      }
    end

    # The layout new projects start from: an intro text next to the participation
    # box, a details text next to an empty column, then phases and events. The
    # text values are real, admin-editable content seeded in the tenant locales.
    def default_page_nodes
      multiloc_service = MultilocService.new
      intro_multiloc = multiloc_service.i18n_to_multiloc('content_builder.project_page.intro_placeholder', raise_on_missing: false)
      details_multiloc = multiloc_service.i18n_to_multiloc('content_builder.project_page.details_placeholder', raise_on_missing: false)

      canonical_nodes([INTRO_COLUMNS_ID, DETAILS_COLUMNS_ID]).merge(
        INTRO_COLUMNS_ID => columns_node(BODY_ID, left: INTRO_LEFT_ID, right: INTRO_RIGHT_ID),
        INTRO_LEFT_ID => column_node(INTRO_COLUMNS_ID, [INTRO_TEXT_ID]),
        INTRO_TEXT_ID => text_multiloc_node(intro_multiloc, INTRO_LEFT_ID),
        INTRO_RIGHT_ID => column_node(INTRO_COLUMNS_ID, [PARTICIPATION_BOX_ID]),
        PARTICIPATION_BOX_ID => participation_box_node(INTRO_RIGHT_ID),
        DETAILS_COLUMNS_ID => columns_node(BODY_ID, left: DETAILS_LEFT_ID, right: DETAILS_RIGHT_ID),
        DETAILS_LEFT_ID => column_node(DETAILS_COLUMNS_ID, [DETAILS_TEXT_ID]),
        DETAILS_TEXT_ID => text_multiloc_node(details_multiloc, DETAILS_LEFT_ID),
        DETAILS_RIGHT_ID => column_node(DETAILS_COLUMNS_ID, [])
      )
    end

    def columns_node(parent_id, left:, right:)
      {
        'type' => { 'resolvedName' => 'TwoColumn' },
        'nodes' => [],
        'props' => { 'columnLayout' => '2-1' },
        'custom' => {
          'title' => message('app.containers.admin.ContentBuilder.twoColumnLayout', '2 column'),
          'hasChildren' => true
        },
        'hidden' => false,
        'parent' => parent_id,
        'isCanvas' => false,
        'displayName' => 'TwoColumn',
        'linkedNodes' => { 'left' => left, 'right' => right }
      }
    end

    def column_node(parent_id, child_ids)
      {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => child_ids,
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => parent_id,
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      }
    end

    def text_multiloc_node(text_multiloc, parent_id)
      {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => text_multiloc },
        'custom' => {
          'title' => message('app.containers.admin.ContentBuilder.textMultiloc', 'Text')
        },
        'hidden' => false,
        'parent' => parent_id,
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      }
    end

    def participation_box_node(parent_id)
      {
        'type' => { 'resolvedName' => 'AboutBox' },
        'nodes' => [],
        'props' => {},
        'custom' => {
          'title' => message('app.containers.admin.ContentBuilder.participationBox', 'Participation Box'),
          'noPointerEvents' => true
        },
        'hidden' => false,
        'parent' => parent_id,
        'isCanvas' => false,
        'displayName' => 'AboutBox',
        'linkedNodes' => {}
      }
    end

    def canonical_nodes(description_ids)
      {
        ROOT_ID => {
          'type' => { 'resolvedName' => 'ProjectPageRoot' },
          'nodes' => [BANNER_ID, TITLE_ID, BODY_ID],
          'props' => {},
          'custom' => { 'region' => true },
          'hidden' => false,
          'isCanvas' => true,
          'displayName' => 'ProjectPageRoot',
          'linkedNodes' => {}
        },
        BANNER_ID => {
          'type' => { 'resolvedName' => 'ProjectBanner' },
          'nodes' => [],
          'props' => { 'image' => {}, 'alt' => {} },
          'custom' => {
            'title' => message('app.components.ProjectPageBuilder.Widgets.bannerWidgetTitle', 'Project image'),
            'locked' => true,
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => ROOT_ID,
          'isCanvas' => false,
          'displayName' => 'ProjectBanner',
          'linkedNodes' => {}
        },
        TITLE_ID => {
          'type' => { 'resolvedName' => 'ProjectTitle' },
          'nodes' => [],
          'props' => {},
          'custom' => {
            'title' => message('app.components.ProjectPageBuilder.Widgets.titleWidgetTitle', 'Title'),
            'locked' => true,
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => ROOT_ID,
          'isCanvas' => false,
          'displayName' => 'ProjectTitle',
          'linkedNodes' => {}
        },
        BODY_ID => {
          'type' => { 'resolvedName' => 'ProjectPageBody' },
          'nodes' => description_ids + [PHASES_ID, EVENTS_ID],
          'props' => {},
          'custom' => { 'region' => true },
          'hidden' => false,
          'parent' => ROOT_ID,
          'isCanvas' => true,
          'displayName' => 'ProjectPageBody',
          'linkedNodes' => {}
        },
        PHASES_ID => {
          'type' => { 'resolvedName' => 'PhasesWidget' },
          'nodes' => [],
          'props' => {},
          'custom' => {
            'title' => message('app.components.ProjectPageBuilder.Widgets.phasesWidgetTitle', 'Phases'),
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => BODY_ID,
          'isCanvas' => false,
          'displayName' => 'PhasesWidget',
          'linkedNodes' => {}
        },
        EVENTS_ID => {
          'type' => { 'resolvedName' => 'EventsWidget' },
          'nodes' => [],
          'props' => {},
          'custom' => {
            'title' => message('app.components.ProjectPageBuilder.Widgets.eventsWidgetTitle', 'Events'),
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => BODY_ID,
          'isCanvas' => false,
          'displayName' => 'EventsWidget',
          'linkedNodes' => {}
        }
      }
    end

    def message(id, default_message)
      { 'id' => id, 'defaultMessage' => default_message }
    end
  end
end
