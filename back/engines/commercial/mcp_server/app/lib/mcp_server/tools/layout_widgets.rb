# frozen_string_literal: true

# LLM-facing documentation for project-description layout widgets. The
# machine-readable rules these docs describe (slots, enums, multilocs) live in
# ContentBuilder::Craftjs::WidgetSpecs; widgets present there but absent here
# (Container, Box, the composite presets) are structural or legacy-only — they
# validate inside graphs but are not advertised to clients.
#
# The cheatsheet is generated from this hash, and a spec asserts every documented
# widget exists in WidgetSpecs and that every enum and slot value appears in its
# widget's doc, so rules and documentation cannot drift.
#
# NOTE: the custom.title values embed FE react-intl message ids. They are display-only
# metadata for the editor sidebar (nodes without them render fine) and the FE may rename
# ids at any time; we include the current ids for visual parity in the editor, accepting
# that stale ids degrade gracefully to the defaultMessage.
class McpServer::Tools::LayoutWidgets
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
    'ThreeColumn' => <<~DOC
      ThreeColumn — three columns, same Container pattern with slots "column1", "column2", "column3". props: {}
        custom: {"title":{"id":"app.containers.admin.ContentBuilder.threeColumnLayout","defaultMessage":"3 column"},"hasChildren":true}
    DOC
  }.freeze

  FORMAT_RULES = <<~RULES
    # craftjs_json format

    The layout is a flat JSON object mapping node-id to node. It must contain a "ROOT"
    node; children hang off canvases via `nodes` (ordered) and named `linkedNodes` slots.

    ROOT (required, exactly this shape; `nodes` lists top-level widget ids in visual order):
    {"type":"div","nodes":["<id>"],"props":{"id":"e2e-content-builder-frame"},"custom":{},"hidden":false,"isCanvas":true,"displayName":"div","linkedNodes":{}}

    Every other node has exactly these keys:
    {"type":{"resolvedName":"<Widget>"},"isCanvas":false,"props":{...},"displayName":"<Widget>","custom":{...},"parent":"<parent-id>","hidden":false,"nodes":[],"linkedNodes":{}}
  RULES

  CHEATSHEET = <<~CHEATSHEET.freeze
    #{FORMAT_RULES}
    Design tips — a page of only text blocks reads as a wall of text; vary the widgets:
    - Recommended shape for a project description: intro text → TwoColumn or ThreeColumn
      for parallel content (process stages, "why / what you influence") → ButtonMultiloc
      for the main call to action → AccordionMultiloc per FAQ/concern → AboutBox last.
    - Place a WhiteSpace widget between sections (after the intro, before each heading,
      around column blocks) — it is what gives layouts a clean, uncrowded look. Use
      "medium" between sections, "small" within them; add "withDivider": true for a
      subtle horizontal rule at strong topic changes.

    ## Widgets

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
