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

      # The node a report made from a template is stored under, one per template.
      TEMPLATE_WIDGETS = %w[ProjectTemplate PhaseTemplate PlatformTemplate CommunityMonitorTemplate].freeze

      SPECS = {
        # Layout and text — what the composer writes.
        'TextMultiloc' => { 'multilocs' => %w[text] },
        # Both wirings are stored and both render: the widget draws its craft
        # children and falls back to linked slots only when it has none. The builder
        # and the composer use slots named left and right; templates use `nodes`, or
        # slots of their own naming. So the convention is the number of columns, not
        # how they are wired — see Validator#child_count_errors.
        'TwoColumn' => {
          'children' => 2,
          'enums' => { 'columnLayout' => %w[1-1 2-1 1-2] }
        },
        'WhiteSpace' => { 'enums' => { 'size' => ['small', 'medium', 'large', ''] } },
        'PageBreak' => {},
        'TableOfContents' => { 'multilocs' => %w[title] },
        'Cover' => { 'multilocs' => %w[title subtitle eyebrow footnote] },
        'Divider' => { 'enums' => { 'variant' => %w[section hairline dots] } },
        # figures is an array of {value, label}; the validator's conventions describe
        # top-level props only, so the widget itself renders defensively instead.
        'KeyFigures' => {},
        'Container' => {},
        # The host for a generated chart. blockId is pinned per request to the blocks
        # the composer actually authored (see with_allowed_ids).
        'CustomBlock' => {},

        # Chart widgets placed by hand in the builder, with known prop rules. The
        # composer is not offered them (LayoutWidgets::UNDOCUMENTED_WIDGETS), and
        # with_allowed_ids pins no id on them — only CustomBlock carries one.
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

        # A report made from a template stores the template node with every section
        # in a Box canvas linked under it. Phase reports start from a template by
        # default, so chat has to be able to send these back.
        'Box' => {},
        'ProjectTemplate' => { 'slots' => %w[project-report-template] },
        'PhaseTemplate' => { 'slots' => %w[phase-report-template] },
        'PlatformTemplate' => { 'slots' => %w[platform-report-template] },
        'CommunityMonitorTemplate' => { 'slots' => %w[community-monitor-report-template] },
        # Still in the editor's resolver pending a data migration, so old graphs hold it.
        'Insights' => {},

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
