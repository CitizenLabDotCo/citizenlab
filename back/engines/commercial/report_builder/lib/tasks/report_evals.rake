# frozen_string_literal: true

# Runs real report generations and records what they cost and how well they went.
#
# The prompt, the round cap, the token cap and the model are all guesses until this
# has been run. It is the only thing in the feature that produces numbers rather than
# opinions, so run it before and after changing any of them.
#
#   docker compose run --rm web bin/rails reporting:eval[riverside-park-renewal]
#   docker compose run --rm web bin/rails reporting:eval[riverside-park-renewal,3]
#
# Each run is a paid model call of several minutes. Nothing is written to any report:
# the layouts it composes are thrown away, and the blocks they authored with them. A
# screenshot of each finished report is kept under tmp/report_evals/<slug>/ for a
# person to judge what the numbers cannot.
namespace :reporting do
  desc 'Generate reports for a project and report what it cost (paid model calls)'
  task :eval, %i[slug runs host] => [:environment] do |_task, args|
    Apartment::Tenant.switch(args[:host] || 'localhost') do
      ReportEvalRun.new(slug: args[:slug], runs: (args[:runs] || 1).to_i).call
    end
  end
end

class ReportEvalRun
  Outcome = Struct.new(
    :run, :ok, :seconds, :rounds, :nodes, :charts, :chart_checks_passed,
    :builds_attempted, :builds_passed, :input_tokens, :output_tokens, :cache_read_tokens,
    :cost_usd, :stopped_because, :error, :screenshot_path,
    keyword_init: true
  )

  # The tools whose success is a chart that built.
  BUILD_TOOLS = %w[author_chart_block edit_source].freeze

  # List prices per million tokens, in USD, by the start of the Bedrock model id. An
  # estimate for comparing prompts against each other, not an invoice.
  PRICES_PER_MILLION_USD = {
    'eu.anthropic.claude-opus' => { input: 15.0, output: 75.0, cache_read: 1.5 },
    'eu.anthropic.claude-sonnet' => { input: 3.0, output: 15.0, cache_read: 0.3 },
    'eu.anthropic.claude-haiku' => { input: 1.0, output: 5.0, cache_read: 0.1 }
  }.freeze

  def initialize(slug:, runs:)
    @project = Project.find_by!(slug: slug)
    @runs = runs
    @author = User.admin.first
  end

  def call
    check_examples
    puts "Evaluating #{@runs} generation(s) of #{@project.title_multiloc.values.first}"
    outcomes = (1..@runs).map { |run| measure(run) }
    report(outcomes)
    outcomes
  end

  private

  # The prompt's own examples go through the same build a model's chart does. One
  # that fails is a failed first attempt in every run, paid for in rounds and tokens.
  def check_examples
    builder = ContentBuilder::CustomBlocks::BlockBuilder.new
    manifest = { 'manifest_version' => 1, 'sdk_version' => 'v1', 'targets' => ['report'],
                 'data_uses' => ['useReportingData'], 'config_schema' => { 'type' => 'object', 'properties' => {} } }
    messages = { locale => { 'title' => 'Title', 'caption' => 'Caption', 'empty' => 'Empty' } }
    examples = {
      'bar chart' => ReportBuilder::Composition::SystemPrompt::EXAMPLE_BAR_CHART,
      'line chart' => ReportBuilder::Composition::SystemPrompt::EXAMPLE_LINE_CHART
    }
    examples.each do |name, source|
      sql = '`SELECT 1 AS label, 2 AS count, 3 AS month, 4 AS participants FROM reporting_contributions LIMIT 1`'
      result = builder.call(source: source.sub('`SELECT ...`', sql), manifest: manifest, messages: messages, locales: [locale])
      puts "prompt example (#{name}): #{result.ok? ? 'builds' : "DOES NOT BUILD\n#{result.diagnostics_text}"}"
    end
  rescue ContentBuilder::CustomBlocks::SandboxClient::Unavailable => e
    puts "prompt examples: not checked, #{e.message}"
  end

  def measure(run)
    layout = scratch_layout
    composer = ReportBuilder::Composition::ReportComposer.new(
      @project, locale: locale, author: @author, layout_record: layout
    )

    started = Time.current
    error = nil
    craftjs = begin
      composer.compose
    rescue StandardError => e
      error = "#{e.class}: #{e.message}"
      nil
    end

    outcome = outcome_for(run, composer, craftjs, Time.current - started, error, layout)
    puts format_line(outcome)
    outcome
  ensure
    discard(layout, composer)
  end

  def outcome_for(run, composer, craftjs, seconds, error, layout)
    nodes = (craftjs || {}).keys.size
    charts = chart_nodes(craftjs)
    usage = composer.usage
    checker = ReportBuilder::Composition::BlockChecker.new(
      layout: layout, author: @author, locale: locale
    )

    attempted, passed = build_counts(composer.transcript)

    Outcome.new(
      run: run, ok: error.nil? && nodes.positive?, seconds: seconds.round(1),
      rounds: composer.transcript.count { |message| message[:role] == 'assistant' },
      nodes: nodes, charts: charts.size,
      chart_checks_passed: charts.count { |id| renders?(checker, id) },
      builds_attempted: attempted, builds_passed: passed,
      input_tokens: usage['input_tokens'].to_i, output_tokens: usage['output_tokens'].to_i,
      cache_read_tokens: usage['cache_read_input_tokens'].to_i,
      cost_usd: cost_usd(composer.model_name, usage),
      stopped_because: composer.stopped_because, error: error,
      screenshot_path: craftjs ? screenshot(checker, craftjs, run) : nil
    )
  end

  # How often a chart built first time: every author or edit call, and how many of
  # them the build accepted. The rest cost a round each.
  def build_counts(transcript)
    calls = {}
    transcript.each do |message|
      message[:content].each do |block|
        if (use = block[:tool_use]) && BUILD_TOOLS.include?(use[:name])
          calls[use[:tool_use_id]] = nil
        elsif (result = block[:tool_result]) && calls.key?(result[:tool_use_id])
          calls[result[:tool_use_id]] = result[:status] == 'success'
        end
      end
    end
    [calls.size, calls.values.count(true)]
  end

  def cost_usd(model, usage)
    prices = PRICES_PER_MILLION_USD.find { |prefix, _| model.to_s.start_with?(prefix) }&.last
    return nil if prices.nil?

    cached = usage['cache_read_input_tokens'].to_i
    uncached = [usage['input_tokens'].to_i - cached, 0].max
    total = (uncached * prices[:input]) + (cached * prices[:cache_read]) +
            (usage['output_tokens'].to_i * prices[:output])
    (total / 1_000_000.0).round(3)
  end

  # The whole report as a browser drew it. The numbers say whether it rendered; only
  # a person looking at this can say whether it is any good.
  def screenshot(checker, craftjs, run)
    outcome = checker.check(checker.layout_target(craftjs), screenshot: true)
    return nil if outcome[:screenshot].blank?

    dir = Rails.root.join('tmp', 'report_evals', @project.slug)
    dir.mkpath
    path = dir.join("run-#{run}.png")
    path.binwrite(Base64.strict_decode64(outcome[:screenshot]))
    path.to_s
  rescue StandardError
    nil
  end

  def chart_nodes(craftjs)
    (craftjs || {}).values.filter_map do |node|
      next unless node.is_a?(Hash) && node['type'].is_a?(Hash)
      next unless node['type']['resolvedName'] == 'CustomBlock'

      node.dig('props', 'blockId')
    end
  end

  # Whether the chart actually drew, which is the only quality signal available
  # without a person looking at it.
  def renders?(checker, block_id)
    version = ContentBuilder::CustomBlock.find_by(id: block_id)&.latest_version
    return false if version.nil?

    outcome = checker.check(
      checker.block_target(
        bundle: version.bundle, manifest: version.manifest, messages: version.messages
      )
    )
    !outcome[:error]
  rescue StandardError
    false
  end

  def scratch_layout
    ContentBuilder::Layout.create!(
      content_buildable: @project, code: "eval-#{SecureRandom.hex(4)}", enabled: false, craftjs_json: {}
    )
  end

  # An eval must not leave a report, or a library of blocks, behind.
  def discard(layout, composer)
    ContentBuilder::CustomBlock.where(id: composer&.instance_variable_get(:@authored_blocks)).destroy_all
    layout&.destroy
  end

  def locale
    AppConfiguration.instance.settings('core', 'locales')&.first || 'en'
  end

  def format_line(outcome)
    format(
      '  run %<run>d  %<status>-7s %<seconds>6.1fs  %<rounds>2d rounds  %<nodes>3d nodes  ' \
      '%<charts>d charts (%<passed>d render)  builds %<built>d/%<attempted>d  ' \
      'in %<input>d / out %<output>d / cached %<cached>d  %<cost>s  %<stopped>s%<error>s%<shot>s',
      run: outcome.run, status: outcome.ok ? 'ok' : 'FAILED', seconds: outcome.seconds,
      rounds: outcome.rounds, nodes: outcome.nodes, charts: outcome.charts,
      passed: outcome.chart_checks_passed, built: outcome.builds_passed, attempted: outcome.builds_attempted,
      input: outcome.input_tokens, output: outcome.output_tokens, cached: outcome.cache_read_tokens,
      cost: outcome.cost_usd ? format('~$%<cost>.2f', cost: outcome.cost_usd) : 'cost n/a',
      stopped: outcome.stopped_because, error: outcome.error ? "  #{outcome.error}" : '',
      shot: outcome.screenshot_path ? "  #{outcome.screenshot_path}" : ''
    )
  end

  def report(outcomes)
    ok = outcomes.count(&:ok)
    charts = outcomes.sum(&:charts)
    rendering = outcomes.sum(&:chart_checks_passed)

    attempted = outcomes.sum(&:builds_attempted)
    built = outcomes.sum(&:builds_passed)
    costs = outcomes.filter_map(&:cost_usd)

    puts <<~SUMMARY

      #{ok}/#{outcomes.size} runs produced a report
      charts        #{rendering}/#{charts} rendered with data
      builds        #{built}/#{attempted} accepted first time
      rounds        median #{median(outcomes.map(&:rounds))}, max #{outcomes.map(&:rounds).max}
      seconds       median #{median(outcomes.map(&:seconds))}, max #{outcomes.map(&:seconds).max}
      tokens        #{outcomes.sum(&:input_tokens)} in, #{outcomes.sum(&:output_tokens)} out
      cache reads   #{outcomes.sum(&:cache_read_tokens)}#{cache_note(outcomes)}
      est. cost     #{costs.empty? ? 'n/a (unknown model)' : format('~$%<total>.2f at list price', total: costs.sum)}
      stopped       #{outcomes.map(&:stopped_because).tally.map { |why, n| "#{why} x#{n}" }.join(', ')}
      screenshots   #{outcomes.filter_map(&:screenshot_path).first&.then { |path| File.dirname(path) } || 'none'}
    SUMMARY
  end

  # Zero cache reads across multi-round runs means the prompt is not stable and every
  # round is being paid for in full.
  def cache_note(outcomes)
    return '' unless outcomes.sum(&:cache_read_tokens).zero? && outcomes.sum(&:rounds) > outcomes.size

    '  <- nothing was cached; the prompt is not stable between rounds'
  end

  def median(values)
    return 0 if values.empty?

    sorted = values.sort
    sorted[sorted.size / 2]
  end
end
