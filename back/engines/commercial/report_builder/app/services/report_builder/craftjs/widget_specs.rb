# frozen_string_literal: true

module ReportBuilder
  module Craftjs
    # The widget conventions ContentBuilder::Craftjs::Validator enforces on report
    # layouts: linkedNodes 'slots', prop 'enums', and which props are 'multilocs'.
    # The report-builder counterpart of ContentBuilder::Craftjs::WidgetSpecs, which
    # covers the project page instead.
    #
    # The LLM-facing documentation of these widgets lives in
    # ReportBuilder::Craftjs::LayoutWidgets; a spec keeps the two in sync.
    #
    # SPECS lists every widget a stored report graph may hold, so validating a whole
    # graph never fails on a widget a human placed. Only a subset is offered to the
    # report composer — LayoutWidgets::DOCS is that subset. Widgets mapped to {}
    # carry no conventions on purpose: nothing writes them programmatically, so
    # declaring prop rules for them would be guesswork.
    module WidgetSpecs
      # A report ROOT is a plain canvas div, unlike the project page's ProjectPageRoot.
      ROOT_TYPE = 'div'

      # Node types kept only for graphs that already contain them: editable and
      # deletable in place, but never newly created.
      DEPRECATED_WIDGETS = %w[ActiveUsersWidget ReactionsByTimeWidget ProjectsTimelineWidget].freeze

      SPECS = {
        # Layout and text — what the composer writes.
        'TextMultiloc' => { 'multilocs' => %w[text] },
        'TwoColumn' => {
          # The report TwoColumn renders craft children directly and only falls back to
          # its linked slots when it has none, so both shapes occur in stored graphs.
          'slots' => %w[left right],
          'enums' => { 'columnLayout' => %w[1-1 2-1 1-2] }
        },
        'WhiteSpace' => { 'enums' => { 'size' => ['small', 'medium', 'large', ''] } },
        'Container' => {},
        # The host for a generated chart. blockId is pinned per request to the blocks
        # the composer actually authored (see with_allowed_ids).
        'CustomBlock' => {},

        # Chart widgets the composer places. Their queries raise on an id that does
        # not exist, so the id props are constrained per request (see with_allowed_ids).
        'ParticipantsWidget' => {
          'multilocs' => %w[title ariaLabel description],
          'enums' => { 'resolution' => %w[day week month] }
        },
        'VisitorsWidget' => {
          'multilocs' => %w[title ariaLabel description],
          'enums' => { 'resolution' => %w[day week month] }
        },
        'DemographicsWidget' => { 'multilocs' => %w[title ariaLabel description] },
        'MostReactedIdeasWidget' => { 'multilocs' => %w[title] },
        'SurveyQuestionResultWidget' => { 'multilocs' => %w[ariaLabel description] },

        # Placed by hand in the builder.
        'ImageMultiloc' => {},
        'IframeMultiloc' => {},
        'CommunityMonitorHealthScoreWidget' => {},
        'SingleIdeaWidget' => {},
        'VisitorsTrafficSourcesWidget' => {},
        'RegistrationsWidget' => {},
        'MethodsUsedWidget' => {},
        'ParticipationWidget' => {},
        'InternalAdoptionWidget' => {},
        'ProjectsWidget' => {},

        # Deprecated node types (DEPRECATED_WIDGETS); edit in place, never create.
        'ActiveUsersWidget' => {},
        'ReactionsByTimeWidget' => {},
        'ProjectsTimelineWidget' => {}
      }.freeze

      WIDGET_NAMES = SPECS.keys.freeze

      # Which widgets carry which id prop. A node pointing at a block that was never
      # authored renders nothing, so the ids are validated rather than trusted.
      ID_PROPS = { 'blockId' => %w[CustomBlock] }.freeze

      # SPECS with the id props pinned to the ids that actually exist for this report.
      # @param allowed_ids [Hash{String => Array<String>}] prop name to allowed values.
      def self.with_allowed_ids(allowed_ids)
        SPECS.to_h do |name, spec|
          enums = allowed_ids.select { |prop, _values| ID_PROPS.fetch(prop, []).include?(name) }
          next [name, spec] if enums.empty?

          [name, spec.merge('enums' => (spec['enums'] || {}).merge(enums))]
        end
      end
    end
  end
end
