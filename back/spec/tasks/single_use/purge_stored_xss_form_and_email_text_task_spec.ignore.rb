# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:purge_stored_xss_form_and_email_text rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:purge_stored_xss_form_and_email_text'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
  end

  let(:report_path) { Rails.root.join('purge_stored_xss_form_and_email_text.json') }
  let(:dry_run_report_path) { Rails.root.join('purge_stored_xss_form_and_email_text_dry_run.json') }

  def run_task(dry_run: false, host: nil)
    Rake::Task['single_use:purge_stored_xss_form_and_email_text'].invoke(dry_run ? nil : 'execute', host)
  end

  def report
    JSON.parse(File.read(report_path))
  end

  # Models sanitise on write now, so a legacy payload has to be stored past the callbacks.
  def store_raw(record, attribute, value)
    record.update_column(attribute, value)
    record
  end

  context 'a custom field title carrying HTML' do
    let!(:custom_field) { store_raw(create(:custom_field), :title_multiloc, { 'en' => '<img src=x onerror=alert(1)>Age' }) }

    it 'strips the markup' do
      run_task
      expect(custom_field.reload[:title_multiloc]['en']).to eq 'Age'
    end

    it 'records the change with context' do
      run_task
      change = report['changes'].find { |c| c.dig('context', 'model') == 'CustomField' }
      expect(change['old_value']['en']).to eq '<img src=x onerror=alert(1)>Age'
      expect(change['new_value']['en']).to eq 'Age'
    end
  end

  # `CustomField#title_multiloc` returns a translation for these, so reading through the reader
  # would store that translation in a column the platform expects to be empty.
  context 'a title_page custom field, whose title comes from a translation' do
    let!(:page) { store_raw(create(:custom_field_page, code: 'title_page'), :title_multiloc, { 'en' => '<b>x</b>' }) }

    it 'stores the stripped column value, not the translation' do
      run_task
      expect(page.reload[:title_multiloc]['en']).to eq 'x'
    end
  end

  context 'campaign text regions carrying HTML' do
    let!(:campaign) do
      campaign = create(:manual_campaign)
      store_raw(campaign, :subject_multiloc, { 'en' => '<b>News</b> from the city' })
    end

    it 'strips the markup from the subject' do
      run_task
      expect(campaign.reload[:subject_multiloc]['en']).to eq 'News from the city'
    end
  end

  # A campaign reader merges the region defaults into the locales the admin left unset. Saving what
  # it returns would store those defaults as if an admin had typed them, which
  # `reject_default_region_values` exists to prevent.
  context 'an automated campaign whose region default covers other locales' do
    let!(:campaign) { store_raw(create(:welcome_campaign), :subject_multiloc, { 'en' => '<b>Welcome</b>' }) }

    it 'stores the stripped column alone, not the merged defaults' do
      run_task
      expect(campaign.reload[:subject_multiloc]).to eq({ 'en' => 'Welcome' })
    end
  end

  context 'clean content' do
    let!(:custom_field) { create(:custom_field, title_multiloc: { 'en' => 'Age' }) }

    it 'is left untouched and reported as no change' do
      expect { run_task }.not_to(change { custom_field.reload.title_multiloc })
      expect(report['changes']).to be_empty
      # Without this the example would also pass if the task had errored on every tenant.
      expect(report['errors']).to be_empty
      expect(report['processed_tenants']).to include(Tenant.current.host)
    end
  end

  context 'a dry run' do
    let!(:custom_field) { store_raw(create(:custom_field), :title_multiloc, { 'en' => '<b>Age</b>' }) }

    it 'writes nothing but still reports the change it would make' do
      expect { run_task(dry_run: true) }.not_to(change { custom_field.reload[:title_multiloc] })
      expect(File).not_to exist(report_path)
      dry_run_report = JSON.parse(File.read(dry_run_report_path))
      expect(dry_run_report['changes']).not_to be_empty
    end
  end

  context 'when the task is run twice' do
    let!(:custom_field) { store_raw(create(:custom_field), :title_multiloc, { 'en' => '<b>Age</b>' }) }

    it 'has nothing to do on the second run' do
      run_task
      Rake::Task['single_use:purge_stored_xss_form_and_email_text'].reenable

      expect { run_task }.not_to(change { custom_field.reload[:title_multiloc] })
      expect(report['changes']).to be_empty
    end
  end
end
# rubocop:enable RSpec/DescribeClass
