# frozen_string_literal: true

module ReportBuilder
  module Craftjs
    # How a report craftjs graph is shaped, as the composer needs to understand it.
    # Kept apart from LayoutWidgets, which catalogues the widgets rather than the
    # format they are written in. LayoutWidgets::FORMAT_RULES re-exports this, so the
    # name callers already use keeps working.
    module LayoutFormatRules
      TEXT = <<~RULES
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

        A report is read as a PDF at a fixed A4 width, about 21cm, so compose it as a
        document: a clear reading order top to bottom, headings that say what the section
        is, and prose that stands on its own without hover or interaction. Keep a heading
        and the text it introduces in the same node, and prefer several short sections
        over one long one.

        Page breaks fall between nodes, never inside a text node or a chart, so a node
        taller than a page is a node that leaves a gap on the page before it.
      RULES
    end
  end
end
