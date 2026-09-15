# frozen_string_literal: true

module ContentBuilder
  # Builds the craftjs graph a custom page's layout starts as, read from the page's own columns:
  # a root and a body region holding the page's content in the order the front office renders
  # it — the banner (when the page shows one), the title, then the sections. Nothing is pinned:
  # as on the homepage, an admin can reorder any of it.
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
    BANNER_ID = 'CUSTOM_PAGE_BANNER'
    TITLE_ID = 'CUSTOM_PAGE_TITLE'
    BODY_ID = 'CUSTOM_PAGE_BODY'
    TOP_INFO_ID = 'CUSTOM_PAGE_TOP_INFO'
    FILE_ID_PREFIX = 'CUSTOM_PAGE_FILE_'
    PROJECTS_ID = 'CUSTOM_PAGE_PROJECTS'
    EVENTS_ID = 'CUSTOM_PAGE_EVENTS'
    BOTTOM_INFO_ID = 'CUSTOM_PAGE_BOTTOM_INFO'

    # Namespace for the banner image's code (see #banner_image). Arbitrary, but must not change:
    # a different namespace derives a different code for every page and copies every image again.
    BANNER_IMAGE_NAMESPACE = '3f1c7b2e-6a4d-4e8b-9c5f-2d7a8e1b4c60'

    # `persist_images: false` derives the same graph without copying the banner image, for a
    # dry run that only compares.
    def craftjs_json_for(static_page, persist_images: true)
      # Key order is the render order: the header pair, then the sections as PageSections.tsx
      # has them.
      sections = {
        BANNER_ID => banner_node(static_page, persist_images: persist_images),
        TITLE_ID => title_node(static_page),
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

    # Unlike the title, a page may simply not have a banner, so this is seeded only when the page
    # shows one — deletable, where the title is not. It leads the body because that is where the
    # legacy page renders it. Its content is copied into the node, as the info sections' is: nothing
    # outside the page reads the banner_* columns, and the legacy hero tab goes at the cutover.
    # Prop names are neutral rather than the homepage banner's `banner_signed_out_*` so a merged
    # banner widget could adopt them as its base variant unchanged.
    def banner_node(static_page, persist_images:)
      return unless static_page.banner_enabled

      {
        'type' => { 'resolvedName' => 'CustomPageBanner' },
        'nodes' => [],
        'props' => {
          'layout' => static_page.banner_layout,
          'headerMultiloc' => static_page.banner_header_multiloc,
          'subheaderMultiloc' => static_page.banner_subheader_multiloc,
          'overlayColor' => static_page.banner_overlay_color,
          'overlayOpacity' => static_page.banner_overlay_opacity,
          'ctaType' => static_page.banner_cta_button_type,
          'ctaTextMultiloc' => static_page.banner_cta_button_multiloc,
          'ctaUrl' => static_page.banner_cta_button_url,
          'image' => banner_image(static_page, persist: persist_images)
        },
        'custom' => {
          'title' => {
            'id' => 'app.components.CustomPageBuilder.Widgets.CustomPageBanner.title',
            'defaultMessage' => 'Banner'
          },
          'noPointerEvents' => true
        },
        'hidden' => false,
        'parent' => BODY_ID,
        'isCanvas' => false,
        'displayName' => 'CustomPageBanner',
        'linkedNodes' => {}
      }
    end

    # The image becomes a LayoutImage, referenced by code like any builder image, so the layout
    # serializer, duplication and tenant templates all handle it as they do the homepage's. The
    # code is derived from the page and the stored filename rather than generated: a re-derive
    # then finds the copy it made before, so an unchanged page derives an identical graph and the
    # migration task's overwrite leaves it alone. A replaced header image gets a new code and a
    # new copy, which is the rewrite that should happen. The `large` version is copied because it
    # is the one every banner layout renders.
    def banner_image(static_page, persist:)
      return {} unless static_page.header_bg?

      code = Digest::UUID.uuid_v5(BANNER_IMAGE_NAMESPACE, "#{static_page.id}/#{static_page.header_bg_identifier}")
      if persist
        LayoutImage.find_or_create_by!(code: code) do |image|
          image.image = header_bg_data_uri(static_page)
        end
      end

      { 'dataCode' => code }
    end

    # A data URI rather than `remote_image_url`, which would download the tenant's own upload
    # over HTTP and cannot work in a test environment with local storage.
    def header_bg_data_uri(static_page)
      data = static_page.header_bg.large.read
      mime = Marcel::MimeType.for(StringIO.new(data), name: static_page.header_bg_identifier)
      "data:#{mime};base64,#{Base64.strict_encode64(data)}"
    end

    # Every page has a title_multiloc — it is the page name — but only a page without a banner
    # displays it; a banner carries its own banner_header_multiloc. So the node is always there
    # and `showTitle` carries what the page shows. It follows the banner so that switching it on
    # puts the heading under the banner, not above it. The heading itself is read from the
    # record, not copied here: title_multiloc also names the page in the admin list and is the
    # nav bar item's fallback title, so the layout cannot be its only home.
    def title_node(static_page)
      {
        'type' => { 'resolvedName' => 'CustomPageTitle' },
        'nodes' => [],
        'props' => { 'showTitle' => !static_page.banner_enabled },
        'custom' => {
          'title' => {
            'id' => 'app.components.CustomPageBuilder.Widgets.CustomPageTitle.title',
            'defaultMessage' => 'Title'
          },
          # Settings panel yes, delete button no: hiding the heading is what `showTitle` is for.
          # Not `locked`, which would also pin it in place.
          'deletable' => false,
          'noPointerEvents' => true
        },
        'hidden' => false,
        'parent' => BODY_ID,
        'isCanvas' => false,
        'displayName' => 'CustomPageTitle',
        'linkedNodes' => {}
      }
    end

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
