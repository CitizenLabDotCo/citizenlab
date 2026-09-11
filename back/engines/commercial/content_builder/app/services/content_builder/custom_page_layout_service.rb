# frozen_string_literal: true

module ContentBuilder
  # Builds the craftjs graph a custom page's layout starts as, read from the page's own columns:
  # a root and a body region holding the page's content in the order the front office renders it.
  #
  # It runs only where a page has no layout yet — the backfill task, a newly created page, a new
  # tenant's template, and a layout created empty through the API. Once a layout exists the
  # builder owns it: an admin's edits are saved as sent, and nothing here runs again. So every
  # rule below decides what a page *starts* with, never what may be put on it afterwards.
  #
  # A section of plain text goes in a native TextMultiloc widget; one holding media the text
  # widget cannot render losslessly (inline images, videos, CTA buttons) goes in the
  # RichTextMultiloc bridge widget.
  #
  # A disabled section is skipped, because the front office does not render one either.
  class CustomPageLayoutService
    CODE = 'custom_page'

    ROOT_ID = 'ROOT'
    BODY_ID = 'CUSTOM_PAGE_BODY'
    TOP_INFO_ID = 'CUSTOM_PAGE_TOP_INFO'
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

    def file_nodes(static_page)
      return {} unless static_page.files_section_enabled

      # `file_attachments` sorts on position alone, and position is NULL on every row until TAN-5126
      # turns position management back on. Without a tie-break two derives of one page can
      # differ by order alone, so the migration task's overwrite rewrites rows nothing changed in.
      attachments = static_page.file_attachments.order(:created_at, :id)
      attachments.to_h do |attachment|
        [
          "#{FILE_ID_PREFIX}#{attachment.file_id}",
          Craftjs::Nodes.file_attachment(attachment.file_id, BODY_ID)
        ]
      end
    end

    # `hideProjects` in CustomPageProjectsAndEvents returns null above *both* blocks, despite its
    # name, so neither list renders without the feature or without a project filter. Deriving
    # either would also hand a tenant without the feature a live area filter it has no setting for.
    def project_lists_rendered?(static_page)
      static_page.projects_filter_type != 'no_filter' &&
        AppConfiguration.instance.feature_activated?('advanced_custom_pages')
    end

    def projects_node(static_page)
      return unless static_page.projects_enabled && project_lists_rendered?(static_page)

      Craftjs::Nodes.projects_by_filter(
        {
          'filterType' => static_page.projects_filter_type,
          'ids' => filter_ids(static_page),
          # The legacy section renders with `showTitle` false, so a migrated page shows no
          # heading until an admin writes one.
          'titleMultiloc' => {}
        },
        BODY_ID
      )
    end

    def events_node(static_page)
      return unless static_page.events_widget_enabled && project_lists_rendered?(static_page)

      Craftjs::Nodes.events(
        {
          'source' => static_page.projects_filter_type,
          'ids' => filter_ids(static_page),
          'timeFilters' => ['upcoming'],
          'limit' => 3,
          'projectPublicationStatuses' => ['published']
        },
        BODY_ID
      )
    end

    # The dimension, not the projects it resolves to: legacy re-resolves on every request, so
    # freezing project ids here would drop a project tagged into the area later.
    def filter_ids(static_page)
      case static_page.projects_filter_type
      when 'areas' then static_page.areas_static_pages.pluck(:area_id)
      when 'global_topics' then static_page.static_pages_global_topics.pluck(:global_topic_id)
      when 'spaces' then static_page.static_pages_spaces.pluck(:space_id)
      else []
      end
    end

    def section_node(multiloc, enabled:)
      return unless enabled
      return if section_blank?(multiloc)

      section_has_media?(multiloc) ? bridge_node(multiloc) : text_node(multiloc)
    end

    def section_blank?(multiloc)
      return true if multiloc.blank?

      multiloc.values.all? { |html| html_blank?(html) }
    end

    def section_has_media?(multiloc)
      return false if multiloc.blank?

      multiloc.values.any? { |html| html_has_media?(html) }
    end

    def text_node(multiloc)
      content_node('TextMultiloc', multiloc)
    end

    def bridge_node(multiloc)
      content_node('RichTextMultiloc', multiloc, custom: {
        'title' => {
          'id' => 'app.containers.admin.ContentBuilder.richTextMultiloc',
          'defaultMessage' => 'Rich text'
        }
      })
    end

    def content_node(resolved_name, multiloc, custom: {})
      {
        'type' => { 'resolvedName' => resolved_name },
        'isCanvas' => false,
        'props' => { 'text' => multiloc },
        'displayName' => resolved_name,
        'custom' => custom,
        'parent' => BODY_ID,
        'hidden' => false,
        'nodes' => [],
        'linkedNodes' => {}
      }
    end

    # Mirrors SanitizationService#with_content?: HTML counts as content when it has
    # visible text or an inline image/iframe.
    def html_blank?(html)
      fragment = Nokogiri::HTML.fragment(html.to_s)
      fragment.text.strip.empty? && %w[img iframe].none? { |tag| fragment.at(tag) }
    end

    def html_has_media?(html)
      fragment = Nokogiri::HTML.fragment(html.to_s)
      fragment.at('img') || fragment.at('iframe') || fragment.at_css('.custom-button')
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
