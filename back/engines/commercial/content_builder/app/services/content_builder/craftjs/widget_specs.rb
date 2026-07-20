# frozen_string_literal: true

module ContentBuilder
  module Craftjs
    # The registry of widget conventions, enforced by Validator: linkedNodes 'slots',
    # prop 'enums', and which props are 'multilocs'. 'slots' are declared in visual
    # (left-to-right) order — Query relies on this for traversal order, which cannot
    # be read from stored graphs because jsonb does not preserve key order.
    #
    # The LLM-facing documentation of these widgets lives in
    # McpServer::LayoutWidgets; a spec there asserts docs and specs cannot
    # drift. The rules live here and not there because consumers of Query and
    # Validator (core app, analysis, admin_api) cannot depend on the mcp_server
    # engine.
    #
    # Allowlist = the FE project page toolbox (the description-builder widget set plus
    # HtmlBlockMultiloc), the fixed page scaffold (McpServer::LayoutWidgets::
    # SCAFFOLD_WIDGETS), and node types that occur inside existing graphs. The widgets
    # the FE purges on read (FolderTitle, Published, Selection, Spotlight, FolderFiles)
    # are deliberately absent.
    #
    # The '' entries in enums: the FE craft.props defaults write empty strings for
    # size and columnLayout (the renderer falls back to small / 1-2), so stored
    # graphs contain them.
    module WidgetSpecs
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
        # Legacy bridge nodes carrying a migrated project description; edit in place, never create.
        'RichTextMultiloc' => { 'multilocs' => %w[text] },
        # The fixed project page scaffold (no rules: locked nodes patches may not touch).
        'ProjectPageRoot' => {},
        'ProjectBanner' => {},
        'ProjectTitle' => {},
        'ProjectPageBody' => {},
        'ProjectDescriptionSection' => {},
        'PhasesWidget' => {},
        'EventsWidget' => {}
      }.freeze
    end
  end
end
