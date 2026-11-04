# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::Recorder do
  subject(:recorder) { described_class.new(run) }

  let(:run) { create(:report_run, stopped_because: nil) }
  let(:usage) { Struct.new(:input_tokens, :output_tokens).new(1200, 80) }

  def assistant(*content) = { role: 'assistant', content: content }
  def tool_use(id, name, input = {}) = { tool_use: { tool_use_id: id, name: name, input: input } }

  it 'writes a prompt as a message the model is sent and the panel does not show' do
    recorder.record({ role: 'user', content: [{ text: 'Generate the report.' }] })

    message = run.messages.sole
    expect(message).to have_attributes(role: 'user', content: 'Generate the report.', displayed: false, replayed: true)
  end

  it 'writes what the model said, its tool calls and what the round cost' do
    recorder.record(assistant({ text: 'Looking.' }, tool_use('tu_1', 'get_layout', { 'a' => 1 })), usage: usage)

    message = run.messages.sole
    expect(message).to have_attributes(role: 'assistant', content: 'Looking.', input_tokens: 1200, output_tokens: 80)
    expect(message.tool_calls.sole).to have_attributes(
      tool_use_id: 'tu_1', name: 'get_layout', arguments: { 'a' => 1 }, status: 'pending'
    )
  end

  it 'fills each result in on the call it answers, rather than writing a message for it' do
    recorder.record(assistant(tool_use('tu_1', 'check'), tool_use('tu_2', 'run_reporting_sql_query')))
    recorder.record(ReportBuilder::Composition::Messages.results_message([
      [{ id: 'tu_1' }, { text: 'Too wide.', error: true, screenshot: Base64.strict_encode64('png') }],
      [{ id: 'tu_2' }, { text: '3 rows.' }]
    ]))

    calls = run.messages.sole.tool_calls
    expect(calls.map { |c| [c.tool_use_id, c.status, c.result] }).to eq [
      ['tu_1', 'failed', 'Too wide.'],
      ['tu_2', 'auto_executed', '3 rows.']
    ]
  end

  # A screenshot costs thousands of tokens to replay and shows a version of the chart
  # that has since been fixed, so it is not kept at all.
  it 'does not store screenshots' do
    recorder.record(assistant(tool_use('tu_1', 'check')))
    recorder.record({ role: 'user', content: [{ image: { format: 'png', source: { bytes: 'A' * 450_000 } } }] })

    expect(run.messages.count).to eq 1
    expect(run.size_in_chars).to be < 1_000
  end

  it 'writes nothing without a run' do
    expect { described_class.new(nil).record({ role: 'user', content: [{ text: 'hi' }] }) }
      .not_to change(AIAssistant::Message, :count)
  end

  it 'reports a write that fails instead of ending the run' do
    allow(run).to receive(:append_message!).and_raise(ActiveRecord::RecordInvalid)
    allow(ErrorReporter).to receive(:report)

    expect { recorder.record({ role: 'user', content: [{ text: 'hi' }] }) }.not_to raise_error
    expect(ErrorReporter).to have_received(:report)
  end
end
