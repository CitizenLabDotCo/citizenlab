# frozen_string_literal: true

module ContentBuilder
  # Builds `project_page` craftjs layouts, used by the SideFx provisioning hooks
  # and the one-time project page migration.
  #
  # The structure mirrors the frontend `defaultLayout.ts` (`defaultProjectPageLayout`
  # + `ensureLockedHeaderNodes`) — keep the two in sync: a locked banner + title
  # above a body frozen to description section → timeline → phase content → events.
  # The description section holds the project's description content; it is the
  # subtree the legacy description editor edits and the legacy project page renders.
  class ProjectPageLayoutService
    CODE = 'project_page'

    ROOT_ID = 'ROOT'
    BANNER_ID = 'PROJECT_PAGE_BANNER'
    TITLE_ID = 'PROJECT_PAGE_TITLE'
    BODY_ID = 'PROJECT_PAGE_BODY'
    DESCRIPTION_ID = 'PROJECT_PAGE_DESCRIPTION'
    TIMELINE_ID = 'PROJECT_PAGE_TIMELINE'
    INPUT_FEED_ID = 'PROJECT_PAGE_INPUT_FEED'
    EVENTS_ID = 'PROJECT_PAGE_EVENTS'

    # Widgets absent from the project page resolver; left in place they crash
    # craft.js on deserialize, so they are stripped with their subtrees.
    # Keep in sync with REMOVED_WIDGETS in defaultLayout.ts.
    UNSUPPORTED_WIDGETS = %w[
      FolderFiles
      FolderTitle
      Published
      Selection
      Spotlight
      ExtraSurveysWidget
    ].freeze

    # Re-key injected nodes so they can't collide with the fixed PROJECT_PAGE_* ids.
    INJECTED_ID_PREFIX = 'd_'

    # The project page layout for a project: description content comes from its
    # project_description layout when one exists, otherwise from its
    # description_multiloc.
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

    # Injects a project_description layout's content nodes into the description
    # section, re-keyed and stripped of unsupported widgets.
    def from_description_craftjs(description_craftjs)
      injected_nodes, injected_top_level_ids = inject_description(description_craftjs || {})
      canonical_nodes(injected_top_level_ids).merge(injected_nodes)
    end

    # Wraps a WYSIWYG description in a single content node inside the section:
    # the lossless RichTextMultiloc bridge when it holds media, a native
    # TextMultiloc otherwise, nothing when blank.
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

    # Re-keys, re-parents and strips the description's content nodes, ready to be
    # merged into the description section. Returns [nodes_hash, ordered_top_level_ids].
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

      # The description's top-level children become children of the section.
      top_level_ids.each { |id| nodes[id]['parent'] = DESCRIPTION_ID }

      [nodes, top_level_ids]
    end

    # All node ids whose widget is unsupported, plus every descendant, so an
    # unsupported subtree is removed whole.
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

    # Deep-dups a node and rewrites every id reference (parent, nodes, linkedNodes)
    # through the id map, dropping references to stripped nodes.
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
          'nodes' => [DESCRIPTION_ID, TIMELINE_ID, INPUT_FEED_ID, EVENTS_ID],
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
        TIMELINE_ID => {
          'type' => { 'resolvedName' => 'TimelineWidget' },
          'nodes' => [],
          'props' => {},
          'custom' => {
            'title' => message('app.components.ProjectPageBuilder.Widgets.timelineWidgetTitle', 'Timeline'),
            'locked' => true,
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => BODY_ID,
          'isCanvas' => false,
          'displayName' => 'TimelineWidget',
          'linkedNodes' => {}
        },
        INPUT_FEED_ID => {
          'type' => { 'resolvedName' => 'InputFeed' },
          'nodes' => [],
          'props' => {},
          'custom' => {
            'title' => message('app.components.ProjectPageBuilder.Widgets.inputFeedWidgetTitle2', 'Phase content'),
            'locked' => true,
            'noPointerEvents' => true
          },
          'hidden' => false,
          'parent' => BODY_ID,
          'isCanvas' => false,
          'displayName' => 'InputFeed',
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

    # craft.js persists `custom.title` as a resolved react-intl descriptor;
    # reproduced here so the json is a fixed point of `ensureLockedHeaderNodes`.
    def message(id, default_message)
      { 'id' => id, 'defaultMessage' => default_message }
    end
  end
end
