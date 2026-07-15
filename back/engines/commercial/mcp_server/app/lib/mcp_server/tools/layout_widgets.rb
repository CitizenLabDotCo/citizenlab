# frozen_string_literal: true

# The single registry of widget facts for project page layouts (code 'project_page').
# Each entry has:
#
# - 'rules': conventions enforced by ContentBuilder::Craftjs::Validator — linkedNodes
#   'slots', prop 'enums', and which props are 'multilocs'.
# - 'doc': the widget's section in the LLM-facing cheatsheet. Entries WITHOUT a doc
#   (Container, Box, the composite presets, the page scaffold) are structural or
#   legacy-only: they validate inside graphs but are not advertised as insertable.
#
# The cheatsheet is generated from this hash, so rules and documentation cannot drift;
# a spec additionally asserts every enum and slot value appears in its widget's doc.
#
# Allowlist = the FE project page toolbox (the description-builder widget set plus
# HtmlBlockMultiloc), the fixed page scaffold (SCAFFOLD_WIDGETS), and node types that
# occur inside existing graphs. The widgets the FE purges on read (FolderTitle,
# Published, Selection, Spotlight, FolderFiles) are deliberately absent.
#
# The '' entries in enums: the FE craft.props defaults write empty strings for size and
# columnLayout (the renderer falls back to small / 1-2), so stored graphs contain them.
#
# NOTE: the custom.title values embed FE react-intl message ids. They are display-only
# metadata for the editor sidebar (nodes without them render fine) and the FE may rename
# ids at any time; we include the current ids for visual parity in the editor, accepting
# that stale ids degrade gracefully to the defaultMessage.
class McpServer::Tools::LayoutWidgets
  # The `type` every project page ROOT node carries (Validator root_type).
  ROOT_TYPE = { 'resolvedName' => 'ProjectPageRoot' }.freeze

  # The fixed page scaffold: exactly one node of each of these types exists on every
  # project page, locked in a fixed tree (see the cheatsheet). Patches may not add,
  # move, delete or edit them — except ProjectDescriptionSection's `nodes`.
  SCAFFOLD_WIDGETS = %w[
    ProjectPageRoot ProjectBanner ProjectTitle ProjectPageBody
    ProjectDescriptionSection PhasesWidget EventsWidget
  ].freeze

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
    'HtmlBlockMultiloc' => {
      'rules' => { 'multilocs' => %w[html] },
      'doc' => <<~DOC
        HtmlBlockMultiloc — raw HTML block (sanitized server-side; scripts/forms are stripped). props: {"html":{"<locale>":"<full html>"}}
          custom: {"title":{"id":"app.containers.admin.content_builder.html_block.label","defaultMessage":"HTML block"}}
          Only for content the other widgets cannot express; prefer TextMultiloc for text.
      DOC
    },
    'Container' => {},
    'Box' => {},
    'ImageTextCards' => { 'rules' => { 'slots' => %w[image-text-cards] } },
    'InfoWithAccordions' => { 'rules' => { 'slots' => %w[info-with-accordions] } },
    # Legacy bridge nodes carrying a migrated project description; edit in place, never create.
    'RichTextMultiloc' => { 'rules' => { 'multilocs' => %w[text] } },
    # The fixed page scaffold (no doc: documented as a block in the cheatsheet header).
    'ProjectPageRoot' => {},
    'ProjectBanner' => {},
    'ProjectTitle' => {},
    'ProjectPageBody' => {},
    'ProjectDescriptionSection' => {},
    'PhasesWidget' => {},
    'EventsWidget' => {}
  }.freeze

  # The shape ContentBuilder::Craftjs::Validator consumes.
  VALIDATOR_SPECS = WIDGETS.transform_values { |widget| widget.fetch('rules', {}) }.freeze

  CHEATSHEET = <<~CHEATSHEET.freeze
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

    Design tips — a description of only text blocks reads as a wall of text; vary the widgets:
    - Recommended shape: intro text → TwoColumn or ThreeColumn for parallel content
      (process stages, "why / what you influence") → ButtonMultiloc for the main call to
      action → AccordionMultiloc per FAQ/concern → AboutBox last.
    - Place a WhiteSpace widget between sections (after the intro, before each heading,
      around column blocks) — it is what gives layouts a clean, uncrowded look. Use
      "medium" between sections, "small" within them; add "withDivider": true for a
      subtle horizontal rule at strong topic changes.

    ## Widgets (insertable inside the description section)

    #{WIDGETS.filter_map { |_name, widget| widget['doc'] }.join("\n")}
  CHEATSHEET
end
