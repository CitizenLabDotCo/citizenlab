# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Composes a whole report in the background and without a browser: the model
    # explores the platform's reporting data with real SQL, writes a chart component
    # for each thing worth showing, and lays the whole document out.
    #
    # Three tools, all executed here:
    #   run_reporting_sql_query — real, sandboxed SQL, so charts are chosen after
    #                             seeing the data rather than guessed at.
    #   author_chart_block      — one chart, stored as a custom block awaiting compile.
    #   set_layout              — the finished craftjs graph, validated before it counts.
    #
    # Anything rejected comes back as a tool result the model can correct itself
    # from, which is the whole feedback loop: there is no admin watching.
    class ReportComposer
      class ComposeError < StandardError; end

      # Enough rounds to explore the data, write several charts and lay them out,
      # with room for corrections. A run that needs more than this is not converging.
      MAX_ROUNDS = 24

      # The whole layout must fit one reply, or the loop degenerates into
      # truncated-rewrite cycles. Same reasoning as the block authoring loop.
      MAX_OUTPUT_TOKENS = 16_384

      # Query results go into the transcript, so they are sampled rather than passed
      # whole: the model needs the shape and the spread, not every row.
      SAMPLE_ROWS = 15

      # The widgets the layout may use. Every chart is a CustomBlock; the built-in
      # report charts are deliberately not offered.
      COMPOSABLE_WIDGETS = %w[
        Cover Divider KeyFigures TextMultiloc WhiteSpace PageBreak TableOfContents TwoColumn Container CustomBlock
      ].freeze

      TOOLS = [
        {
          tool_spec: {
            name: 'run_reporting_sql_query',
            description: 'Run one read-only SELECT over the reporting views and see the rows. ' \
                         'Use it to find out what the data holds before deciding what to chart.',
            input_schema: {
              json: {
                type: 'object',
                properties: { query: { type: 'string', description: 'A single SELECT statement.' } },
                required: ['query']
              }
            }
          }
        },
        {
          tool_spec: {
            name: 'author_chart_block',
            description: 'Store one chart as a block and get back the blockId and version to ' \
                         'place in the layout. The query is validated and the source is checked; ' \
                         'anything wrong comes back for you to fix.',
            input_schema: {
              json: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Short name for the block, for admins.' },
                  sql: { type: 'string', description: 'The one query this chart draws.' },
                  source: { type: 'string', description: 'The complete TSX of the block.' },
                  config_schema: {
                    type: 'array',
                    description: 'The settings an admin can change on this chart without ' \
                                 'editing code. Each becomes a field in the report builder ' \
                                 'sidebar, and its value reaches the block as config[key].',
                    items: {
                      type: 'object',
                      properties: {
                        key: { type: 'string' },
                        label: { type: 'object', description: 'Locale to label, e.g. {"en":"Chart title"}.' },
                        type: { type: 'string', enum: %w[text number boolean multiloc_text select] },
                        default: { description: 'Matching the type; a multiloc object for multiloc_text.' },
                        options: {
                          type: 'array',
                          description: 'Required for select: [{"value":"...","label":{"en":"..."}}].',
                          items: { type: 'object' }
                        }
                      },
                      required: %w[key label type]
                    }
                  }
                },
                required: %w[title sql source config_schema]
              }
            }
          }
        },
        {
          tool_spec: {
            name: 'set_layout',
            description: 'Replace the whole report layout with a craftjs node graph. ' \
                         'Always send the complete graph including ROOT, never a fragment. ' \
                         'Call this last, once every chart you want has been authored.',
            input_schema: {
              json: {
                type: 'object',
                properties: {
                  layout: { type: 'object', description: 'The complete craftjs_json object.' }
                },
                required: ['layout']
              }
            }
          }
        }
      ].freeze

      # @param project [Project] the subject of the report.
      # @param locale [String] the locale the report text is written in.
      # @param phase [Phase, nil] the one phase to report on, for a phase report.
      # @param author [User, nil] who the authored blocks are attributed to.
      def initialize(project, locale:, phase: nil, author: nil, client: nil)
        @project = project
        @locale = locale
        @phase = phase
        @author = author
        @client = client
        @authored_blocks = []
        @current_layout = nil
      end

      # @return [Hash] a validated craftjs_json graph.
      # @raise [ComposeError] if no valid layout was produced within MAX_ROUNDS.
      def compose
        result = run_loop(
          [{ role: 'user', content: [{ text: 'Generate the report.' }] }],
          require_layout: true
        )
        raise ComposeError, "no valid layout after #{MAX_ROUNDS} rounds" if result[:layout].nil?

        result[:layout]
      end

      # One turn of the chat: answer the admin, and change the report if that is what
      # they asked for.
      #
      # @param current_layout [Hash] what the report holds now.
      # @param instruction [String] what the admin just asked.
      # @param history [Array<Hash>] earlier turns as {'role','text'}.
      # @return [Hash] { layout: Hash or nil when nothing changed, reply: String }
      def revise(current_layout:, instruction:, history: [])
        @current_layout = current_layout
        # Charts already in the report stay placeable; the model keeps what it keeps.
        @authored_blocks |= block_ids_in(current_layout)

        messages = history.filter_map do |turn|
          text = turn['text'].presence
          { role: turn['role'], content: [{ text: text }] } if text
        end
        messages << { role: 'user', content: [{ text: instruction }] }

        run_loop(messages, require_layout: false)
      end

      private

      def run_loop(messages, require_layout:)
        reply = nil

        MAX_ROUNDS.times do
          response = converse(messages)
          assistant = serialize_message(response.output.message)
          messages << assistant
          reply = assistant_text(assistant) || reply

          calls = tool_calls(assistant)
          if calls.empty?
            # Nothing to do and nothing asked for: in the chat that is a plain answer.
            return { layout: nil, reply: reply } if !require_layout && response.stop_reason.to_s == 'end_turn'

            messages << nudge(response.stop_reason)
            next
          end

          outcomes = calls.map { |call| [call, handle(call)] }
          finished = outcomes.find { |_call, outcome| outcome[:layout] }
          if finished
            layout = finished.last[:layout]
            discard_unplaced_blocks(layout)
            return { layout: layout, reply: reply } if require_layout

            return { layout: layout, reply: closing_reply(messages, outcomes) || reply }
          end

          # Every tool call must be answered, or the next request is rejected.
          messages << {
            role: 'user',
            content: outcomes.map { |call, outcome| tool_result_block(call[:id], outcome) }
          }
        end

        { layout: nil, reply: reply }
      end

      def block_ids_in(layout)
        return [] unless layout.is_a?(Hash)

        layout.values.filter_map { |node| node.is_a?(Hash) ? node.dig('props', 'blockId') : nil }
      end

      def assistant_text(assistant_message)
        texts = assistant_message[:content].filter_map { |block| block[:text] }
        texts.empty? ? nil : texts.join("\n")
      end

      # A run often authors a chart it then improves on. Only what the layout points
      # at is part of the report; the rest would sit in the block library forever.
      def discard_unplaced_blocks(layout)
        placed = layout.values.filter_map do |node|
          node.is_a?(Hash) ? node.dig('props', 'blockId') : nil
        end

        ContentBuilder::CustomBlock.where(id: @authored_blocks - placed - block_ids_in(@current_layout)).destroy_all
      end

      def handle(call)
        case call[:name]
        when 'run_reporting_sql_query' then run_query(call[:input]['query'])
        when 'author_chart_block' then author_block(call[:input])
        when 'set_layout' then check_layout(call[:input]['layout'])
        else { error: true, text: "Unknown tool '#{call[:name]}'." }
        end
      end

      def run_query(query)
        result = McpServer::ReportingQueryRunner.run(query.to_s)
        sample = result.rows.first(SAMPLE_ROWS)
        note = result.rows.size > SAMPLE_ROWS ? " (showing the first #{SAMPLE_ROWS})" : ''

        { text: "#{result.rows.size} row(s)#{note}.\ncolumns: #{result.columns.join(', ')}\n#{sample.to_json}" }
      rescue McpServer::ReportingQueryRunner::Rejected => e
        { error: true, text: e.message }
      rescue ActiveRecord::StatementInvalid => e
        { error: true, text: "The query failed to run: #{e.message}" }
      end

      def author_block(input)
        result = ChartBlockAuthor.new(@project, @author).author(
          title: input['title'],
          sql: input['sql'],
          source: input['source'],
          config_schema: input['config_schema']
        )
        @authored_blocks << result.block_id

        { text: "Stored. Place it with {\"blockId\":\"#{result.block_id}\",\"version\":#{result.version_number}}." }
      rescue ChartBlockAuthor::Rejected => e
        { error: true, text: e.message }
      end

      def check_layout(layout)
        result = Craftjs::LayoutValidator.validate(layout, widget_specs: widget_specs)
        return { layout: layout, text: 'Layout saved.' } if result.valid?

        { error: true, text: result.message }
      end

      # In the chat the admin gets a sentence saying what changed, and a model that
      # ends its turn on a tool call has not written one yet. Answer the call and take
      # one more turn for it. The report is already composed either way, so a failure
      # here costs the sentence, not the change.
      def closing_reply(messages, outcomes)
        messages << {
          role: 'user',
          content: outcomes.map { |call, outcome| tool_result_block(call[:id], outcome) }
        }

        assistant_text(serialize_message(converse(messages).output.message))
      rescue Aws::Errors::ServiceError
        nil
      end

      def client
        @client ||= Aws::BedrockRuntime::Client.new(
          region: ENV.fetch('AWS_TOXICITY_DETECTION_REGION', 'eu-central-1')
        )
      end

      def model_id
        ENV.fetch('BEDROCK_SONNET_MODEL', 'eu.anthropic.claude-sonnet-4-6')
      end

      def converse(messages)
        client.converse(
          model_id: model_id,
          system: [{ text: system_prompt }],
          messages: messages,
          tool_config: { tools: TOOLS },
          inference_config: { max_tokens: MAX_OUTPUT_TOKENS }
        )
      end

      def tool_result_block(tool_use_id, outcome)
        {
          tool_result: {
            tool_use_id: tool_use_id,
            content: [{ text: outcome[:text] }],
            status: outcome[:error] ? 'error' : 'success'
          }
        }
      end

      # The model replied without calling a tool. A reply cut off by the output
      # limit needs different advice from one that just talked instead of acting.
      def nudge(stop_reason)
        text = if stop_reason.to_s == 'max_tokens'
          'Your reply was cut off by the output token limit. Write less per tool call: ' \
            'a shorter block, or a smaller part of the layout. Then call the tool again.'
        else
          'Do not reply with text. Use the tools: explore with run_reporting_sql_query, ' \
            'write charts with author_chart_block, and finish with set_layout.'
        end

        { role: 'user', content: [{ text: text }] }
      end

      def serialize_message(message)
        content = message.content.filter_map do |block|
          if block.respond_to?(:text) && block.text
            { text: block.text }
          elsif block.respond_to?(:tool_use) && block.tool_use
            {
              tool_use: {
                tool_use_id: block.tool_use.tool_use_id,
                name: block.tool_use.name,
                # Tool input is payload, not request parameters: it keeps its string keys.
                input: block.tool_use.input.to_h
              }
            }
          end
        end

        { role: 'assistant', content: content }
      end

      def tool_calls(assistant_message)
        assistant_message[:content].filter_map do |block|
          tool_use = block[:tool_use]
          next unless tool_use

          { id: tool_use[:tool_use_id], name: tool_use[:name], input: tool_use[:input] }
        end
      end

      def context
        @context ||= ProjectContext.new(@project, locale: @locale, phase: @phase)
      end

      # A CustomBlock node may only point at a block authored in this conversation.
      def widget_specs
        Craftjs::WidgetSpecs.with_allowed_ids('blockId' => @authored_blocks)
      end

      # In the chat the model is editing something that already exists, and the admin
      # is waiting: the instructions change from "write a report" to "change this one".
      def revision_instructions
        <<~SECTION
          ## You are editing an existing report

          The admin is talking to you about the report below. Do what they ask and nothing
          more: this is their document, not a draft for you to improve.

          - Changing anything means calling set_layout with the COMPLETE graph, the current
            one with your change applied. Keep every node id you are not changing, and keep
            its props byte for byte. A node you drop disappears from their report.
          - Adding a chart means author_chart_block first, then placing it. Explore with
            run_reporting_sql_query if you need to know what the data holds.
          - Removing a chart means leaving its node out of the layout.
          - If they only asked a question, answer it in one or two sentences and call no
            tools at all.
          - Always finish with one or two plain sentences saying what you changed. No
            markdown, no lists, no code.

          ### The report as it is now

          #{@current_layout.to_json}
        SECTION
      end

      def system_prompt
        @system_prompt ||= <<~PROMPT
          You write the report on a participation project for Go Vocal, a digital democracy platform used by local governments. The reader is a resident or a councillor: interested, not an expert, and reading a printed PDF rather than a screen.

          You have the platform's reporting data and you write your own charts. Work in this order:

          1. Explore. Run queries until you know what this project's data actually holds:
             how participation moved over time, what people answered, who took part, where
             they came from. Look before you decide what the report says.
          2. Write the charts. One author_chart_block call per chart.
          3. Lay it out with set_layout, once, at the end.
          #{revision_instructions if @current_layout}

          ## What you may write

          A chart shows real numbers, because it runs its own query. Your prose does not:
          you may only state a number in text if you saw it in a query result in this
          conversation. Never guess, never round something you did not see, and never write
          a sentence that would be wrong if the data changed. Prefer describing what the
          chart shows to repeating its numbers.

          Write the report in the platform locale "#{@locale}", and give every text prop
          exactly that one key: {"text":{"#{@locale}":"..."}}.

          ## The report

          The first three are not optional, and they come in this order. A report that
          opens straight onto a chart is not a report.

          1. Cover. One Cover node, filled in for this project, then a PageBreak.
          2. Contents. One TableOfContents, then a PageBreak, so the contents have a
             page to themselves.
          3. Executive summary. Four to six bullet points in one TextMultiloc, under an
             <h2> reading "Executive summary" in the report's locale. Each bullet opens
             with the finding itself in <b>, then the evidence for it. This is the only
             part some readers will read, so it carries the whole argument — and every
             number in it must be one you saw in a query result.
          4. Taking part. How participation went, with a chart.
          5. Results. What people actually said or chose — usually the heart of the report,
             and usually more than one chart.
          6. Who took part. The demographics of participants, if the data supports it.
          7. Reach. Visitors and where they came from, if the data supports it.
          8. What happens next.

          Every section from 3 onwards opens the same way: a Divider with variant
          "section", then a TextMultiloc whose first tag is the <h2> naming the section.
          That repetition is the report's spine — keep it exact, and put a Divider
          nowhere else.

          Where a section's point is a handful of headline counts — how many took part,
          how many visitors, what share completed something — open it with a KeyFigures
          band directly under the heading, and let it carry those numbers instead of a
          sentence that lists them. Two or three sections usually deserve one; a section
          whose point is a shape or a trend does not, that is what the chart is for.

          Between four and seven charts is right for a project report. Separate sections
          with a WhiteSpace of size "large", and a chart from the sentence above it with
          size "small". Keep the prose under about 500 words in total.

          Each section should read as a page: a heading, a short paragraph, and at most
          two charts. That is what makes the PDF navigable.

          ## Choosing the chart

          The data's job picks the form, and color comes last:

          - Magnitude across categories: horizontal bar, sorted, one hue. The safe default.
          - Change over time: line, or area for a single series.
          - Part of a whole: a stacked bar, not a pie. Only use a pie for two or three
            slices that sum to something meaningful.
          - An ordered scale (agree to disagree, 1 to 5): a stacked bar in one hue ramp,
            in scale order, never re-sorted by size.
          - One number that matters on its own: large text, not a one-bar chart.

          Rules that hold for every chart:
          - The council's own colours are the default palette. theme.colors.tenantPrimary
            for a single series, tenantSecondary for a second one. Reach for the platform
            greys for everything that is not data. Never invent a brand colour.
          - Never two y-axes. Two measures of different scale are two charts.
          - One hue, light to dark, unless the series themselves are the subject; then use
            distinct hues, at most six, and always with a legend.
          - Sort bars by value, except on an ordered scale.
          - Label the axes in the report's locale. No jargon and no column names.
          - Thin marks, a recessive grid, no 3D, no shadows, no gradients.
          - The chart must read in print: no tooltips as the only way to see a value, and
            enough contrast in greyscale.

          Every chart block is laid out the same way, so a run of them reads as one
          document: a heading, the chart filling the full width of the column, then one
          line of caption under it in small secondary text saying what the reader should
          take from it or what it leaves out. The chart's box is the width of the column
          — never narrower and never given a fixed pixel width, or it sits off-centre on
          the page.

          ## The report is printed

          Everything you write ends up as a PDF at a fixed A4 width, about 21cm, on paper
          or on a screen that cannot be hovered or scrolled sideways. Compose for that:

          - A chart is never split across a page break, so keep each one short enough to
            fit on a page: 220 to 320 pixels tall, never more than 400.
          - A PageBreak is the only way to decide where a page ends. Use it after the cover
            and after the contents, and otherwise only where a section really deserves to
            start at the top of a page.
          - Give the sentence that introduces a chart its own text node directly above it,
            and separate them with a WhiteSpace of size "small" so they stay together.
          - Nothing may depend on interaction. A value that can only be read from a tooltip
            is a value the printed report does not have, so label the bars or points that
            carry the point.
          - No colour-only meaning: a reader in greyscale must still be able to tell the
            series apart, by order, by label, or by lightness.
          - Never a fixed pixel width wider than about 700, and never a viewport unit
            (vw, vh): the page is not the screen.
          - Keep the whole report to roughly 6 to 10 printed pages. A section per page
            reads better than one long scroll.

          ## Writing a chart block

          author_chart_block takes a title, the sql, the complete TSX source, and a
          config_schema. The source must contain the sql verbatim, as one template literal
          at the top:

          const SQL = `SELECT ... FROM reporting_contributions ...`;

          ### config_schema — what an admin can change afterwards

          A generated chart is not the last word: whoever owns the report has to be able to
          correct it without editing code. Each field becomes an input in the builder
          sidebar, and its value arrives as config[key].

          Every chart exposes its title and its caption, so the wording can always be fixed:

          [{"key":"title","type":"multiloc_text","label":{"#{@locale}":"Chart title"},
            "default":{"#{@locale}":"Participants per phase"}},
           {"key":"caption","type":"multiloc_text","label":{"#{@locale}":"Caption"},
            "default":{"#{@locale}":"One line on what this shows."}},
           {"key":"showValues","type":"boolean","label":{"#{@locale}":"Show the value on each bar"},
            "default":true}]

          Then add one or two more where the chart has a real choice in it: how many rows to
          show ("topN", number), the sort direction ("sort", select), which measure to plot.
          Six fields is the maximum. A field the block never reads is worse than no field,
          so read every one you declare, and give every one a default that matches what the
          chart does now — the block must render identically before anything is touched.

          Types: text, number, boolean, multiloc_text, select (select needs options, each
          {"value":"...","label":{"<locale>":"..."}}).

          ### The source

          The file default-exports a React component taking { config }, and may import only
          from 'gv-sdk':

          import { React, Box, Text, Title, Spinner, colors, useTheme, useLocalize,
                   useReportingData, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
                   CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area,
                   PieChart, Pie, Cell, LabelList } from 'gv-sdk';

          const SQL = `SELECT ...`;

          export default function Block({ config }) {
            const theme = useTheme();
            const localize = useLocalize();
            const { data, isLoading } = useReportingData(SQL);
            if (isLoading) return <Box p="24px" display="flex" justifyContent="center"><Spinner /></Box>;
            const rows = data ? data.rows : [];
            if (rows.length === 0) return <Text color="textSecondary">No data for this chart.</Text>;

            // Every declared field is read, and falls back to what the chart would
            // have shown anyway.
            const showValues = config.showValues !== false;

            return (
              <Box width="100%">
                <Title variant="h4" m="0 0 12px">
                  {localize(config.title) || 'A title that says what this shows'}
                </Title>
                <Box width="100%" height="280px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rows} layout="vertical"
                              margin={{ top: 4, right: 48, bottom: 4, left: 0 }}>
                      <CartesianGrid stroke={colors.grey200} horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="label" width={160} tickLine={false}
                             axisLine={false} stroke={colors.textSecondary} fontSize={12} />
                      <Bar dataKey="count" fill={theme.colors.tenantPrimary}
                           radius={[0, 4, 4, 0]} barSize={18}>
                        {showValues && (
                          <LabelList dataKey="count" position="right" fontSize={12}
                                     fill={colors.textPrimary} />
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Text m="8px 0 0" fontSize="s" color="textSecondary">
                  {localize(config.caption)}
                </Text>
              </Box>
            );
          }

          Notes that save you a round trip:
          - `data.rows` is an array of plain objects keyed by your column names. Alias your
            columns to the keys you use in the chart.
          - A chart needs an explicit pixel height on its container; ResponsiveContainer
            fills its parent and a parent with no height renders nothing. Give that
            container width="100%" too, so the chart spans the column.
          - Room for the labels comes from the axis, not the margin: set YAxis width and
            leave margin.left at 0. Setting both indents the plot twice and leaves the
            chart stranded against the right edge of the page.
          - Label the bars or points directly with LabelList. A printed chart has no
            hover, so a value that is only in a Tooltip is a value the report does not
            have — which is why the example has no Tooltip at all.
          - theme.colors.tenantPrimary and tenantSecondary are the council's own colours.
            colors.grey200, colors.textSecondary and friends are the platform tokens.
          - No fetch, no storage, no dangerouslySetInnerHTML, no imports other than 'gv-sdk'.
          - Write the chart's own title inside the block, in the report's locale.

          ## Writing the query

          - One statement, a single SELECT, over the reporting views below and nothing else.
            Name them unqualified.
          - Aggregate in SQL. At most 1000 rows come back, and a chart wants tens of rows.
          - No now() or any moving value: the query is stored and must give the same answer
            tomorrow. Write the dates out.
          - Scope it to this project with its id unless the chart is deliberately about the
            whole platform.
          - Count participants with COUNT(DISTINCT participant_id) on reporting_contributions.

          ## The reporting views

          #{ReportingSchema.to_prompt_text}

          #{Craftjs::LayoutWidgets.reference_for(COMPOSABLE_WIDGETS)}

          ## Project context

          #{context.to_prompt_text}
        PROMPT
      end
    end
  end
end
