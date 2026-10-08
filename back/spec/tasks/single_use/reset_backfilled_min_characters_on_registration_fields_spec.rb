# frozen_string_literal: true

require 'rails_helper'

# NOTE: single-use task specs are excluded from the suite (see spec_helper's `config.pattern`).
# rubocop:disable RSpec/DescribeClass
describe 'single_use:reset_backfilled_min_characters_on_registration_fields' do
  subject(:run) { task.invoke('execute') }

  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:reset_backfilled_min_characters_on_registration_fields'] }
  let!(:registration_text) { create(:custom_field, min_characters: 3) }

  after do
    task.reenable
    FileUtils.rm_f('reset_backfilled_min_characters_on_registration_fields.json')
    FileUtils.rm_f('reset_backfilled_min_characters_on_registration_fields_dry_run.json')
  end

  def stored_min_characters(field)
    CustomField.where(id: field.id).pick(:min_characters)
  end

  it 'lifts the backfilled minimum on registration text questions' do
    registration_multiline_text = create(:custom_field_multiline_text, min_characters: 3)

    run

    expect(stored_min_characters(registration_text)).to be_nil
    expect(stored_min_characters(registration_multiline_text)).to be_nil
  end

  it 'leaves survey and input form questions alone' do
    form_field = create(:custom_field, :for_custom_form, min_characters: 3)

    run

    expect(stored_min_characters(form_field)).to eq 3
  end

  it 'leaves a registration question with another minimum alone' do
    registration_text.update!(min_characters: 5)

    run

    expect(stored_min_characters(registration_text)).to eq 5
  end

  it 'keeps the field updated_at' do
    expect { run }.not_to(change { registration_text.reload.updated_at })
  end

  it 'changes nothing on a dry run' do
    task.invoke

    expect(stored_min_characters(registration_text)).to eq 3
  end

  it 'reports every minimum it would lift on a dry run' do
    task.invoke

    changes = JSON.parse(File.read('reset_backfilled_min_characters_on_registration_fields_dry_run.json'))['changes']
    expect(changes).to contain_exactly(
      hash_including(
        'old_value' => 3,
        'new_value' => nil,
        'context' => hash_including(
          'tenant' => Tenant.current.host,
          'field_id' => registration_text.id,
          'field_key' => registration_text.key
        )
      )
    )
  end
end
# rubocop:enable RSpec/DescribeClass
