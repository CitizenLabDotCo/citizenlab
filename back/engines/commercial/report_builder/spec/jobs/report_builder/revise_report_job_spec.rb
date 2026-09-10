# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::ReviseReportJob do
  subject(:enqueue_job) do
    described_class
      .with_tracking(owner: owner)
      .perform_later(report, instruction: 'make it shorter', locale: 'en', craftjs_json: nil)
  end

  let(:owner) { create(:admin) }
  let(:phase) { create(:phase) }
  let(:report) { create(:report, phase: phase) }
  let!(:chat) do
    create(:report_chat, report: report, transcript: [
      { 'role' => 'user', 'text' => 'make it shorter', 'at' => Time.current.iso8601 }
    ])
  end
  let(:revised_layout) do
    {
      'ROOT' => {
        'type' => 'div',
        'nodes' => ['textnode01'],
        'props' => { 'id' => 'e2e-content-builder-frame' },
        'custom' => {},
        'hidden' => false,
        'isCanvas' => true,
        'displayName' => 'div',
        'linkedNodes' => {}
      },
      'textnode01' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<h2>Short</h2>' } },
        'custom' => {},
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      }
    }
  end

  def stub_revision(result)
    allow_any_instance_of(ReportBuilder::Composition::ReportComposer)
      .to receive(:revise).and_return(result)
  end

  describe '#run', :active_job_que_adapter do
    it 'writes the revised layout and answers in the chat' do
      stub_revision({ layout: revised_layout, reply: 'Trimmed the summary.' })
      job = enqueue_job

      job.perform_now

      expect(report.reload.layout.craftjs_json).to eq revised_layout
      expect(chat.reload.transcript.last)
        .to include('role' => 'assistant', 'text' => 'Trimmed the summary.')
      expect(job.tracker.reload).to be_completed
    end

    it 'answers without touching the report when nothing was asked to change' do
      stub_revision({ layout: nil, reply: 'The chart shows weekly participants.' })
      job = enqueue_job

      expect { job.perform_now }.not_to change { report.reload.layout.craftjs_json }

      expect(chat.reload.transcript.last['text']).to eq 'The chart shows weekly participants.'
    end

    it 'still answers when the model returned no closing sentence' do
      stub_revision({ layout: revised_layout, reply: nil })

      enqueue_job.perform_now

      expect(chat.reload.transcript.last['text']).to be_present
    end

    it 'revises the layout from the editor, so unsaved edits are not overwritten' do
      editor_layout = { 'ROOT' => { 'type' => 'div', 'nodes' => [], 'props' => {} } }
      expect_any_instance_of(ReportBuilder::Composition::ReportComposer)
        .to receive(:revise)
        .with(hash_including(current_layout: editor_layout))
        .and_return({ layout: nil, reply: 'ok' })

      described_class
        .with_tracking(owner: owner)
        .perform_later(report, instruction: 'x', locale: 'en', craftjs_json: editor_layout)
        .perform_now
    end

    it 'falls back to the stored layout when no editor layout came with the turn' do
      expect_any_instance_of(ReportBuilder::Composition::ReportComposer)
        .to receive(:revise)
        .with(hash_including(current_layout: report.layout.craftjs_json))
        .and_return({ layout: nil, reply: 'ok' })

      enqueue_job.perform_now
    end

    it 'records whether the turn changed the report, so the editor knows to reload' do
      stub_revision({ layout: revised_layout, reply: 'Trimmed it.' })
      enqueue_job.perform_now
      expect(chat.reload.transcript.last['changed_layout']).to be true

      stub_revision({ layout: nil, reply: 'It shows weekly participants.' })
      described_class.with_tracking(owner: owner)
        .perform_later(report, instruction: 'what is that', locale: 'en', craftjs_json: nil)
        .perform_now
      expect(chat.reload.transcript.last['changed_layout']).to be false
    end

    it 'passes the conversation so far, so a turn continues the last one' do
      expect_any_instance_of(ReportBuilder::Composition::ReportComposer)
        .to receive(:revise)
        .with(hash_including(instruction: 'make it shorter', history: chat.transcript))
        .and_return({ layout: nil, reply: 'ok' })

      enqueue_job.perform_now
    end

    it 'keeps the turn the admin wrote after the job was enqueued' do
      stub_revision({ layout: nil, reply: 'ok' })
      job = enqueue_job
      chat.update!(transcript: chat.transcript + [
        { 'role' => 'user', 'text' => 'and add a chart', 'at' => Time.current.iso8601 }
      ])

      job.perform_now

      expect(chat.reload.transcript.map { |t| t['text'] })
        .to eq ['make it shorter', 'and add a chart', 'ok']
    end
  end

  describe 'when it finally fails', :active_job_que_adapter do
    it 'says so in the chat rather than leaving the panel waiting' do
      job = enqueue_job

      job.send(:expire)

      expect(chat.reload.transcript.last).to include('role' => 'assistant')
      expect(job.tracker).to be_completed
    end
  end
end
