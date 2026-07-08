# frozen_string_literal: true

# The single registry of widget facts for project-description layouts. Each entry has:
#
# - 'rules': conventions enforced by ContentBuilder::Craftjs::Validator — linkedNodes
#   'slots', prop 'enums', and which props are 'multilocs'.
# - 'doc': the widget's section in the LLM-facing cheatsheet. Entries WITHOUT a doc
#   (Container, Box, the composite presets) are structural or legacy-only: they validate
#   inside graphs but are not advertised to clients.
#
# The cheatsheet is generated from this hash, so rules and documentation cannot drift;
# a spec additionally asserts every enum and slot value appears in its widget's doc.
#
# Allowlist = the FE project-description toolbox (ProjectDescriptionBuilderToolbox) plus
# node types that occur inside existing graphs. Folder/homepage-only widgets
# (FolderTitle, Published, Selection, Spotlight, FolderFiles) are deliberately absent.
#
# The '' entries in enums: the FE craft.props defaults write empty strings for size and
# columnLayout (the renderer falls back to small / 1-2), so stored graphs contain them.
#
# NOTE: the custom.title values embed FE react-intl message ids. They are display-only
# metadata for the editor sidebar (nodes without them render fine) and the FE may rename
# ids at any time; we include the current ids for visual parity in the editor, accepting
# that stale ids degrade gracefully to the defaultMessage.
class McpServer::Tools::LayoutWidgets
  WIDGETS = {
    'TextMultiloc' => {
      'rules' => { 'multilocs' => %w[text] },
      'doc' => <<~DOC
        TextMultiloc — rich text. props: {"text":{"<locale>":"<p>html</p> or <h2>html</h2>"}}
          custom: {"title":{"id":"app.containers.admin.ContentBuilder.textMultiloc","defaultMessage":"Text"}}
      DOC
    },
    'ButtonMultiloc' => {
      'rules' => {
        'multilocs' => %w[text],
        'enums' => {
          'type' => %w[primary secondary-outlined],
          'alignment' => %w[left center right fullWidth]
        }
      },
      'doc' => <<~DOC
        ButtonMultiloc — link button. props: {"text":{"<locale>":"label"},"url":"https://...","type":"primary"|"secondary-outlined","alignment":"left"|"center"|"right"|"fullWidth"}
          custom: {"title":{"id":"app.containers.admin.ContentBuilder.buttonMultiloc","defaultMessage":"Button"}}
      DOC
    },
    'ImageMultiloc' => {
      'rules' => { 'multilocs' => %w[alt] },
      'doc' => <<~DOC
        ImageMultiloc — image. props: {"image":{"imageUrl":"<public url>"},"alt":{"<locale>":"alt text"}}
          For existing images keep the "dataCode" key exactly as returned by get_project_layout.
          For new images pass only "imageUrl" (a public URL); the backend imports it.
          custom: {"title":{"id":"app.containers.admin.ContentBuilder.imageMultiloc","defaultMessage":"Image"}}
      DOC
    },
    'IframeMultiloc' => {
      'rules' => {
        'multilocs' => %w[title],
        'enums' => {
          'embedMode' => %w[fixed aspectRatio],
          'aspectRatio' => ['16:9', '4:3', '3:4', '1:1', 'custom']
        }
      },
      'doc' => <<~DOC
        IframeMultiloc — embed. props: {"url":"https://...","height":500,"hasError":false,"title":{"<locale>":"accessibility title"},"embedMode":"fixed"|"aspectRatio","aspectRatio":"16:9"|"4:3"|"3:4"|"1:1"|"custom"}
          custom: {"title":{"id":"app.containers.admin.ContentBuilder.url","defaultMessage":"Embed"}}
      DOC
    },
    'AccordionMultiloc' => {
      'rules' => {
        'multilocs' => %w[title text],
        'slots' => %w[accordion-content]
      },
      'doc' => <<~DOC
        AccordionMultiloc — collapsible section. props: {"title":{"<locale>":"plain title"},"openByDefault":false}
          custom: {"title":{"id":"app.containers.admin.ContentBuilder.accordionMultiloc","defaultMessage":"Accordion"},"hasChildren":true}
          IMPORTANT: the accordion body is NOT a prop. It must be a Container node wired through
          linkedNodes: {"accordion-content":"<container-id>"} — same Container pattern as columns —
          with the body content (e.g. a TextMultiloc) as the Container's child. An accordion
          without this container renders empty.
      DOC
    },
    'WhiteSpace' => {
      'rules' => { 'enums' => { 'size' => ['small', 'medium', 'large', ''] } },
      'doc' => <<~DOC
        WhiteSpace — vertical spacing. props: {"size":"small"|"medium"|"large","withDivider":false}
          custom: {"title":{"id":"app.containers.AdminPage.ProjectDescription.whiteSpace","defaultMessage":"White space"}}
      DOC
    },
    'AboutBox' => {
      'doc' => <<~DOC
        AboutBox — project participation box. props: {"hideParticipationAvatars":false}
          custom: {"title":{"id":"app.containers.admin.ContentBuilder.participationBox","defaultMessage":"Participation Box"},"noPointerEvents":true}
      DOC
    },
    'FileAttachment' => {
      'doc' => <<~DOC
        FileAttachment — downloadable file. props: {"fileId":"<Files::File id>"}
          custom: {"title":{"id":"app.containers.admin.ContentBuilder.fileAttachment","defaultMessage":"File attachment"}}
      DOC
    },
    'TwoColumn' => {
      'rules' => {
        'slots' => %w[left right],
        'enums' => { 'columnLayout' => ['1-1', '2-1', '1-2', ''] }
      },
      'doc' => <<~DOC
        TwoColumn — two side-by-side columns. props: {"columnLayout":"1-1"|"2-1"|"1-2"}
          custom: {"title":{"id":"app.containers.admin.ContentBuilder.twoColumnLayout","defaultMessage":"2 column"},"hasChildren":true}
          Columns are separate Container nodes wired through linkedNodes (NOT through nodes):
          linkedNodes: {"left":"<container-id>","right":"<container-id>"}
          Each column Container: {"type":{"resolvedName":"Container"},"isCanvas":true,"props":{},"custom":{},"parent":"<twocolumn-id>","hidden":false,"displayName":"Container","nodes":["<content ids>"],"linkedNodes":{}}
          Content nodes inside a column have parent = the Container's id.
      DOC
    },
    'ThreeColumn' => {
      'rules' => { 'slots' => %w[column1 column2 column3] },
      'doc' => <<~DOC
        ThreeColumn — three columns, same Container pattern with slots "column1", "column2", "column3". props: {}
          custom: {"title":{"id":"app.containers.admin.ContentBuilder.threeColumnLayout","defaultMessage":"3 column"},"hasChildren":true}
      DOC
    },
    'Container' => {},
    'Box' => {},
    'ImageTextCards' => { 'rules' => { 'slots' => %w[image-text-cards] } },
    'InfoWithAccordions' => { 'rules' => { 'slots' => %w[info-with-accordions] } }
  }.freeze

  # The shape ContentBuilder::Craftjs::Validator consumes.
  VALIDATOR_SPECS = WIDGETS.transform_values { |widget| widget.fetch('rules', {}) }.freeze

  CHEATSHEET = <<~CHEATSHEET.freeze
    # craftjs_json format

    The layout is a flat JSON object mapping node-id to node. It must contain a "ROOT"
    node; children hang off canvases via `nodes` (ordered) and named `linkedNodes` slots.

    ROOT (required, exactly this shape; `nodes` lists top-level widget ids in visual order):
    {"type":"div","nodes":["<id>"],"props":{"id":"e2e-content-builder-frame"},"custom":{},"hidden":false,"isCanvas":true,"displayName":"div","linkedNodes":{}}

    Every other node has exactly these keys:
    {"type":{"resolvedName":"<Widget>"},"isCanvas":false,"props":{...},"displayName":"<Widget>","custom":{...},"parent":"<parent-id>","hidden":false,"nodes":[],"linkedNodes":{}}

    Design tips — a page of only text blocks reads as a wall of text; vary the widgets:
    - Recommended shape for a project description: intro text → TwoColumn or ThreeColumn
      for parallel content (process stages, "why / what you influence") → ButtonMultiloc
      for the main call to action → AccordionMultiloc per FAQ/concern → AboutBox last.
    - Place a WhiteSpace widget between sections (after the intro, before each heading,
      around column blocks) — it is what gives layouts a clean, uncrowded look. Use
      "medium" between sections, "small" within them; add "withDivider": true for a
      subtle horizontal rule at strong topic changes.

    ## Widgets

    #{WIDGETS.filter_map { |_name, widget| widget['doc'] }.join("\n")}
  CHEATSHEET
end
