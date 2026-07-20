# frozen_string_literal: true

# LLM-facing documentation for project page layout widgets (code 'project_page'). The
# machine-readable rules these docs describe (slots, enums, multilocs) live in
# ContentBuilder::Craftjs::WidgetSpecs; widgets present there but absent here
# (Container, Box, the composite presets, the page scaffold) are structural or
# legacy-only — they validate inside graphs but are not advertised as insertable.
#
# The cheatsheet is generated from this hash, and a spec asserts every documented
# widget exists in WidgetSpecs and that every enum and slot value appears in its
# widget's doc, so rules and documentation cannot drift.
#
# NOTE: the custom.title values embed FE react-intl message ids. They are display-only
# metadata for the editor sidebar (nodes without them render fine) and the FE may rename
# ids at any time; we include the current ids for visual parity in the editor, accepting
# that stale ids degrade gracefully to the defaultMessage.
class McpServer::LayoutWidgets
  # The `type` every project page ROOT node carries (Validator root_type).
  ROOT_TYPE = { 'resolvedName' => 'ProjectPageRoot' }.freeze

  # The fixed page scaffold: exactly one node of each of these types exists on every
  # project page, locked in a fixed tree (see FORMAT_RULES). Patches may not add,
  # move, delete or edit them — except ProjectDescriptionSection's `nodes`.
  SCAFFOLD_WIDGETS = %w[
    ProjectPageRoot ProjectBanner ProjectTitle ProjectPageBody
    ProjectDescriptionSection PhasesWidget EventsWidget
  ].freeze

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
      AboutBox — project participation box. props: {"hideParticipationAvatars":false}
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.participationBox","defaultMessage":"Participation Box"},"noPointerEvents":true}
    DOC
    'FileAttachment' => <<~DOC,
      FileAttachment — downloadable file. props: {"fileId":"<Files::File id>"}
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.fileAttachment","defaultMessage":"File attachment"}}
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
    'HtmlBlockMultiloc' => <<~DOC
      HtmlBlockMultiloc — raw HTML block (sanitized server-side; scripts/forms are stripped). props: {"html":{"<locale>":"<full html>"}}
        custom: {"title":{"id":"app.containers.admin.content_builder.html_block.label","defaultMessage":"HTML block"}}
        Only for content the other widgets cannot express; prefer TextMultiloc for text.
    DOC
  }.freeze

  FORMAT_RULES = <<~RULES
    # Project page craftjs_json format

    The layout is a flat JSON object mapping node-id to node. Children hang off canvases
    via `nodes` (ordered) and named `linkedNodes` slots. Every node has exactly these keys:
    {"type":{"resolvedName":"<Widget>"},"isCanvas":false,"props":{...},"displayName":"<Widget>","custom":{...},"parent":"<parent-id>","hidden":false,"nodes":[],"linkedNodes":{}}

    ## Page scaffold (fixed — never add, move, delete or edit these nodes)

    Every project page contains exactly one node of each scaffold type, locked in this tree:
    ROOT (ProjectPageRoot) → ProjectBanner (header image), ProjectTitle, ProjectPageBody →
    ProjectDescriptionSection, PhasesWidget (phase timeline + input feed), EventsWidget.

    - ALL your content lives inside the ProjectDescriptionSection node. The one scaffold
      change allowed is sending that node itself with an updated `nodes` array, to add,
      remove or reorder your content at the top level.
    - The project title and header image are project attributes, not layout content: change
      them with the update_project tool (title_multiloc / remote_header_bg_url). The
      ProjectTitle/ProjectBanner widgets render from the project record.
    - The phase timeline and the events list are already on the page (PhasesWidget,
      EventsWidget) — do not rebuild phases or events as description content.
    - Legacy pages may hold their migrated description in a single RichTextMultiloc node
      (props: {"text":{"<locale>":"<html>"}}) inside the description section; edit it in
      place or replace it with proper widgets, but never create new RichTextMultiloc nodes.
  RULES

  CHEATSHEET = <<~CHEATSHEET.freeze
    #{FORMAT_RULES}
    Design tips — a description of only text blocks reads as a wall of text; vary the widgets:
    - Recommended shape: intro text → TwoColumn or ThreeColumn for parallel content
      (process stages, "why / what you influence") → ButtonMultiloc for the main call to
      action → AccordionMultiloc per FAQ/concern → AboutBox last.
    - Place a WhiteSpace widget between sections (after the intro, before each heading,
      around column blocks) — it is what gives layouts a clean, uncrowded look. Use
      "medium" between sections, "small" within them; add "withDivider": true for a
      subtle horizontal rule at strong topic changes.

    ## Widgets (insertable inside the description section)

    #{DOCS.values.join("\n")}
  CHEATSHEET

  # The compact reference for a validation-failure response: the format rules plus
  # docs for just the given widgets. Deliberately NOT the full cheatsheet — every
  # failed attempt puts its reference into the client's context, so full copies
  # would accumulate across retries.
  def self.reference_for(widget_names)
    [FORMAT_RULES, *DOCS.values_at(*widget_names.uniq).compact].join("\n")
  end
end
