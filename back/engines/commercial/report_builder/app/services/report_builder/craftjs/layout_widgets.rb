# frozen_string_literal: true

module ReportBuilder
  module Craftjs
    # LLM-facing documentation for the report widgets the composer may write. The
    # machine-readable rules these docs describe live in
    # ReportBuilder::Craftjs::WidgetSpecs; a spec asserts docs and rules cannot drift.
    #
    # DOCS deliberately covers less than WidgetSpecs::SPECS. A widget the composer
    # cannot fill in correctly on its own — a chart bound to a project, an image that
    # must be uploaded first — is left undocumented, so the model never reaches for it.
    module LayoutWidgets
      # WidgetSpecs widgets deliberately not offered to the composer: structural
      # containers, widgets needing input the model does not have, and the
      # deprecated node types.
      UNDOCUMENTED_WIDGETS = (%w[
        ImageMultiloc
        ParticipantsWidget
        VisitorsWidget
        DemographicsWidget
        MostReactedIdeasWidget
        SurveyQuestionResultWidget
        IframeMultiloc
        CommunityMonitorHealthScoreWidget
        SingleIdeaWidget
        VisitorsTrafficSourcesWidget
        RegistrationsWidget
        MethodsUsedWidget
        ParticipationWidget
        InternalAdoptionWidget
        ProjectsWidget
      ] + WidgetSpecs::DEPRECATED_WIDGETS).freeze

      DOCS = {
        'TextMultiloc' => <<~DOC,
          TextMultiloc — rich text, the workhorse of a report. props: {"text":{"<locale>":"<h2>Heading</h2><p>Body</p>"}}
            The value is an HTML string per locale. Only these tags survive; anything else is
            stripped on save, silently: p, br, h2, h3, ol, ul, li, b, i, u, em, strong, a.
            There is no h1 — the highest heading is h2. No attributes except a link's href,
            target and rel. No inline styles.
            Write one TextMultiloc per section rather than one long node for the whole report:
            shorter nodes survive editing and page breaks better.
        DOC
        'TwoColumn' => <<~DOC,
          TwoColumn — two side-by-side columns. props: {"columnLayout":"1-1"|"2-1"|"1-2"}
            It takes exactly two children, in its `nodes` array in visual order, and each
            child must be a Container: TwoColumn(isCanvas false) -> Container(isCanvas true,
            props.id "left") and Container(isCanvas true, props.id "right") -> the widget.
            Use it sparingly in a report: a printed page is narrow, and stacked full-width
            sections read better than columns for prose. Its one good use is a pair of
            charts the reader is meant to compare.
        DOC
        'Container' => <<~DOC,
          Container — a canvas that holds other nodes. props: {"id":"left"}
            Only needed inside TwoColumn, one per column, with isCanvas true. Never wrap a
            node in a Container anywhere else.
        DOC
        'WhiteSpace' => <<~DOC,
          WhiteSpace — vertical spacing. props: {"size":"small"|"medium"|"large"}
            Separate major sections with "large", related blocks within a section with "small".
        DOC
        'CustomBlock' => <<~DOC
          CustomBlock — hosts a chart you generated with author_chart_block.
          props: {"blockId":"<the id author_chart_block returned>","version":1}
            Place one per chart, full width, with a sentence of text above it. blockId and
            version must come from an author_chart_block result in this conversation.
        DOC
      }.freeze

      FORMAT_RULES = <<~RULES
        # Report craftjs_json format

        The layout is a flat JSON object mapping node-id to node. Children hang off canvases
        via `nodes` (ordered). Every node has exactly these keys:
        {"type":{"resolvedName":"<Widget>"},"isCanvas":false,"props":{...},"displayName":"<Widget>","custom":{},"parent":"<parent-id>","hidden":false,"nodes":[],"linkedNodes":{}}

        New node ids are 10 characters of [A-Za-z0-9_-] and must be unique in the graph.

        ## The ROOT node

        Every report has exactly one ROOT, and it is not a widget:
        {"type":"div","isCanvas":true,"props":{"id":"e2e-content-builder-frame"},"custom":{},"hidden":false,"nodes":[...],"linkedNodes":{},"displayName":"div"}

        ROOT's `nodes` array is the top-level order of the report. Every node you add is a
        descendant of ROOT, and every node you add must appear in exactly one parent's
        `nodes` array, with its own `parent` set to that parent's id.

        ## Writing for print

        A report is read as a PDF at a fixed page width, so compose it as a document:
        a clear reading order top to bottom, headings that say what the section is, and
        prose that stands on its own without hover or interaction. Keep a heading and the
        text it introduces in the same section, and prefer several short sections over one
        long one — page breaks fall between nodes, never inside them.
      RULES

      # Format rules plus docs for just the given widgets, to keep validation-error
      # responses small. (reference_for(DOCS.keys) is the full cheatsheet.)
      def self.reference_for(widget_names)
        [FORMAT_RULES, *DOCS.values_at(*widget_names.uniq).compact].join("\n")
      end
    end
  end
end
