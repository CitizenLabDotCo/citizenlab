# frozen_string_literal: true

# LLM-facing documentation for platform homepage layout widgets, mirroring
# McpServer::LayoutWidgets (project pages). Shared content widgets reuse LayoutWidgets::DOCS;
# only the homepage-only widgets and the homepage FORMAT_RULES live here. The machine-readable
# rules are ContentBuilder::Craftjs::WidgetSpecs::HOMEPAGE_SPECS; a spec asserts docs and rules
# cannot drift.
class McpServer::HomepageWidgets
  # The homepage banner is the fixed header — always present and singular — so it is
  # protected by type on every tenant (older seeds omit the custom.noDelete marker). Any
  # node explicitly marked custom.noDelete (e.g. the FE marks Projects) is protected too.
  # Protected nodes are editable but not deletable/movable.
  FIXED_WIDGETS = %w[HomepageBanner].freeze

  def self.protected?(node)
    return false unless node.is_a?(Hash)

    FIXED_WIDGETS.include?(ContentBuilder::Craftjs::Query.resolved_name(node)) ||
      node.dig('custom', 'noDelete') == true
  end

  DOCS = {
    'HomepageBanner' => <<~DOC,
      HomepageBanner — the top banner. Fixed (custom.noDelete): edit it, never delete it.
        props: {"homepageSettings":{...},"image":{"imageUrl":"<public url>"}}
        homepageSettings keys: banner_layout ("full_width_banner_layout"|"two_column_layout"|"two_row_layout"|"fixed_ratio_layout"),
        banner_avatars_enabled (bool), banner_signed_out_header_multiloc, banner_signed_out_subheader_multiloc,
        banner_signed_in_header_multiloc, banner_cta_signed_out_type / banner_cta_signed_in_type
        ("sign_up_button"|"no_button"|"customized_button"), banner_cta_signed_out_text_multiloc / _url,
        banner_cta_signed_in_text_multiloc / _url, banner_signed_out_header_overlay_color / _opacity, and the signed_in equivalents.
        ALWAYS copy the full homepageSettings object from get_homepage_layout and change only the fields you mean to.
        Image: new = pass image.imageUrl (public URL); existing = keep image.dataCode exactly as returned.
    DOC
    'Projects' => <<~DOC,
      Projects — the list of published projects and folders. Renders the platform's projects
      automatically. props: {"currentlyWorkingOnText":{"<locale>":"heading"}}.
        Some homepages mark it non-deletable (outline locked: true) — then edit it, don't delete it.
    DOC
    'Highlight' => <<~DOC,
      Highlight — a call-to-action band with a heading, text and a button.
        Copy the exact prop shape from get_homepage_layout; multiloc text fields plus a button url.
    DOC
    'VideoEmbed' => <<~DOC,
      VideoEmbed — an embedded video. props: {"url":"https://..."} (YouTube/Vimeo/etc.).
    DOC
    'Areas' => <<~DOC,
      Areas — shows the platform's areas as navigable tiles. Renders automatically; no ids needed.
    DOC
    'Published' => <<~DOC,
      Published — a feed of recently published/finished items. Renders automatically; no ids needed.
    DOC
    'Events' => <<~DOC,
      Events — upcoming events across the platform. Renders automatically; no ids needed.
    DOC
    'CommunityMonitorCTA' => <<~DOC,
      CommunityMonitorCTA — a call to action for the community monitor survey. Auto-resolved; no ids needed.
    DOC
    'FollowedItems' => <<~DOC,
      FollowedItems — items the visitor follows. Renders per-visitor automatically; no ids needed.
    DOC
    'OpenToParticipation' => <<~DOC,
      OpenToParticipation — projects currently open to participation. Renders automatically; no ids needed.
    DOC
    'FinishedOrArchived' => <<~DOC,
      FinishedOrArchived — finished or archived projects. Renders automatically; no ids needed.
    DOC
    'Selection' => <<~DOC,
      Selection — a curated list of specific projects and folders you choose.
        props: {"adminPublicationIds":["<admin_publication id>", ...]} (array order = display order)
        Get the ids from list_admin_publications — these are admin-publication ids, a DIFFERENT id
        space from project/folder ids.
    DOC
    'CustomPages' => <<~DOC,
      CustomPages — tiles linking to the platform's custom pages.
        props: {"customPages":[{"id":"<static page id>","icon":"<optional icon>","image":{"imageUrl":"<public url>"}}]}
        Get each id from list_custom_pages. icon and image are optional per page (new image =
        imageUrl, existing = keep dataCode).
    DOC
    'EventsList' => <<~DOC,
      EventsList — upcoming and past events across a chosen scope.
        props: {"source":"all"|"projects"|"areas"|"global_topics"|"spaces","ids":["<id>", ...]}
        source "all" needs no ids. "projects" → project ids (list_projects), "areas" → area ids
        (list_areas), "global_topics" → topic ids (list_global_topics), "spaces" → space ids
        (list_spaces; only when the spaces feature is enabled). Renders the matching events automatically.
    DOC
    'Spotlight' => <<~DOC
      Spotlight — highlights one project or folder.
        props: {"publicationId":"<project or folder id>","publicationType":"project"|"folder", ...text multilocs}
        Use list_projects (publicationType "project") or list_folders (publicationType "folder") to get the id.
    DOC
  }.freeze

  # Homepage docs plus the shared-widget docs from the project catalogue, so every widget an
  # error can name has an entry without re-authoring the shared ones.
  ALL_DOCS = McpServer::LayoutWidgets::DOCS.merge(DOCS).freeze

  FORMAT_RULES = <<~RULES
    # Platform homepage craftjs_json format

    The layout is a flat JSON object mapping node-id to node. Children hang off canvases via
    `nodes` (ordered) and named `linkedNodes` slots. Every node has exactly these keys:
    {"type":{"resolvedName":"<Widget>"},"isCanvas":false,"props":{...},"displayName":"<Widget>","custom":{...},"parent":"<parent-id>","hidden":false,"nodes":[],"linkedNodes":{}}

    ## Structure (differs from project pages)

    - ROOT is a plain container: {"type":"div","isCanvas":true,...}. There is NO body node —
      all content sits directly under ROOT, and ROOT's `nodes` array is the top-level order.
    - The HomepageBanner is fixed: you may EDIT it, but must not delete it or drop it from
      ROOT's `nodes`. Some homepages mark other widgets custom.noDelete — those are fixed too.
      Outline entries with locked: true are the fixed widgets.
    - To add or reorder top-level content, send the ROOT node with an updated `nodes` array
      (keep the fixed widgets' ids). To remove content use delete_node_ids — never a fixed widget.
    - Copy the exact shape of existing nodes from get_homepage_layout. For images
      (HomepageBanner, ImageMultiloc): new image = pass props.image.imageUrl (a public URL);
      existing image = keep props.image.dataCode exactly as returned.
  RULES

  # Format rules plus docs for just the given widgets, to keep validation-error responses small.
  def self.reference_for(widget_names)
    [FORMAT_RULES, *ALL_DOCS.values_at(*widget_names.uniq).compact].join("\n")
  end
end
