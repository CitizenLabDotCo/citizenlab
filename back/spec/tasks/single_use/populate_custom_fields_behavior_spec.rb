# frozen_string_literal: true

require 'rails_helper'

# NOTE: single-use task specs are excluded from the suite (see spec_helper's `config.pattern`).
# rubocop:disable RSpec/DescribeClass
describe 'single_use:populate_custom_fields_behavior' do
  subject(:run) { task.invoke('execute') }

  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:populate_custom_fields_behavior'] }
  let(:fields_service) { Permissions::PermissionsCustomFieldsService.new }

  # The platform's demographic questions, which the 'global' behavior resolves to.
  let!(:domicile_field) { create(:custom_field_domicile, enabled: true, required: true) }
  let!(:gender_field) { create(:custom_field_gender, enabled: true, required: false) }

  after { task.reenable }

  # A permission from before the column existed.
  def legacy_permission(global_custom_fields:, **attributes)
    permission = create(:permission, **attributes)
    permission.update_columns(global_custom_fields: global_custom_fields, custom_fields_behavior: nil)
    permission.reload
  end

  def stored_behavior(permission)
    Permission.where(id: permission.id).pick(:custom_fields_behavior)
  end

  it "populates 'global' for a permission that asks the platform's questions" do
    permission = legacy_permission(global_custom_fields: true)

    run

    expect(stored_behavior(permission)).to eq 'global'
  end

  it "populates 'disabled' for a permission that asks nothing" do
    permission = legacy_permission(global_custom_fields: false)

    run

    expect(stored_behavior(permission)).to eq 'disabled'
  end

  it "populates 'custom' for a permission with questions of its own" do
    permission = legacy_permission(global_custom_fields: false)
    create(:permissions_custom_field, permission: permission, custom_field: gender_field, required: true, ordering: 0)

    run

    expect(stored_behavior(permission)).to eq 'custom'
  end

  it 'leaves the questions each permission asks unchanged' do
    permissions = [
      legacy_permission(global_custom_fields: true),
      legacy_permission(global_custom_fields: false, action: 'commenting_idea'),
      legacy_permission(global_custom_fields: false, action: 'reacting_idea').tap do |permission|
        create(:permissions_custom_field, permission: permission, custom_field: gender_field, required: true, ordering: 0)
      end
    ]
    before_run = permissions.map { |permission| fields_service.fields_for_permission(permission).map(&:custom_field_id) }

    run

    after_run = permissions.map { |permission| fields_service.fields_for_permission(permission.reload).map(&:custom_field_id) }
    expect(after_run).to eq before_run
  end

  it 'leaves global_custom_fields alone, so that the column can be dropped again' do
    permission = legacy_permission(global_custom_fields: true)

    run

    expect(permission.reload.global_custom_fields).to be true
  end

  it 'does not overwrite a permission that already has a behavior' do
    permission = create(:permission, custom_fields_behavior: 'disabled')

    run

    expect(stored_behavior(permission)).to eq 'disabled'
  end

  it 'changes nothing on a dry run' do
    permission = legacy_permission(global_custom_fields: true)

    task.invoke

    expect(stored_behavior(permission)).to be_nil
  end
end
# rubocop:enable RSpec/DescribeClass
