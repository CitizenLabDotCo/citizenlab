require 'rails_helper'

describe 'fix_existing_tenants:custom_fields_first_page rake task' do
  before { load_rake_tasks_if_not_loaded }

  it 'Fixes the orderings' do
    form1 = create(:custom_form)
    create(:custom_field, resource: form1, input_type: 'number', key: 'field2')
    create(:custom_field_page, resource: form1, key: 'field1')
    create(:custom_field, resource: form1, input_type: 'number', key: 'field3')
    create(:custom_field, resource: form1, input_type: 'text', key: 'field4')
    create(:custom_field_page, resource: form1, key: 'field5')

    form2 = create(:custom_form)
    create(:custom_field_page, resource: form2, key: 'field1')
    create(:custom_field, resource: form2, input_type: 'number', key: 'field2')
    create(:custom_field, resource: form2, input_type: 'text', key: 'field3')
    create(:custom_field_page, resource: form2, key: 'field4')

    create(:custom_field, resource_id: nil, resource_type: 'User', input_type: 'text', key: 'field1')
    create(:custom_field, resource_id: nil, resource_type: 'User', input_type: 'number', key: 'field2')

    Rake::Task['fix_existing_tenants:custom_fields_first_page'].invoke

    expect(form1.reload.custom_fields.pluck(:key, :ordering)).to eq([
      ['field1', 0],
      ['field2', 1],
      ['field3', 2],
      ['field4', 3],
      ['field5', 4]
    ])

    expect(form2.reload.custom_fields.pluck(:key, :ordering)).to eq([
      ['field1', 0],
      ['field2', 1],
      ['field3', 2],
      ['field4', 3]
    ])

    expect(CustomField.where(resource_id: nil).order(:ordering).pluck(:key, :ordering)).to eq([
      ['field1', 0],
      ['field2', 1]
    ])
  end
end
