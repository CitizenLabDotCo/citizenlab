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

    UNSUPPORTED_WIDGETS = %w[
      FolderFiles
      FolderTitle
      Published
      Selection
      Spotlight
    ].freeze

    INJECTED_ID_PREFIX = 'd_'

    def craftjs_json_for(project)
      description_layout = Layout.find_by(
        content_buildable: project,
        code: DescriptionLayoutService::LAYOUT_CODE_BY_TYPE.fetch('Project')
      )

      craftjs_json = if description_layout
        from_description_craftjs(description_layout.craftjs_json)
      else
        from_description_multiloc(project.description_multiloc)
      end

      append_file_nodes(craftjs_json, project)
    end

    def append_file_nodes(craftjs_json, project)
      return craftjs_json if craftjs_json.blank?

      attachments = ::Files::FileAttachment.where(attachable: project).ordered
      return craftjs_json if attachments.empty?

      json = craftjs_json.deep_dup
      parent_id = find_node_id(json, 'ProjectDescriptionSection') || find_node_id(json, 'ProjectPageBody')
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
        json[node_id] = file_attachment_node(attachment.file_id, left_id)
        node_id
      end
      json[left_id] = container_node('left', columns_id, file_node_ids)

      insert_before_phases(json, parent_id, space_id)
      insert_before_phases(json, parent_id, columns_id)

      json
    end

    def from_description_craftjs(description_craftjs)
      injected_nodes, injected_top_level_ids = inject_description(description_craftjs || {})
      canonical_nodes(injected_top_level_ids).merge(injected_nodes)
    end

    def from_description_multiloc(description_multiloc)
      description_service = DescriptionLayoutService.new
      return canonical_nodes([]) if description_service.description_blank?(description_multiloc)

      node = if description_service.description_has_media?(description_multiloc)
        description_service.bridge_node(description_multiloc)
      else
        description_service.text_node(description_multiloc)
      end
      node_id = "#{INJECTED_ID_PREFIX}#{SecureRandom.alphanumeric(10)}"

      canonical_nodes([node_id]).merge(node_id => node.merge('parent' => BODY_ID))
    end

    private

    def inject_description(description)
      root = description[ROOT_ID]
      return [{}, []] unless root.is_a?(Hash)

      unsupported = unsupported_ids(description)
      id_map = build_id_map(description, unsupported)

      nodes = {}
      description.each do |id, node|
        next if id == ROOT_ID
        next if unsupported.include?(id)
        next unless node.is_a?(Hash)

        nodes[id_map.fetch(id)] = remap_node(node, id_map, unsupported)
      end

      top_level_ids = Array(root['nodes'])
        .reject { |id| unsupported.include?(id) }
        .filter_map { |id| id_map[id] }

      top_level_ids.each { |id| nodes[id]['parent'] = BODY_ID }

      [nodes, top_level_ids]
    end

    def unsupported_ids(description)
      ids = Set.new
      queue = description.filter_map do |id, node|
        id if id != ROOT_ID && node.is_a?(Hash) && UNSUPPORTED_WIDGETS.include?(resolved_name(node))
      end

      until queue.empty?
        id = queue.shift
        next if ids.include?(id)

        ids << id
        node = description[id]
        next unless node.is_a?(Hash)

        queue.concat(Array(node['nodes']))
        queue.concat(Array(node['linkedNodes']).pluck(1))
      end

      ids
    end

    def build_id_map(description, unsupported)
      description.each_key.with_object({}) do |id, map|
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

    def resolved_name(node)
      type = node['type']
      type.is_a?(Hash) ? type['resolvedName'] : type
    end

    def find_node_id(json, name)
      json.find { |id, node| id != ROOT_ID && node.is_a?(Hash) && resolved_name(node) == name }&.first
    end

    def insert_before_phases(json, parent_id, node_id)
      nodes = Array(json[parent_id]['nodes'])
      index = nodes.index { |id| json[id].is_a?(Hash) && resolved_name(json[id]) == 'PhasesWidget' } || nodes.length
      json[parent_id]['nodes'] = nodes.dup.insert(index, node_id)
    end

    def file_attachment_node(file_id, parent_id)
      {
        'type' => { 'resolvedName' => 'FileAttachment' },
        'nodes' => [],
        'props' => { 'fileId' => file_id },
        'custom' => {
          'title' => message('app.containers.admin.ContentBuilder.fileAttachment', 'File Attachment'),
          'noPointerEvents' => true
        },
        'hidden' => false,
        'parent' => parent_id,
        'isCanvas' => false,
        'displayName' => 'FileAttachment',
        'linkedNodes' => {}
      }
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
