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
        'PageBreak' => <<~DOC,
          PageBreak — ends the page it sits on. props: {}
            The only way to decide where a page ends. Use it after the cover, and wherever
            a section deserves to start at the top of a page. Do not use it between every
            section: the layout already avoids breaking a chart or a paragraph in half.
        DOC
        'TableOfContents' => <<~DOC,
          TableOfContents — lists the report's headings with the page each one is on. props: {}
            Place one, after the cover and its page break. It fills itself in from the
            headings you wrote, so it needs no content of its own.
        DOC
        'Cover' => <<~DOC,
          Cover — the title page. Always the first node of the report.
          props: {"title":{"<locale>":"..."},"subtitle":{"<locale>":"..."},"eyebrow":{"<locale>":"..."},"footnote":{"<locale>":"..."},"showLogo":true}
            Plain text per locale, no HTML. It draws itself — the platform logo, a rule in
            the council's own colour, the platform name along the foot — and fills a whole
            page, so follow it with a PageBreak and leave showLogo true.
            title    — the project's name, as a reader would say it.
            subtitle — one line saying what the report covers, not a finding.
            eyebrow  — the small line above the title, e.g. the kind of report. Optional.
            footnote — when the report was generated and the period it covers. Optional.
        DOC
        'Divider' => <<~DOC,
          Divider — a horizontal rule. props: {"variant":"section"|"hairline"|"dots"}
            "section" is a thick rule in the council's colour: one directly above every
            section heading and nowhere else, which is what makes the report read as a
            document. "hairline" and "dots" are quieter separators, used inside a section.
        DOC
        'KeyFigures' => <<~DOC,
          KeyFigures — the handful of numbers worth pulling out of the prose, in one band.
          props: {"figures":[{"value":"5,663","label":{"<locale>":"Visitors"}}]}
            Two to five figures, never more: the band divides the width between them.
            value is already formatted for reading — "5,663", "61%", "4.5/5" — and label
            is one or two words. Every value must be one you saw in a query result.
            Use it to open a section whose point is a few headline counts. It replaces
            those sentences rather than repeating them.
        DOC
        'CustomBlock' => <<~DOC
          CustomBlock — hosts a chart you generated with author_chart_block.
          props: {"blockId":"<the id author_chart_block returned>","version":1}
            Place one per chart, full width, with a sentence of text above it. blockId and
            version must come from an author_chart_block result in this conversation.
        DOC
      }.freeze

      FORMAT_RULES = LayoutFormatRules::TEXT

      # Format rules plus docs for just the given widgets, to keep validation-error
      # responses small. (reference_for(DOCS.keys) is the full cheatsheet.)
      def self.reference_for(widget_names)
        [FORMAT_RULES, *DOCS.values_at(*widget_names.uniq).compact].join("\n")
      end
    end
  end
end
