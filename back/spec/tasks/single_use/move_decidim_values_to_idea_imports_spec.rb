# frozen_string_literal: true

require 'rails_helper'

# NOTE: single-use task specs are excluded from the suite (see spec_helper's `config.pattern`).
# rubocop:disable RSpec/DescribeClass
describe 'single_use:move_decidim_values_to_idea_imports' do
  subject(:run) { task.invoke(Tenant.current.host, 'execute') }

  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:move_decidim_values_to_idea_imports'] }
  let(:scope) { { 'area_id' => SecureRandom.uuid, 'title_multiloc' => { 'en' => 'Utah' } } }
  let(:status) { { 'token' => 'accepted', 'title_multiloc' => { 'en' => 'Accepted' } } }
  let!(:idea) do
    create(:idea, custom_field_values: { 'decidim_scope' => scope, 'decidim_status' => status, 'field_1' => 'kept' })
  end

  after do
    task.reenable
    FileUtils.rm_f(%w[move_decidim_values_to_idea_imports.json move_decidim_values_to_idea_imports_dry_run.json])
  end

  it 'moves the decidim values into a new idea import, keeping the other values' do
    run

    idea.reload
    expect(idea.custom_field_values).to eq('field_1' => 'kept')
    expect(idea.idea_import.extra_info).to eq('decidim_scope' => scope, 'decidim_status' => status)
  end

  it 'merges the decidim values into an existing idea import' do
    idea_import = create(:idea_import, idea: idea, extra_info: { 'other' => 'value' })

    run

    expect(idea_import.reload.extra_info).to eq('other' => 'value', 'decidim_scope' => scope, 'decidim_status' => status)
  end

  it 'leaves ideas without decidim values alone' do
    plain = create(:idea, custom_field_values: { 'field_1' => 'kept' })

    run

    expect(plain.reload.custom_field_values).to eq('field_1' => 'kept')
    expect(plain.idea_import).to be_nil
  end

  it 'changes nothing on a dry run' do
    task.invoke(Tenant.current.host)

    idea.reload
    expect(idea.custom_field_values).to include('decidim_scope', 'decidim_status')
    expect(idea.idea_import).to be_nil
  end

  it 'requires a host' do
    expect { task.invoke }.to raise_error(ArgumentError, /host/)
  end
end
# rubocop:enable RSpec/DescribeClass
