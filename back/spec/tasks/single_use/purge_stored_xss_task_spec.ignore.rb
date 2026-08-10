# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:purge_stored_xss rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:purge_stored_xss'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
  end

  let(:report_path) { Rails.root.join('purge_stored_xss.json') }
  let(:dry_run_report_path) { Rails.root.join('purge_stored_xss_dry_run.json') }

  def run_task(dry_run: false, host: nil)
    Rake::Task['single_use:purge_stored_xss'].invoke(dry_run ? nil : 'execute', host)
  end

  def report
    JSON.parse(File.read(report_path))
  end

  # Models now sanitise on write, so a legacy payload has to be written past the callbacks, the way
  # it was stored before the fix. `update_column` skips validations and callbacks.
  def store_raw(record, attribute, value)
    record.update_column(attribute, value)
    record
  end

  context 'an idea body carrying an event-handler payload' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => '<p>x</p><img src=x onerror=alert(1)>' }) }

    it 'strips the handler' do
      run_task
      expect(idea.reload.body_multiloc['en']).not_to include('onerror')
    end

    it 'records the change with context' do
      run_task
      change = report['changes'].find { |c| c.dig('context', 'model') == 'Idea' && c.dig('context', 'attribute') == 'body_multiloc' }
      expect(change['context']).to include('model' => 'Idea', 'id' => idea.id, 'attribute' => 'body_multiloc')
      expect(change['new_value']['en']).not_to include('onerror')
    end
  end

  context 'an idea title carrying HTML' do
    let!(:idea) { store_raw(create(:idea), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>hi' }) }

    it 'strips all HTML from the title' do
      run_task
      expect(idea.reload.title_multiloc['en']).not_to include('onerror')
      expect(idea.reload.title_multiloc['en']).not_to include('<img')
    end
  end

  context 'a comment body carrying a script tag' do
    let!(:comment) { store_raw(create(:comment), :body_multiloc, { 'en' => '<p>hi</p><script>alert(1)</script>' }) }

    it 'strips the script' do
      run_task
      expect(comment.reload.body_multiloc['en']).not_to include('<script>')
    end
  end

  context 'a machine translation carrying an event-handler payload' do
    let!(:mt) do
      store_raw(create(:machine_translation, attribute_name: 'body_multiloc'), :translation, '<p>hi</p><img src=x onerror=alert(1)>')
    end

    it 'strips the handler' do
      run_task
      expect(mt.reload.translation).not_to include('onerror')
    end
  end

  context 'clean content' do
    let!(:idea) { create(:idea, body_multiloc: { 'en' => '<p>perfectly fine</p>' }) }

    it 'is left untouched and reported as no change' do
      expect { run_task }.not_to(change { idea.reload.body_multiloc })
      expect(report['changes']).to be_empty
      # Without this the example would also pass if the task had errored on every tenant.
      expect(report['errors']).to be_empty
      expect(report['processed_tenants']).to include(Tenant.current.host)
    end
  end

  context 'a dry run' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => '<img src=x onerror=alert(1)>' }) }

    it 'writes nothing but still reports the change it would make' do
      expect { run_task(dry_run: true) }.not_to(change { idea.reload.body_multiloc })
      expect(File).not_to exist(report_path)
      dry_run_report = JSON.parse(File.read(dry_run_report_path))
      expect(dry_run_report['changes']).not_to be_empty
    end
  end

  context 'when the task is run twice' do
    let!(:idea) { store_raw(create(:idea), :body_multiloc, { 'en' => '<img src=x onerror=alert(1)>' }) }

    it 'has nothing to do on the second run' do
      run_task
      Rake::Task['single_use:purge_stored_xss'].reenable

      expect { run_task }.not_to(change { idea.reload.body_multiloc })
      expect(report['changes']).to be_empty
    end
  end
end
# rubocop:enable RSpec/DescribeClass
