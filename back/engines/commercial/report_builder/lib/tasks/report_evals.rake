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
# the layouts it composes are thrown away, and the blocks they authored with them.
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
    :input_tokens, :output_tokens, :cache_read_tokens, :stopped_because, :error,
    keyword_init: true
  )

  def initialize(slug:, runs:)
    @project = Project.find_by!(slug: slug)
    @runs = runs
    @author = User.admin.first
  end

  def call
    puts "Evaluating #{@runs} generation(s) of #{@project.title_multiloc.values.first}"
    outcomes = (1..@runs).map { |run| measure(run) }
    report(outcomes)
    outcomes
  end

  private

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

    Outcome.new(
      run: run, ok: error.nil? && nodes.positive?, seconds: seconds.round(1),
      rounds: composer.transcript.count { |message| message[:role] == 'assistant' },
      nodes: nodes, charts: charts.size,
      chart_checks_passed: charts.count { |id| renders?(checker, id) },
      input_tokens: usage['input_tokens'].to_i, output_tokens: usage['output_tokens'].to_i,
      cache_read_tokens: usage['cache_read_input_tokens'].to_i,
      stopped_because: composer.stopped_because, error: error
    )
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
      '%<charts>d charts (%<passed>d render)  in %<input>d / out %<output>d / cached %<cached>d  %<stopped>s%<error>s',
      run: outcome.run, status: outcome.ok ? 'ok' : 'FAILED', seconds: outcome.seconds,
      rounds: outcome.rounds, nodes: outcome.nodes, charts: outcome.charts,
      passed: outcome.chart_checks_passed, input: outcome.input_tokens,
      output: outcome.output_tokens, cached: outcome.cache_read_tokens,
      stopped: outcome.stopped_because, error: outcome.error ? "  #{outcome.error}" : ''
    )
  end

  def report(outcomes)
    ok = outcomes.count(&:ok)
    charts = outcomes.sum(&:charts)
    rendering = outcomes.sum(&:chart_checks_passed)

    puts <<~SUMMARY

      #{ok}/#{outcomes.size} runs produced a report
      charts        #{rendering}/#{charts} rendered with data
      rounds        median #{median(outcomes.map(&:rounds))}, max #{outcomes.map(&:rounds).max}
      seconds       median #{median(outcomes.map(&:seconds))}, max #{outcomes.map(&:seconds).max}
      tokens        #{outcomes.sum(&:input_tokens)} in, #{outcomes.sum(&:output_tokens)} out
      cache reads   #{outcomes.sum(&:cache_read_tokens)}#{cache_note(outcomes)}
      stopped       #{outcomes.map(&:stopped_because).tally.map { |why, n| "#{why} x#{n}" }.join(', ')}
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
