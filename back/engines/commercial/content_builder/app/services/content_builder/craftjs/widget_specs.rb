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
    # The allowlist covers the FE project page toolbox, the fixed page scaffold and
    # node types found in existing graphs. The '' enum entries exist because the FE
    # writes empty strings as prop defaults.
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
        'AboutBox' => {},
        'FileAttachment' => {},
        'TwoColumn' => {
          'slots' => %w[left right],
          'enums' => { 'columnLayout' => ['1-1', '2-1', '1-2', ''] }
        },
        'ThreeColumn' => { 'slots' => %w[column1 column2 column3] },
        'HtmlBlockMultiloc' => { 'multilocs' => %w[html] },
        'Container' => {},
        'Box' => {},
        'ImageTextCards' => { 'slots' => %w[image-text-cards] },
        'InfoWithAccordions' => { 'slots' => %w[info-with-accordions] },
        # Legacy node types (LEGACY_WIDGETS); edit in place, never create.
        'RichTextMultiloc' => { 'multilocs' => %w[text] },
        'ProjectDescriptionSection' => {},
        # The fixed project page scaffold (no rules: locked nodes patches may not touch).
        'ProjectPageRoot' => {},
        'ProjectBanner' => {},
        'ProjectTitle' => {},
        'ProjectPageBody' => {},
        # Seeded on every project page, but ordinary widgets: movable and deletable.
        'PhasesWidget' => {},
        'EventsWidget' => {}
      }.freeze
    end
  end
end
