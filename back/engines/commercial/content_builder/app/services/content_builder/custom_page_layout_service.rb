# frozen_string_literal: true

module ContentBuilder
  # Builds the craftjs graph for a custom page: a root and a body region wrapping the page's
  # top and bottom info sections. Widget choice per section is DescriptionLayoutService's,
  # reused here.
  #
  # A disabled section is skipped, because the front office does not render one either.
  class CustomPageLayoutService
    CODE = 'custom_page'

    ROOT_ID = 'ROOT'
    BODY_ID = 'CUSTOM_PAGE_BODY'
    TOP_INFO_ID = 'CUSTOM_PAGE_TOP_INFO'
    BOTTOM_INFO_ID = 'CUSTOM_PAGE_BOTTOM_INFO'

    def craftjs_json_for(static_page)
      sections = {
        TOP_INFO_ID => section_node(
          static_page.top_info_section_multiloc,
          enabled: static_page.top_info_section_enabled
        ),
        BOTTOM_INFO_ID => section_node(
          static_page.bottom_info_section_multiloc,
          enabled: static_page.bottom_info_section_enabled
        )
      }.compact

      canonical_nodes(sections.keys).merge(sections)
    end

    private

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
