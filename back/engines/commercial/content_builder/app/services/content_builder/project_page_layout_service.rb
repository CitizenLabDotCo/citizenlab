# frozen_string_literal: true

module ContentBuilder
  class ProjectPageLayoutService
    CODE = 'project_page'

    ROOT_ID = 'ROOT'
    BANNER_ID = 'PROJECT_PAGE_BANNER'
    TITLE_ID = 'PROJECT_PAGE_TITLE'
    BODY_ID = 'PROJECT_PAGE_BODY'
    DESCRIPTION_ID = 'PROJECT_PAGE_DESCRIPTION'
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

      if description_layout
        from_description_craftjs(description_layout.craftjs_json)
      else
        from_description_multiloc(project.description_multiloc)
      end
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

      canonical_nodes([node_id]).merge(node_id => node.merge('parent' => DESCRIPTION_ID))
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

      top_level_ids.each { |id| nodes[id]['parent'] = DESCRIPTION_ID }

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
      Craftjs::Query.resolved_name(node)
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
          'nodes' => [DESCRIPTION_ID, PHASES_ID, EVENTS_ID],
          'props' => {},
          'custom' => { 'region' => true },
          'hidden' => false,
          'parent' => ROOT_ID,
          'isCanvas' => true,
          'displayName' => 'ProjectPageBody',
          'linkedNodes' => {}
        },
        DESCRIPTION_ID => {
          'type' => { 'resolvedName' => 'ProjectDescriptionSection' },
          'nodes' => description_ids,
          'props' => {},
          'custom' => {
            'title' => message('app.components.ProjectPageBuilder.Widgets.descriptionSectionTitle', 'Description'),
            'locked' => true
          },
          'hidden' => false,
          'parent' => BODY_ID,
          'isCanvas' => true,
          'displayName' => 'ProjectDescriptionSection',
          'linkedNodes' => {}
        },
        PHASES_ID => {
          'type' => { 'resolvedName' => 'PhasesWidget' },
          'nodes' => [],
          'props' => {},
          'custom' => {
            'title' => message('app.components.ProjectPageBuilder.Widgets.phasesWidgetTitle', 'Phases'),
            'locked' => true,
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
            'locked' => true,
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
