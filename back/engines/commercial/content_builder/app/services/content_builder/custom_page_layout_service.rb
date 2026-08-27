# frozen_string_literal: true

module ContentBuilder
  # Builds the craftjs graph for a custom page: a root and a body region holding the page's
  # content in the order it renders today.
  #
  # Anything the front office does not render is skipped, so a migrated page carries the same
  # content. Its layout follows the builder's conventions rather than the legacy page's.
  class CustomPageLayoutService
    CODE = 'custom_page'

    ROOT_ID = 'ROOT'
    BODY_ID = 'CUSTOM_PAGE_BODY'
    TOP_INFO_ID = 'CUSTOM_PAGE_TOP_INFO'
    # One node per attached file, so the id carries the file it renders.
    FILE_ID_PREFIX = 'CUSTOM_PAGE_FILE_'
    PROJECTS_ID = 'CUSTOM_PAGE_PROJECTS'
    EVENTS_ID = 'CUSTOM_PAGE_EVENTS'
    BOTTOM_INFO_ID = 'CUSTOM_PAGE_BOTTOM_INFO'

    def craftjs_json_for(static_page)
      # Key order is the render order, and matches PageSections.tsx.
      sections = {
        TOP_INFO_ID => section_node(
          static_page.top_info_section_multiloc,
          enabled: static_page.top_info_section_enabled
        ),
        **file_nodes(static_page),
        PROJECTS_ID => projects_node(static_page),
        EVENTS_ID => events_node(static_page),
        BOTTOM_INFO_ID => section_node(
          static_page.bottom_info_section_multiloc,
          enabled: static_page.bottom_info_section_enabled
        )
      }.compact

      canonical_nodes(sections.keys).merge(sections)
    end

    private

    # Stacked, unlike the two-column block `project_page` builds, because that is how the
    # page renders them today.
    def file_nodes(static_page)
      return {} unless static_page.files_section_enabled

      attachments = ::Files::FileAttachment.where(attachable: static_page).ordered
      attachments.to_h do |attachment|
        [
          "#{FILE_ID_PREFIX}#{attachment.file_id}",
          Craftjs::Nodes.file_attachment(attachment.file_id, BODY_ID)
        ]
      end
    end

    # CustomPageProjectsAndEvents hides both lists unless the feature is on and a real filter
    # is set: its `hideProjects` early return sits above the events block too, despite the name.
    def project_lists_rendered?(static_page)
      !static_page.no_filter? &&
        AppConfiguration.instance.feature_activated?('advanced_custom_pages')
    end

    def projects_node(static_page)
      return unless static_page.projects_enabled && project_lists_rendered?(static_page)

      widget_node(
        'ProjectsByFilter',
        'app.components.CustomPageBuilder.Widgets.ProjectsByFilter.filteredProjects',
        'Filtered projects',
        'filterType' => static_page.projects_filter_type,
        'ids' => projects_filter_ids(static_page),
        # No heading: the legacy section renders with showTitle false.
        'titleMultiloc' => {}
      )
    end

    def events_node(static_page)
      return unless static_page.events_widget_enabled && project_lists_rendered?(static_page)

      widget_node(
        'EventsByProjects',
        'app.components.CustomPageBuilder.Widgets.EventsByProjects.events',
        'Events',
        'mode' => static_page.projects_filter_type,
        'ids' => projects_filter_ids(static_page)
      )
    end

    # The associations StaticPage#filter_projects reads, as ids: the widgets take the
    # dimension and resolve projects themselves.
    def projects_filter_ids(static_page)
      case static_page.projects_filter_type
      when 'areas' then static_page.areas_static_pages.pluck(:area_id)
      when 'global_topics' then static_page.static_pages_global_topics.pluck(:global_topic_id)
      when 'spaces' then static_page.static_pages_spaces.pluck(:space_id)
      else []
      end
    end

    # craftjs restores `custom` from the stored graph rather than from the component's
    # craft.custom, so a derived node has to carry what a dragged one would.
    def widget_node(name, title_id, title, **props)
      {
        'type' => { 'resolvedName' => name },
        'nodes' => [],
        'props' => props,
        'custom' => {
          'title' => { 'id' => title_id, 'defaultMessage' => title },
          'noPointerEvents' => true
        },
        'hidden' => false,
        'parent' => BODY_ID,
        'isCanvas' => false,
        'displayName' => name,
        'linkedNodes' => {}
      }
    end

    def section_node(multiloc, enabled:)
      return unless enabled
      return if description_layout_service.description_blank?(multiloc)

      node = if description_layout_service.description_has_media?(multiloc)
        description_layout_service.bridge_node(multiloc)
      else
        description_layout_service.text_node(multiloc)
      end

      # The node builders hardcode ROOT as the parent; here sections hang off the body.
      node.merge('parent' => BODY_ID)
    end

    def description_layout_service
      @description_layout_service ||= DescriptionLayoutService.new
    end

    def canonical_nodes(section_ids)
      {
        ROOT_ID => {
          'type' => { 'resolvedName' => 'CustomPageRoot' },
          'nodes' => [BODY_ID],
          'props' => {},
          'custom' => { 'region' => true },
          'hidden' => false,
          'isCanvas' => true,
          'displayName' => 'CustomPageRoot',
          'linkedNodes' => {}
        },
        BODY_ID => {
          'type' => { 'resolvedName' => 'CustomPageBody' },
          'nodes' => section_ids,
          'props' => {},
          'custom' => { 'region' => true },
          'hidden' => false,
          'parent' => ROOT_ID,
          'isCanvas' => true,
          'displayName' => 'CustomPageBody',
          'linkedNodes' => {}
        }
      }
    end
  end
end
