# frozen_string_literal: true

module ContentBuilder
  module Craftjs
    # The widget conventions enforced by Validator: linkedNodes 'slots', prop 'enums',
    # and which props are 'multilocs'. 'slots' are declared in visual (left-to-right)
    # order — Query relies on this because jsonb does not preserve key order.
    #
    # The LLM-facing documentation of these widgets lives in McpServer::LayoutWidgets;
    # a spec there keeps the two in sync. The rules live here so consumers outside the
    # mcp_server engine can use them.
    #
    # The allowlist covers the FE project page toolbox (including the phases, events,
    # spotlight-surveys and PageLink widgets), the page scaffold and node types found in
    # existing graphs. ExtraSurveysWidget and PageLink sit behind feature flags, but
    # those gate rendering or the FE toolbox, never whether a stored graph may hold
    # the node. The '' enum entries exist because the FE writes empty strings as
    # prop defaults.
    module WidgetSpecs
      # Node types kept only for graphs that already contain them: editable and
      # deletable in place, but never newly created.
      LEGACY_WIDGETS = %w[RichTextMultiloc ProjectDescriptionSection].freeze

      SPECS = {
        'TextMultiloc' => { 'multilocs' => %w[text] },
        'ButtonMultiloc' => {
          'multilocs' => %w[text],
          'enums' => {
            'type' => %w[primary secondary-outlined],
            'alignment' => %w[left center right fullWidth]
          }
        },
        'ImageMultiloc' => { 'multilocs' => %w[alt] },
        'PageLink' => { 'enums' => { 'displayType' => %w[link preview] } },
        'IframeMultiloc' => {
          'multilocs' => %w[title],
          'enums' => {
            'embedMode' => %w[fixed aspectRatio],
            'aspectRatio' => ['16:9', '4:3', '3:4', '1:1', 'custom']
          }
        },
        'AccordionMultiloc' => {
          'multilocs' => %w[title text],
          'slots' => %w[accordion-content]
        },
        'WhiteSpace' => { 'enums' => { 'size' => ['small', 'medium', 'large', ''] } },
        'AboutBox' => { 'multilocs' => %w[collapsedButtonTitleMultiloc] },
        'FileAttachment' => {},
        'TwoColumn' => {
          'slots' => %w[left right],
          'enums' => { 'columnLayout' => ['1-1', '2-1', '1-2', ''] }
        },
        'ThreeColumn' => { 'slots' => %w[column1 column2 column3] },
        'HtmlBlockMultiloc' => { 'multilocs' => %w[html] },
        'PhasesWidget' => { 'enums' => { 'sectionBackground' => %w[colored white] } },
        'EventsWidget' => { 'enums' => { 'sectionBackground' => %w[colored white] } },
        'ExtraSurveysWidget' => {
          'multilocs' => %w[buttonText],
          'enums' => {
            'buttonFormat' => %w[button card],
            'buttonStyle' => %w[primary secondary-outlined]
          }
        },
        'Container' => {},
        'Box' => {},
        'ImageTextCards' => { 'slots' => %w[image-text-cards] },
        'InfoWithAccordions' => { 'slots' => %w[info-with-accordions] },
        # Legacy node types (LEGACY_WIDGETS); edit in place, never create.
        'RichTextMultiloc' => { 'multilocs' => %w[text] },
        # The container that used to hold all page content. No longer seeded, but stored
        # graphs carry one until the editor next saves them flat. Tolerated, never created.
        'ProjectDescriptionSection' => {},
        # Custom page widgets.
        'ProjectsByFilter' => {
          'multilocs' => %w[titleMultiloc],
          'enums' => { 'filterType' => %w[global_topics areas spaces] }
        },
        'EventsByProjects' => {
          'enums' => {
            'mode' => %w[all projects global_topics areas spaces],
            'sectionBackground' => %w[colored white]
          }
        },
        # The project page scaffold (no rules: nodes patches may not add, move or delete).
        'ProjectPageRoot' => {},
        'ProjectBanner' => {},
        'ProjectTitle' => {},
        'ProjectPageBody' => {},
        # The custom page scaffold, same idea.
        'CustomPageRoot' => {},
        'CustomPageBody' => {}
      }.freeze
    end
  end
end
