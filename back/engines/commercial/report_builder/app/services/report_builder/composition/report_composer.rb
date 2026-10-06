# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Composes a whole report in the background and without a browser: the model
    # explores the platform's reporting data with real SQL, writes a chart component
    # for each thing worth showing, and lays the whole document out.
    #
    # The tools, all executed here (Tools::DEFINITIONS):
    #   run_reporting_sql_query — real, sandboxed SQL, so charts are chosen after
    #                             seeing the data rather than guessed at.
    #   author_chart_block / edit_source — one chart, built, then stored as a custom block.
    #   check                   — what a real browser made of a chart, or of the report.
    #   get_layout / patch_layout — the report itself, built up a patch at a time and
    #                             validated before each one counts.
    #   read_docs               — the longer SDK notes, by topic, when the prompt is not enough.
    #
    # Anything rejected comes back as a tool result the model can correct itself
    # from, which is the whole feedback loop: there is no admin watching. A tool that
    # breaks on our side is reported the same way; nothing a tool does ends the run.
    class ReportComposer
      class ComposeError < StandardError; end

      # Enough rounds to explore the data, write several charts and lay them out,
      # with room for corrections. A run that needs more than this is not converging.
      MAX_ROUNDS = 32

      # A turn's wall clock. The round cap bounds the model; this bounds everything
      # else: a slow database or a renderer that hangs must not keep a job going all
      # night. Read between rounds, like the cancel flag.
      MAX_TURN_SECONDS = 60 * 60

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

      # @param project [Project] the subject of the report.
      # @param locale [String] the locale the report text is written in.
      # @param phase [Phase, nil] the one phase to report on, for a phase report.
      # @param author [User, nil] who the authored blocks are attributed to.
      # @param run_record [GenerationTranscript, nil] this run's row. The versions it
      #   writes point back at it, and it carries the cancel flag the loop reads.
      def initialize(project, locale:, phase: nil, author: nil, client: nil, layout_record: nil, run_record: nil)
        @project = project
        @locale = locale
        @phase = phase
        @author = author
        @client = client
        # The report's own layout row. Only used for checking: a render needs a layout
        # to scope its data token to.
        @layout_record = layout_record
        @run_record = run_record
        @authored_blocks = []
        # What the report held when this run started, and the graph as it stands now.
        @current_layout = nil
        @layout = {}
        # What the model was told and what it said, for whoever has to work out why a
        # run went the way it did. A chat turn starts from the stored conversation;
        # +turn_messages+ is the part this run added.
        @transcript = []
        @history_size = 0
        @usage = Hash.new(0)
        @stopped_because = 'failed'
        @turn_started_at = nil
      end

      # The run's record: every message in order, what it cost, and why it stopped.
      attr_reader :transcript, :usage, :stopped_because

      # The messages this run added to the conversation, which is what gets stored
      # for a chat turn: the history before them is already on record.
      def turn_messages = @transcript.drop(@history_size)

      # Which model wrote this run, for the record.
      def model_name = model_id

      # @return [Hash] a validated craftjs_json graph.
      # @raise [ComposeError] if no valid layout was produced within MAX_ROUNDS.
      def compose
        start_turn
        result = run_loop([{ role: 'user', content: [{ text: brief }] }])
        @stopped_because = result[:stopped]
        raise ComposeError, "no report was written (#{result[:stopped]})" if result[:layout].nil?

        # A run that was stopped — out of rounds, out of time, cancelled — did not
        # finish, and a review pass would only spend more of what ran out.
        return result[:layout] unless result[:stopped] == 'done'

        review(result[:layout])
      rescue StandardError
        # The charts were authored for a report that never got written — whether the
        # model gave up or the provider threw. Leaving them would fill the block library,
        # and now the toolbox, with orphans nothing can reach.
        discard_authored_blocks
        raise
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

        # "Not worth fixing" is an answer here, not a model that stopped short: without
        # this the loop would nudge it to use the tools for every remaining round.
        result = run_loop(
          [{ role: 'user', content: [{ text: <<~TEXT }] }], allow_answer_only: true, max_rounds: REVIEW_ROUNDS
            I rendered the report you just wrote. Some checks failed:

            #{outcome[:text]}

            Fix what is actually broken with patch_layout and stop. If a failure is not
            worth fixing, say so and stop — do not rewrite the report.
          TEXT
        )

        # Running out of review rounds is the bound working, not the report failing;
        # the clock and the cancel flag are the only ways a review changes the verdict.
        @stopped_because = result[:stopped] if %w[timeout cancelled].include?(result[:stopped])
        result[:layout] || layout
      end

      # One turn of the chat: answer the admin, and change the report if that is what
      # they asked for.
      #
      # @param current_layout [Hash] what the report holds now.
      # @param instruction [String] what the admin just asked.
      # @param history [Array<Hash>] the conversation so far, as Messages.history
      #   shapes it: every earlier turn with its tool calls and results.
      # @return [Hash] { layout: Hash or nil when nothing changed, reply: String }
      def revise(current_layout:, instruction:, history: [])
        start_turn
        @current_layout = current_layout
        @layout = current_layout || {}
        # Charts already in the report stay placeable; the model keeps what it keeps.
        @authored_blocks |= block_ids_in(current_layout)
        @history_size = history.size

        messages = history + [{ role: 'user', content: [{ text: revision_turn(instruction, history.empty?) }] }]
        result = run_loop(messages, allow_answer_only: true)
        @stopped_because = result[:stopped]
        result.slice(:layout, :reply)
      end

      private

      # @return [Hash] { layout:, reply:, stopped: } — stopped is one of
      #   GenerationTranscript::STOP_REASONS; the caller decides what it means.
      def run_loop(messages, allow_answer_only: false, max_rounds: MAX_ROUNDS)
        reply = nil
        patched = false

        max_rounds.times do
          return finish(patched, reply, 'cancelled') if cancel_requested?
          return finish(patched, reply, 'timeout') if turn_over?

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
            return finish(patched, reply, 'done') if done

            messages << nudge(response.stop_reason)
            next
          end

          outcomes = calls.map { |call| [call, execute(call)] }
          patched ||= outcomes.any? { |_call, outcome| outcome[:patched] }

          messages << Messages.results_message(outcomes)
        end

        # Out of rounds. Every patch was validated before it landed, so what is here
        # is a real report, just possibly an unfinished one — and an unfinished report
        # the admin can edit beats throwing away the whole run.
        finish(patched, reply, 'round_cap')
      ensure
        # Appended, not assigned: the review pass is a second conversation in the same
        # run, and the record has to hold both.
        @transcript.concat(messages)
      end

      def start_turn
        @turn_started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      end

      def turn_over?
        return false if @turn_started_at.nil?

        Process.clock_gettime(Process::CLOCK_MONOTONIC) - @turn_started_at > MAX_TURN_SECONDS
      end

      # The admin pressed stop. Read fresh each time: the flag is set by a web request
      # while this job is running.
      def cancel_requested?
        return false if @run_record.nil?

        @run_record.reload.cancel_requested?
      end

      def record_usage(response)
        reported = response.usage
        return if reported.nil?

        %i[input_tokens output_tokens cache_read_input_tokens cache_write_input_tokens].each do |field|
          @usage[field.to_s] += reported.respond_to?(field) ? reported.public_send(field).to_i : 0
        end
      end

      def finish(patched, reply, stopped)
        return { layout: nil, reply: reply, stopped: stopped } unless patched

        discard_unplaced_blocks(@layout)
        { layout: @layout, reply: reply, stopped: stopped }
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

      # A tool that fails on our side is a tool result, not an exception: the model is
      # told, and decides whether to try again or go on without it. The handlers rescue
      # what they can explain; this catches what they cannot.
      def execute(call)
        handle(call)
      rescue StandardError => e
        ErrorReporter.report(e, extra: { tool: call[:name] })
        {
          error: true,
          text: "#{call[:name]} failed on our side (#{e.class}). Try it once more; if it " \
                'fails again, carry on without it.'
        }
      end

      def handle(call)
        input = call[:input].is_a?(Hash) ? call[:input] : {}
        case call[:name]
        when 'run_reporting_sql_query' then run_query(input['query'])
        when 'author_chart_block' then author_block(input)
        when 'edit_source' then edit_block(input)
        when 'check' then check(input)
        when 'get_layout' then read_layout
        when 'patch_layout' then patch_layout(input)
        when 'read_docs' then read_docs(input['topic'])
        else { error: true, text: "Unknown tool '#{call[:name]}'." }
        end
      end

      def read_docs(topic)
        text = Docs.read(topic)
        return { text: text } if text

        { error: true, text: "No notes on '#{topic}'. The topics are: #{Docs.topics.join(', ')}." }
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
        result = block_author.author(
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

        result = block_author.edit(block_id: block_id, find: input['find'].to_s, replace: input['replace'].to_s)

        { text: "Edited. The chart is now #{placement(result)} — patch the node that places it." }
      rescue ChartBlockAuthor::Rejected => e
        { error: true, text: e.message }
      end

      def placement(result)
        %({"blockId":"#{result.block_id}","version":#{result.version_number}})
      end

      def block_author
        @block_author ||= ChartBlockAuthor.new(@author, locale: @locale, run_id: @run_record&.id)
      end

      # Rendering the report, one part of it, or one chart, and reporting what the
      # browser saw.
      def check(input)
        return { error: true, text: 'Checking is not available in this run.' } if checker.nil?

        screenshot = input['include_screenshot'] == true
        block_id = input['block_id'].presence
        node_id = input['node_id'].presence

        if block_id
          version = authored_version(block_id)
          return { error: true, text: "No block #{block_id} was authored in this run." } if version.nil?

          target = checker.block_target(
            bundle: version.bundle,
            manifest: version.manifest,
            messages: version.messages,
            config: input['config'] || {}
          )
        elsif node_id
          subgraph = Craftjs::Subgraph.extract(@layout, node_id)
          return { error: true, text: "There is no node #{node_id} in the report." } if subgraph.nil?

          target = checker.layout_target(subgraph)
        else
          target = checker.layout_target(@layout)
        end

        checker.check(target, screenshot: screenshot)
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

        missing = missing_versions(nodes)
        return { error: true, text: missing } if missing

        @layout = graph
        { patched: true, text: "Patched. The report now reads:\n#{Craftjs::LayoutSummary.text(@layout)}" }
      rescue Craftjs::LayoutPatcher::PatchError => e
        { error: true, text: e.message }
      end

      # The validator pins blockId to the charts of this run; the version number is
      # the other half of the pin, and a number that was never written renders nothing.
      def missing_versions(nodes)
        problems = nodes.filter_map do |id, node|
          # ROOT's type is the plain string "div"; only widget nodes carry a Hash.
          next unless node.is_a?(Hash) && node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'CustomBlock'

          block_id = node.dig('props', 'blockId')
          number = node.dig('props', 'version')
          next if ContentBuilder::CustomBlockVersion.exists?(custom_block_id: block_id, number: number)

          latest = ContentBuilder::CustomBlock.find_by(id: block_id)&.latest_version&.number
          "node #{id} places block #{block_id} at version #{number.inspect}, which does not exist" \
            "#{latest ? " (the latest is #{latest})" : ''}"
        end
        return nil if problems.empty?

        "Nothing was changed.\n#{problems.join("\n")}"
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
          messages: Messages.to_provider(cached(messages)),
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

      # The first thing the model is told about this report. In the user turn rather
      # than the system prompt, so the system prompt is the same bytes for every report
      # on the platform and the provider's cache carries across them.
      def brief
        <<~TEXT
          Generate the report.

          ## Project context

          #{context.to_prompt_text}
        TEXT
      end

      # In the chat the model is editing something that already exists, and the admin
      # is waiting: the instructions change from "write a report" to "change this one".
      # In the user turn, with the report as it stands: the layout changes every turn,
      # and anything that changes belongs after the cached prefix, not in it.
      def revision_turn(instruction, first_turn)
        <<~SECTION
          #{first_turn ? "## Project context\n\n#{context.to_prompt_text}\n" : ''}
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

          ### The admin says

          #{instruction}
        SECTION
      end

      def system_prompt
        @system_prompt ||= SystemPrompt.new(locale: @locale).text
      end
    end
  end
end
