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
    #   author_chart_block      — one chart, built and checked, then stored as a custom block.
    #   get_layout / patch_layout — the report itself, built up a patch at a time and
    #                             validated before each one counts.
    #
    # Anything rejected comes back as a tool result the model can correct itself
    # from, which is the whole feedback loop: there is no admin watching.
    class ReportComposer
      class ComposeError < StandardError; end

      # Enough rounds to explore the data, write several charts and lay them out,
      # with room for corrections. A run that needs more than this is not converging.
      MAX_ROUNDS = 32

      # The whole layout must fit one reply, or the loop degenerates into
      # truncated-rewrite cycles. Same reasoning as the block authoring loop.
      MAX_OUTPUT_TOKENS = 32_768

      # Marks a point up to which the provider may reuse its cached prefix.
      CACHE_POINT = { cache_point: { type: 'default' } }.freeze

      # Comfortably above the longest turn we have measured (about 2.5 minutes).
      HTTP_READ_TIMEOUT_SECONDS = 900
      HTTP_OPEN_TIMEOUT_SECONDS = 10

      # Query results go into the transcript, so they are sampled rather than passed
      # whole: the model needs the shape and the spread, not every row.
      SAMPLE_ROWS = 15

      # The widgets the layout may use. Every chart is a CustomBlock; the built-in
      # report charts are deliberately not offered.
      COMPOSABLE_WIDGETS = %w[
        Cover Divider KeyFigures TextMultiloc WhiteSpace PageBreak TableOfContents TwoColumn Container CustomBlock
      ].freeze

      # @param project [Project] the subject of the report.
      # @param locale [String] the locale the report text is written in.
      # @param phase [Phase, nil] the one phase to report on, for a phase report.
      # @param author [User, nil] who the authored blocks are attributed to.
      def initialize(project, locale:, phase: nil, author: nil, client: nil, layout_record: nil)
        @project = project
        @locale = locale
        @phase = phase
        @author = author
        @client = client
        # The report's own layout row. Only used for checking: a render needs a layout
        # to scope its data token to.
        @layout_record = layout_record
        @authored_blocks = []
        # What the report held when this run started, and the graph as it stands now.
        @current_layout = nil
        @layout = {}
        # What the model was told and what it said, for whoever has to work out why a
        # run went the way it did.
        @transcript = []
        @usage = Hash.new(0)
        @stopped_because = 'failed'
      end

      # The run's record: every message in order, what it cost, and why it stopped.
      attr_reader :transcript, :usage, :stopped_because

      # Which model wrote this run, for the record.
      def model_name = model_id

      # @return [Hash] a validated craftjs_json graph.
      # @raise [ComposeError] if no valid layout was produced within MAX_ROUNDS.
      def compose
        result = run_loop([{ role: 'user', content: [{ text: 'Generate the report.' }] }])
        if result[:layout].nil?
          # The charts were authored for a report that never got written. Leaving them
          # would fill the block library with orphans nothing can reach or delete.
          discard_authored_blocks
          raise ComposeError, "no report was written in #{MAX_ROUNDS} rounds"
        end

        review(result[:layout])
      end

      # The model stops when it believes the report is done. Believing is not seeing:
      # this renders what it wrote and, if something is actually broken, gives it one
      # bounded round to fix it. One, because a model handed its own output
      # indefinitely will keep polishing it.
      REVIEW_ROUNDS = 5

      def review(layout)
        return layout if checker.nil?

        outcome = checker.check(checker.layout_target(layout))
        return layout unless outcome[:error]

        result = run_loop(
          [{ role: 'user', content: [{ text: <<~TEXT }] }], max_rounds: REVIEW_ROUNDS
            I rendered the report you just wrote. Some checks failed:

            #{outcome[:text]}

            Fix what is actually broken with patch_layout and stop. If a failure is not
            worth fixing, say so and stop — do not rewrite the report.
          TEXT
        )

        result[:layout] || layout
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
        @layout = current_layout || {}
        # Charts already in the report stay placeable; the model keeps what it keeps.
        @authored_blocks |= block_ids_in(current_layout)

        messages = history.filter_map do |turn|
          text = turn['text'].presence
          { role: turn['role'], content: [{ text: text }] } if text
        end
        messages << { role: 'user', content: [{ text: instruction }] }

        run_loop(messages, allow_answer_only: true)
      end

      private

      def run_loop(messages, allow_answer_only: false, max_rounds: MAX_ROUNDS)
        reply = nil
        patched = false

        max_rounds.times do
          response = converse(messages)
          record_usage(response)
          assistant = Messages.serialize(response.output.message)
          messages << assistant
          reply = Messages.assistant_text(assistant) || reply

          calls = Messages.tool_calls(assistant)

          # A reply cut off by the token limit still carries the tool call it had
          # started writing, and that fragment parses. Running it would act on half
          # an argument: a truncated layout is indistinguishable from a layout with
          # most of the report deleted, and the model would then be told its own
          # good work was invalid. Answer the truncation instead.
          if response.stop_reason.to_s == 'max_tokens'
            messages << truncation_response(calls)
            next
          end

          if calls.empty?
            # Nothing left to do is how a turn ends. Ending one without having written
            # anything is only an answer in the chat; asked to generate a report, it
            # means the model stopped short, and a nudge costs less than a failed run.
            done = response.stop_reason.to_s == 'end_turn' && (patched || allow_answer_only)
            if done
              @stopped_because = 'done'
              return finish(patched, reply)
            end

            messages << nudge(response.stop_reason)
            next
          end

          outcomes = calls.map { |call| [call, handle(call)] }
          patched ||= outcomes.any? { |_call, outcome| outcome[:patched] }

          # Every tool call must be answered, or the next request is rejected.
          messages << {
            role: 'user',
            content: outcomes.map { |call, outcome| Messages.tool_result(call[:id], outcome) }
          }
        end

        # Out of rounds. Every patch was validated before it landed, so what is here
        # is a real report, just possibly an unfinished one — and an unfinished report
        # the admin can edit beats throwing away the whole run.
        @stopped_because = 'round_cap'
        finish(patched, reply)
      ensure
        @transcript = messages
      end

      def record_usage(response)
        reported = response.usage
        return if reported.nil?

        %i[input_tokens output_tokens cache_read_input_tokens cache_write_input_tokens].each do |field|
          @usage[field.to_s] += reported.respond_to?(field) ? reported.public_send(field).to_i : 0
        end
      end

      def finish(patched, reply)
        return { layout: nil, reply: reply } unless patched

        discard_unplaced_blocks(@layout)
        { layout: @layout, reply: reply }
      end

      def block_ids_in(layout)
        return [] unless layout.is_a?(Hash)

        layout.values.filter_map { |node| node.is_a?(Hash) ? node.dig('props', 'blockId') : nil }
      end

      def discard_authored_blocks
        ContentBuilder::CustomBlock
          .where(id: @authored_blocks - block_ids_in(@current_layout))
          .destroy_all
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
        when 'edit_source' then edit_block(call[:input])
        when 'check' then check(call[:input])
        when 'get_layout' then read_layout
        when 'patch_layout' then patch_layout(call[:input])
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
        result = ChartBlockAuthor.new(@author, locale: @locale).author(
          title: input['title'],
          source: input['source'],
          config_schema: input['config_schema'],
          messages: input['messages']
        )
        @authored_blocks << result.block_id

        { text: "Stored. Place it with #{placement(result)}." }
      rescue ChartBlockAuthor::Rejected => e
        { error: true, text: e.message }
      end

      # An edit writes a new version, so the node has to be repointed at it; saying so
      # here is what stops the report still showing the one that was just fixed.
      def edit_block(input)
        block_id = input['block_id'].to_s
        unless @authored_blocks.include?(block_id)
          return { error: true, text: "No block #{block_id} was authored in this run." }
        end

        result = ChartBlockAuthor.new(@author, locale: @locale)
          .edit(block_id: block_id, find: input['find'].to_s, replace: input['replace'].to_s)

        { text: "Edited. The chart is now #{placement(result)} — patch the node that places it." }
      rescue ChartBlockAuthor::Rejected => e
        { error: true, text: e.message }
      end

      def placement(result)
        %({"blockId":"#{result.block_id}","version":#{result.version_number}})
      end

      # Rendering the report, or one chart in it, and reporting what the browser saw.
      def check(input)
        return { error: true, text: 'Checking is not available in this run.' } if checker.nil?

        block_id = input['block_id'].presence
        return checker.check(checker.layout_target(@layout)) if block_id.nil?

        version = authored_version(block_id)
        return { error: true, text: "No block #{block_id} was authored in this run." } if version.nil?

        checker.check(
          checker.block_target(
            bundle: version.bundle,
            manifest: version.manifest,
            messages: version.messages,
            config: input['config'] || {}
          )
        )
      end

      def authored_version(block_id)
        return nil unless @authored_blocks.include?(block_id)

        ContentBuilder::CustomBlock.find_by(id: block_id)&.latest_version
      end

      def checker
        return nil if @layout_record.nil?

        @checker ||= BlockChecker.new(layout: @layout_record, author: @author, locale: @locale)
      end

      def read_layout
        return { text: 'The report is empty. Your first patch_layout must include ROOT.' } if @layout.empty?

        { text: "#{Craftjs::LayoutSummary.text(@layout)}\n\nraw:\n#{@layout.to_json}" }
      end

      # A sparse patch, merged into the report as it stands: the same shape
      # McpServer::Tools::UpdateProjectLayout uses, which is proven with real models.
      #
      # Patching rather than resending the whole graph is what keeps a report of any
      # size within one reply: the model writes a section at a time instead of
      # re-emitting every node it has already written each time it adds one.
      def patch_layout(input)
        nodes = (input['nodes'] || {}).deep_stringify_keys
        graph = Craftjs::LayoutPatcher.patch(
          @layout, nodes: nodes, delete_node_ids: input['delete_node_ids']
        )

        result = Craftjs::LayoutValidator.validate(
          graph, widget_specs: widget_specs, convention_scope: nodes.keys
        )
        return { error: true, text: result.message } unless result.valid?

        @layout = graph
        { patched: true, text: "Patched. The report now reads:\n#{Craftjs::LayoutSummary.text(@layout)}" }
      rescue Craftjs::LayoutPatcher::PatchError => e
        { error: true, text: e.message }
      end

      def client
        @client ||= Aws::BedrockRuntime::Client.new(
          region: ENV.fetch('AWS_TOXICITY_DETECTION_REGION', 'eu-central-1'),
          # One turn writes a whole report layout, which takes minutes. The SDK's
          # default read timeout is 60 seconds and cuts the model off mid-reply.
          http_read_timeout: HTTP_READ_TIMEOUT_SECONDS,
          http_open_timeout: HTTP_OPEN_TIMEOUT_SECONDS,
          # A retry re-sends the whole transcript, so a hung request must not be sent
          # three more times behind our back. The job decides whether to try again.
          retry_limit: 0
        )
      end

      # Which model writes reports is a platform setting like every other AI feature,
      # not an environment variable only this engine knows about.
      def model_id
        @model_id ||= LLMSelector.new.llm_class_for_use_case('report_generation').new.model
      end

      def converse(messages)
        client.converse(
          model_id: model_id,
          # System prompt and tool list are the same ~38KB on every round, so they are
          # marked once and read from the provider's cache after the first call.
          system: [{ text: system_prompt }, CACHE_POINT],
          messages: cached(messages),
          tool_config: { tools: Tools::DEFINITIONS + [CACHE_POINT] },
          inference_config: { max_tokens: MAX_OUTPUT_TOKENS }
        )
      end

      # One moving mark at the end of the transcript: each round reads the prefix the
      # round before it wrote. It is never stored in +messages+, because marks left
      # behind would pile up past the handful a provider allows.
      def cached(messages)
        last = messages.last
        return messages if last.nil? || last[:role] != 'user'

        messages[0..-2] + [last.merge(content: last[:content] + [CACHE_POINT])]
      end

      # The model replied without calling a tool. A reply cut off by the output
      # limit needs different advice from one that just talked instead of acting.
      # Bedrock rejects the next request unless every tool call in the last assistant
      # message is answered, so a truncated reply that started a tool call is answered
      # call by call rather than with a plain message.
      def truncation_response(calls)
        outcome = {
          error: true,
          text: 'Your reply was cut off by the output token limit, so this call was not run. ' \
                'Send less in one call. For patch_layout that means fewer nodes: a patch can ' \
                'be as small as one section, and you can send as many patches as you need.'
        }

        return nudge('max_tokens') if calls.empty?

        { role: 'user', content: calls.map { |call| Messages.tool_result(call[:id], outcome) } }
      end

      def nudge(stop_reason)
        text = if stop_reason.to_s == 'max_tokens'
          'Your reply was cut off by the output token limit. Write less per tool call: ' \
            'a shorter block, or a smaller part of the layout. Then call the tool again.'
        else
          'Do not reply with text. Use the tools: explore with run_reporting_sql_query, ' \
            'write charts with author_chart_block, and build the report with patch_layout.'
        end

        { role: 'user', content: [{ text: text }] }
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

          - Changing something means patch_layout with just the nodes you are changing.
            Everything you do not send stays exactly as it is, so never re-send a node you
            are not editing.
          - Moving or reordering means sending the parent with its `nodes` array changed,
            and nothing else about it.
          - Removing something means its id in delete_node_ids. Its children go with it.
          - Adding a chart means author_chart_block first, then a patch that places it.
            Explore with run_reporting_sql_query if you need to know what the data holds.
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
          2. Write the charts. One author_chart_block call per chart. Six to eight is
             the most a report this length carries, so choose the questions worth a
             chart rather than charting everything you can. A chart you author and do
             not place is wasted.
          3. Build the report with patch_layout, a section at a time. Send only the nodes
             you are adding or changing; never re-send a node you have already written.
             Start with a patch that creates ROOT and the cover, then add sections. When
             the report is complete, stop calling tools and say in one sentence what you
             wrote — that is what ends the run.
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

          author_chart_block takes a title, the complete TSX source, the messages the
          block displays, and a config_schema. There is no sql argument: the queries are
          read out of the source, so the two can never disagree about what the chart
          reads. Put each one in a template literal at the top of the file.

          The source is compiled, typechecked against the SDK declarations, linted, and
          every query it runs goes through the SQL sandbox. Nothing is stored unless all
          of that passes, and what failed comes back with line numbers. You will not be
          asked to fix a block after it has been placed.

          ### messages — every string a reader sees

          A block displays no literal text. Each string is a key, read with msg(), and
          defined under the report's locale, the same one every text prop uses:

          messages: {"#{@locale}":{"title":"Participants per phase",
                                   "caption":"One line on what this shows.",
                                   "empty":"No data for this chart yet."}}

          Use the same keys in every locale. A key the source never reads, or a key a
          locale does not define, is reported as an error.

          ### config_schema — what an admin can change afterwards

          A generated chart is not the last word: whoever owns the report has to be able to
          correct it without editing code. config_schema is a JSON Schema object; each
          property becomes an input in the builder sidebar and arrives as config[key].

          {"type":"object",
           "properties":{
             "title":{"type":"string","x-multiloc":true,"title":"Chart title"},
             "caption":{"type":"string","x-multiloc":true,"title":"Caption"},
             "showValues":{"type":"boolean","title":"Show the value on each bar","default":true},
             "topN":{"type":"integer","title":"How many rows to show","default":10}
           }}

          Every chart exposes its title and its caption as x-multiloc strings, so the
          wording can always be fixed in every language. Then add one or two more where the
          chart has a real choice in it: how many rows to show, the sort direction, which
          measure to plot. Six properties is the maximum.

          - type is string, number, integer or boolean.
          - title is the label the admin reads.
          - "x-multiloc": true on a string gives a per-locale text input; the value arrives
            as a multiloc object, so read it with localize().
          - "enum": ["count","share"] gives a dropdown of fixed values.
          - default is what the chart already does. A field the block never reads is worse
            than no field, so read every one you declare, and make the block render
            identically before anything is touched.

          ### The source

          The file default-exports a React component taking { config, msg }, and may import
          only from 'gv-sdk':

          import { React, Box, Text, Title, Spinner, colors, useTheme, useLocalize,
                   useReportingData, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
                   CartesianGrid, Legend, LineChart, Line, AreaChart, Area,
                   PieChart, Pie, Cell, LabelList } from 'gv-sdk';

          const SQL = `SELECT ...`;

          export default function Block({ config, msg }) {
            const theme = useTheme();
            const localize = useLocalize();
            const { data, isLoading } = useReportingData(SQL);
            if (isLoading) return <Box p="24px" display="flex" justifyContent="center"><Spinner /></Box>;
            const rows = data ? data.rows : [];
            if (rows.length === 0) return <Text color="textSecondary">{msg('empty')}</Text>;

            // Every declared field is read, and falls back to what the chart would
            // have shown anyway.
            const showValues = config.showValues !== false;

            return (
              <Box width="100%">
                <Title variant="h4" m="0 0 12px">
                  {localize(config.title) || msg('title')}
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
                  {localize(config.caption) || msg('caption')}
                </Text>
              </Box>
            );
          }

          Notes that save you a round trip:
          - `data.rows` is an array of plain objects keyed by your column names. Alias your
            columns to the keys you use in the chart. `data` is undefined until it loads,
            and the typechecker will hold you to that.
          - The argument to useReportingData must be a static string: a literal, or a const
            in this file that holds one. It is extracted and snapshotted, so it cannot be
            assembled while the block runs.
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
            Never a literal hex value.
          - No fetch, no window, no document, no storage, no eval, no import(), no
            dangerouslySetInnerHTML, and no import other than 'gv-sdk'.

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
