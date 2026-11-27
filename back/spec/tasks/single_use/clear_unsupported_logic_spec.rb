# frozen_string_literal: true

require 'rails_helper'

# NOTE: single-use task specs are excluded from the suite (see spec_helper's `config.pattern`).
# rubocop:disable RSpec/DescribeClass
describe 'single_use:clear_unsupported_logic' do
  let(:task) { Rake::Task['single_use:clear_unsupported_logic'] }
  let(:custom_form) { create(:custom_form, participation_context: create(:native_survey_phase)) }
  let(:rules) { { 'rules' => [{ 'if' => 1, 'goto_page_id' => 'page-id' }] } }

  def field_with_stored_logic(factory, *traits, **attributes)
    create(factory, *traits, resource: custom_form, **attributes).tap { |field| field.update_column(:logic, rules) }
  end

  before { load_rake_tasks_if_not_loaded }

  # TenantScript writes its report to the working directory, so run in a throwaway one.
  around do |example|
    Dir.mktmpdir { |dir| Dir.chdir(dir) { example.run } }
  end

  after { task.reenable }

  it 'clears the logic of input types that do not support logic' do
    fields = [
      field_with_stored_logic(:custom_field_ranking, :with_options),
      field_with_stored_logic(:custom_field_sentiment_linear_scale),
      field_with_stored_logic(:custom_field_text),
      field_with_stored_logic(:custom_field_multiselect, :with_options)
    ]

    task.invoke('execute')

    expect(fields.map { |field| field.reload.logic }).to all(eq({}))
  end

  it 'keeps the logic of input types that support logic' do
    fields = [
      field_with_stored_logic(:custom_field_select, :with_options),
      field_with_stored_logic(:custom_field_linear_scale),
      field_with_stored_logic(:custom_field_rating, maximum: 5),
      field_with_stored_logic(:custom_field_multiselect, :with_options, created_at: Time.utc(2025, 6, 1)),
      create(:custom_field_page, resource: custom_form, logic: { 'next_page_id' => 'page-id' })
    ]

    expect { task.invoke('execute') }.not_to(change { fields.map { |field| field.reload.logic } })
  end

  it 'does not change anything in a dry run' do
    ranking_field = field_with_stored_logic(:custom_field_ranking, :with_options)

    task.invoke

    expect(ranking_field.reload.logic).to eq rules
  end
end
# rubocop:enable RSpec/DescribeClass
