# frozen_string_literal: true

# LLM-facing documentation for project page layout widgets. The machine-readable rules
# these docs describe live in content_builder (ContentBuilder::Craftjs::WidgetSpecs and
# ContentBuilder::ProjectPageLayoutService); specs assert docs and rules cannot drift.
#
# The custom.title values embed FE react-intl message ids. They are display-only
# metadata for the editor sidebar; stale ids degrade gracefully to the defaultMessage.
class McpServer::LayoutWidgets
  BODY_WIDGET = ContentBuilder::ProjectPageLayoutService::BODY_WIDGET

  # Suggested replacement per legacy node type, used in error messages.
  LEGACY_ALTERNATIVES = {
    'RichTextMultiloc' => 'use TextMultiloc for rich text',
    'ProjectDescriptionSection' => "put the content directly in the #{BODY_WIDGET} node"
  }.freeze

  # Widgets belonging to the custom page builder, undocumented here for scope rather than for
  # being uninsertable: this tool only writes project layouts, where none of them can appear.
  # ProjectsByFilter, EventsByProjects and CustomPageTitle are insertable on a custom page
  # whenever an admin wants them; CustomPageRoot and CustomPageBody are that page's scaffold.
  CUSTOM_PAGE_WIDGETS = %w[
    ProjectsByFilter
    EventsByProjects
    CustomPageTitle
    CustomPageRoot
    CustomPageBody
  ].freeze

  # WidgetSpecs widgets deliberately not advertised as insertable: structural
  # containers, legacy-only presets and the legacy node types. A spec asserts
  # DOCS + this list + the page scaffold covers WidgetSpecs exactly.
  UNDOCUMENTED_WIDGETS = (%w[
    Container
    Box
    ImageTextCards
    InfoWithAccordions
  ] + CUSTOM_PAGE_WIDGETS + ContentBuilder::Craftjs::WidgetSpecs::LEGACY_WIDGETS).freeze

  DOCS = {
    'TextMultiloc' => <<~DOC,
      TextMultiloc — rich text. props: {"text":{"<locale>":"<p>html</p> or <h2>html</h2>"}}
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.textMultiloc","defaultMessage":"Text"}}
    DOC
    'ButtonMultiloc' => <<~DOC,
      ButtonMultiloc — link button. props: {"text":{"<locale>":"label"},"url":"https://...","type":"primary"|"secondary-outlined","alignment":"left"|"center"|"right"|"fullWidth"}
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.buttonMultiloc","defaultMessage":"Button"}}
    DOC
    'ImageMultiloc' => <<~DOC,
      ImageMultiloc — image. props: {"image":{"imageUrl":"<public url>"},"alt":{"<locale>":"alt text"}}
        For existing images keep the "dataCode" key exactly as returned by get_project_layout.
        For new images pass only "imageUrl" (a public URL); the backend imports it.
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.imageMultiloc","defaultMessage":"Image"}}
    DOC
    'IframeMultiloc' => <<~DOC,
      IframeMultiloc — embed. props: {"url":"https://...","height":500,"hasError":false,"title":{"<locale>":"accessibility title"},"embedMode":"fixed"|"aspectRatio","aspectRatio":"16:9"|"4:3"|"3:4"|"1:1"|"custom"}
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.url","defaultMessage":"Embed"}}
    DOC
    'AccordionMultiloc' => <<~DOC,
      AccordionMultiloc — collapsible section. props: {"title":{"<locale>":"plain title"},"openByDefault":false}
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.accordionMultiloc","defaultMessage":"Accordion"},"hasChildren":true}
        IMPORTANT: the accordion body is NOT a prop. It must be a Container node wired through
        linkedNodes: {"accordion-content":"<container-id>"} — same Container pattern as columns —
        with the body content (e.g. a TextMultiloc) as the Container's child. An accordion
        without this container renders empty.
    DOC
    'WhiteSpace' => <<~DOC,
      WhiteSpace — vertical spacing. props: {"size":"small"|"medium"|"large","withDivider":false}
        custom: {"title":{"id":"app.containers.AdminPage.ProjectDescription.whiteSpace","defaultMessage":"White space"}}
    DOC
    'AboutBox' => <<~DOC,
      AboutBox — project participation box (the actions a visitor can take). props: {"hideParticipationAvatars":false,"hiddenOptionIds":["<phase id>"],"collapsedButtonTitleMultiloc":{"<locale>":"label"}}
        All optional; collapsedButtonTitleMultiloc labels the button shown when several options collapse.
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.participationBox","defaultMessage":"Participation Box"},"noPointerEvents":true}
    DOC
    'FileAttachment' => <<~DOC,
      FileAttachment — downloadable file. props: {"fileId":"<Files::File id>"}
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.fileAttachment","defaultMessage":"File attachment"}}
    DOC
    'PageLink' => <<~DOC,
      PageLink — link to one of the project's static pages. props: {"pageId":"<CustomPage id>","displayType":"link"|"preview"}
        "link" renders a single titled row; "preview" renders the title plus an excerpt of the page.
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.projectPageLink","defaultMessage":"Project Page Link"},"noPointerEvents":true}
        No tool here lists static pages, so only reuse a pageId already in this layout or one
        the user gives you — never invent one. A pageId that resolves to nothing renders nothing.
    DOC
    'TwoColumn' => <<~DOC,
      TwoColumn — two side-by-side columns. props: {"columnLayout":"1-1"|"2-1"|"1-2"}
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.twoColumnLayout","defaultMessage":"2 column"},"hasChildren":true}
        Columns are separate Container nodes wired through linkedNodes (NOT through nodes):
        linkedNodes: {"left":"<container-id>","right":"<container-id>"}
        Each column Container: {"type":{"resolvedName":"Container"},"isCanvas":true,"props":{},"custom":{},"parent":"<twocolumn-id>","hidden":false,"displayName":"Container","nodes":["<content ids>"],"linkedNodes":{}}
        Content nodes inside a column have parent = the Container's id.
    DOC
    'ThreeColumn' => <<~DOC,
      ThreeColumn — three columns, same Container pattern with slots "column1", "column2", "column3". props: {}
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.threeColumnLayout","defaultMessage":"3 column"},"hasChildren":true}
    DOC
    'HtmlBlockMultiloc' => <<~DOC,
      HtmlBlockMultiloc — raw HTML block (sanitized server-side; scripts/forms are stripped). props: {"html":{"<locale>":"<full html>"}}
        custom: {"title":{"id":"app.containers.admin.content_builder.html_block.label","defaultMessage":"HTML block"}}
        Only for content the other widgets cannot express; prefer TextMultiloc for text.
    DOC
    'PhasesWidget' => <<~DOC,
      PhasesWidget — the project's phase timeline plus the input feed of the current phase.
        props: {"sectionBackground":"colored"|"white"}
        custom: {"title":{"id":"app.components.ProjectPageBuilder.Widgets.phasesWidgetTitle","defaultMessage":"Phases"},"noPointerEvents":true}
        Renders entirely from the project's phases, which are managed with create_phase/update_phase.
        Keep one on the page unless the project has no participation at all. sectionBackground
        defaults to "colored" as a direct child of ProjectPageBody, "white" when nested deeper.
        This and EventsWidget paint a full-width band: alternate their sectionBackground with
        the plain content around them rather than stacking two "colored" bands together.
    DOC
    'EventsWidget' => <<~DOC,
      EventsWidget — the project's upcoming and past events. props: {"sectionBackground":"colored"|"white"}
        custom: {"title":{"id":"app.components.ProjectPageBuilder.Widgets.eventsWidgetTitle","defaultMessage":"Events"},"noPointerEvents":true}
        Renders entirely from the project's events (create them with create_event); it renders
        nothing when there are none. Defaults to "white".
    DOC
    'ExtraSurveysWidget' => <<~DOC
      ExtraSurveysWidget — call to action for one spotlight survey, which runs alongside the
      timeline. Named "Spotlight surveys" in the UI; the node name is kept for stored layouts.
        props: {"surveyPhaseId":"<phase id>","buttonFormat":"button"|"card","buttonStyle":"primary"|"secondary-outlined","buttonText":{"<locale>":"label"}}
        custom: {"title":{"id":"app.components.ProjectPageBuilder.Widgets.extraSurveysWidgetTitle2","defaultMessage":"Spotlight surveys"},"noPointerEvents":true}
        surveyPhaseId must be a phase with placement_type "standalone" and participation_method
        "native_survey" (list_phases). "card" shows title, dates and status; "button" is just the
        button. Defaults: buttonFormat "card", buttonStyle "primary". Only renders when the
        platform has the parallel_participation feature.
    DOC
  }.freeze

  FORMAT_RULES = <<~RULES
    # Project page craftjs_json format

    The layout is a flat JSON object mapping node-id to node. Children hang off canvases
    via `nodes` (ordered) and named `linkedNodes` slots. Every node has exactly these keys:
    {"type":{"resolvedName":"<Widget>"},"isCanvas":false,"props":{...},"displayName":"<Widget>","custom":{...},"parent":"<parent-id>","hidden":false,"nodes":[],"linkedNodes":{}}

    ## Page scaffold (fixed — never add, move, delete or edit these nodes)

    Every project page contains exactly one node of each scaffold type, in this tree:
    ROOT (ProjectPageRoot) → ProjectBanner (header image), ProjectTitle, #{BODY_WIDGET}.

    - The one scaffold change allowed is sending the #{BODY_WIDGET} node itself with an
      updated `nodes` array, to add, remove or reorder the page's top-level content.
      Everything else about that node — `parent`, `custom`, `props` — must come back
      exactly as get_project_layout returned it; only `nodes` may change. Keep every id
      you still want on the page: dropping one detaches the node instead of deleting it,
      and the update is rejected. Use delete_node_ids to remove things.
    - The project title and header image are project attributes, not layout content: change
      them with the update_project tool (title_multiloc / remote_header_bg_url). The
      ProjectTitle/ProjectBanner widgets render from the project record.

    ## Page content (yours to arrange)

    - ALL your content lives inside the #{BODY_WIDGET} node.
    - PhasesWidget, EventsWidget and ExtraSurveysWidget are ordinary widgets: reorder, nest,
      remove or leave them out like any other.
    - Two node types are legacy: a RichTextMultiloc holding a migrated description, and a
      ProjectDescriptionSection wrapping the content of a page saved before the builder was
      unlocked. Edit them in place or delete them, but creating new ones is rejected.
    - Ignore any custom.locked marker on a stored node — this document is what may be edited.
  RULES

  # Format rules plus docs for just the given widgets, to keep validation-error
  # responses small. (reference_for(DOCS.keys) is the full cheatsheet.)
  def self.reference_for(widget_names)
    [FORMAT_RULES, *DOCS.values_at(*widget_names.uniq).compact].join("\n")
  end
end
