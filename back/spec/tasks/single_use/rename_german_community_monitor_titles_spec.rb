# frozen_string_literal: true

require 'rails_helper'

# NOTE: single-use task specs are excluded from the suite (see spec_helper's `config.pattern`).
# rubocop:disable RSpec/DescribeClass
describe 'single_use:rename_german_community_monitor_titles' do
  let(:task) { Rake::Task['single_use:rename_german_community_monitor_titles'] }
  let(:old_titles) { { 'en' => 'Community monitor', 'de-DE' => 'Gemeinschaftspuls', 'de-AT' => 'Gemeinschaftspuls' } }
  let(:project) { create(:community_monitor_project, title_multiloc: old_titles) }
  let(:phase) { project.phases.first }

  before do
    load_rake_tasks_if_not_loaded
    phase.update_columns(title_multiloc: old_titles, native_survey_title_multiloc: old_titles)
  end

  # TenantScript writes its report to the working directory, so run in a throwaway one.
  around do |example|
    Dir.mktmpdir { |dir| Dir.chdir(dir) { example.run } }
  end

  after { task.reenable }

  it 'renames the German titles of the community monitor project and phase' do
    task.invoke('execute')

    new_titles = { 'en' => 'Community monitor', 'de-DE' => 'Stimmungsbarometer', 'de-AT' => 'Stimmungsbarometer' }
    expect(project.reload.title_multiloc).to eq new_titles
    expect(phase.reload.title_multiloc).to eq new_titles
    expect(phase.native_survey_title_multiloc).to eq new_titles
  end

  it 'does not change anything in a dry run' do
    task.invoke

    expect(project.reload.title_multiloc).to eq old_titles
    expect(phase.reload.title_multiloc).to eq old_titles
  end

  it 'keeps custom titles and titles of other projects' do
    project.update_column(:title_multiloc, old_titles.merge('de-DE' => 'Unser Gemeinschaftspuls'))
    other_project = create(:project, title_multiloc: old_titles)

    task.invoke('execute')

    expect(project.reload.title_multiloc['de-DE']).to eq 'Unser Gemeinschaftspuls'
    expect(project.title_multiloc['de-AT']).to eq 'Stimmungsbarometer'
    expect(other_project.reload.title_multiloc).to eq old_titles
  end
end
# rubocop:enable RSpec/DescribeClass
