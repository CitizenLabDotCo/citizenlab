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
    # HtmlBlockMultiloc), the fixed page scaffold (ProjectPageLayoutService::
    # SCAFFOLD_WIDGETS), and node types that occur inside existing graphs. The widgets
    # the FE purges on read (FolderTitle, Published, Selection, Spotlight, FolderFiles)
    # are deliberately absent.
    #
    # The '' entries in enums: the FE craft.props defaults write empty strings for
    # size and columnLayout, so stored graphs contain them.
    module WidgetSpecs
      # Node types kept only for the graphs that already contain them: they validate and
      # can be edited or deleted in place, but nothing may create a new one.
      # ProjectDescriptionSection used to wrap the page content; the FE unwraps it on
      # load, so stored graphs carry one until their next save.
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
