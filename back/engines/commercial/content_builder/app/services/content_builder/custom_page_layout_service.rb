# frozen_string_literal: true

module ContentBuilder
  # Builds the craftjs graph for a custom page: a root and a body region holding the page's
  # content in the order it renders today. A section of plain text goes in a native
  # TextMultiloc widget; one holding media the text widget cannot render losslessly (inline
  # images, videos, CTA buttons) goes in the RichTextMultiloc bridge widget.
  #
  # A disabled section is skipped, because the front office does not render one either.
  class CustomPageLayoutService
    CODE = 'custom_page'

    ROOT_ID = 'ROOT'
    BODY_ID = 'CUSTOM_PAGE_BODY'
    TOP_INFO_ID = 'CUSTOM_PAGE_TOP_INFO'
    # One node per attached file, so the id carries the file it renders.
    FILE_ID_PREFIX = 'CUSTOM_PAGE_FILE_'
    BOTTOM_INFO_ID = 'CUSTOM_PAGE_BOTTOM_INFO'

    def craftjs_json_for(static_page)
      # Key order is the render order, and matches PageSections.tsx.
      sections = {
        TOP_INFO_ID => section_node(
          static_page.top_info_section_multiloc,
          enabled: static_page.top_info_section_enabled
        ),
        **file_nodes(static_page),
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

      # `ordered` sorts on position alone, and position is NULL on every row until TAN-5126
      # turns position management back on — so it needs a tie-break, or the same page derives
      # a different node order each time and the migration task rewrites it on every run.
      attachments = ::Files::FileAttachment.where(attachable: static_page).ordered.order(:created_at, :id)
      attachments.to_h do |attachment|
        [
          "#{FILE_ID_PREFIX}#{attachment.file_id}",
          Craftjs::Nodes.file_attachment(attachment.file_id, BODY_ID)
        ]
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
