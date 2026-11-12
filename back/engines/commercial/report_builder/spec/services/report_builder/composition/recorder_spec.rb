# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::Recorder do
  subject(:recorder) { described_class.new(run) }

  let(:run) { create(:report_run, stopped_because: nil) }
  let(:usage) { Struct.new(:input_tokens, :output_tokens).new(1200, 80) }

  def assistant(*content) = { role: 'assistant', content: content }
  def tool_use(id, name, input = {}) = { tool_use: { tool_use_id: id, name: name, input: input } }

  it 'writes a prompt as the context of a message the panel has nothing to show for' do
    recorder.record({ role: 'user', content: [{ text: 'Generate the report.' }] })

    message = run.messages.sole
    expect(message).to have_attributes(role: 'user', content: nil, model_text: 'Generate the report.')
    expect(run.conversation.messages.displayed).to be_empty
  end

  # The admin's question and the prompt written around it are one exchange, so the
  # panel shows the question and the model is sent the question with the report.
  context 'when the run answers a question the admin asked' do
    subject(:recorder) { described_class.new(run, author: author, turn_id: turn.id) }

    let(:author) { create(:admin) }
    let(:turn) { run.conversation.messages.create!(role: 'user', content: 'shorter please', author: author) }

    it 'keeps the first prompt on the question it was written around' do
      recorder.record({ role: 'user', content: [{ text: 'shorter please. The report reads:' }] })

      expect(run.messages.sole).to have_attributes(
        id: turn.id, content: 'shorter please', model_text: 'shorter please. The report reads:'
      )
    end

    # A run's review pass writes a prompt of its own, which answers nothing the admin
    # asked.
    it 'writes a later prompt as a message of its own' do
      recorder.record({ role: 'user', content: [{ text: 'shorter please. The report reads:' }] })
      recorder.record({ role: 'user', content: [{ text: 'I rendered the report you just wrote.' }] })

      expect(run.messages.map(&:content)).to eq ['shorter please', nil]
    end

    it 'attributes what it writes to whoever the run is for' do
      recorder.record(assistant({ text: 'Looking.' }))

      expect(run.messages.last.author_id).to eq author.id
    end
  end

  it 'writes what the model said, its tool calls and what the round cost' do
    recorder.record(assistant({ text: 'Looking.' }, tool_use('tu_1', 'get_layout', { 'a' => 1 })), usage: usage)

    message = run.messages.sole
    expect(message).to have_attributes(role: 'assistant', model_text: 'Looking.', input_tokens: 1200, output_tokens: 80)
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
    expect(ReportBuilder::Composition::Session.size_in_chars(run)).to be < 1_000
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
