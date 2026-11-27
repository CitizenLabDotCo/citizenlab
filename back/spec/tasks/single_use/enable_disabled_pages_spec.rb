# frozen_string_literal: true

require 'rails_helper'

# NOTE: single-use task specs are excluded from the suite (see spec_helper's `config.pattern`).
# rubocop:disable RSpec/DescribeClass
describe 'single_use:enable_disabled_pages' do
  let(:task) { Rake::Task['single_use:enable_disabled_pages'] }
  let(:survey_form) { create(:custom_form, participation_context: create(:native_survey_phase)) }
  let!(:survey_page) { create(:custom_field_page, resource: survey_form, enabled: false) }

  before { load_rake_tasks_if_not_loaded }

  # TenantScript writes its report to the working directory, so run in a throwaway one.
  around do |example|
    Dir.mktmpdir { |dir| Dir.chdir(dir) { example.run } }
  end

  after { task.reenable }

  it 'enables the disabled pages of a native survey form' do
    task.invoke('execute')

    expect(survey_page.reload.enabled).to be true
  end

  it 'enables the disabled pages of an ideation form' do
    ideation_form = create(:custom_form, participation_context: create(:single_phase_ideation_project))
    ideation_page = create(:custom_field_page, resource: ideation_form, enabled: false)

    task.invoke('execute')

    expect(ideation_page.reload.enabled).to be true
  end

  it 'does not change anything in a dry run' do
    task.invoke

    expect(survey_page.reload.enabled).to be false
  end

  it 'leaves disabled questions disabled' do
    question = create(:custom_field_text, resource: survey_form, enabled: false)

    task.invoke('execute')

    expect(question.reload.enabled).to be false
  end
end
# rubocop:enable RSpec/DescribeClass
