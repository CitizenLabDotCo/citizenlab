require 'rails_helper'

describe 'fix orderings tasks' do
  describe 'fix_existing_tenants:custom_fields_orderings rake task' do
    before { load_rake_tasks_if_not_loaded }

    it 'Fixes the orderings of custom fields' do
      form1 = create(:custom_form)
      create(:custom_field, resource: form1, input_type: 'number', key: 'field2')
      create(:custom_field_page, resource: form1, key: 'field1').update_column(:ordering, 0)
      create(:custom_field, resource: form1, input_type: 'number', key: 'field3').update_column(:ordering, 3)
      create(:custom_field, resource: form1, input_type: 'text', key: 'field4').update_column(:ordering, 3)
      create(:custom_field_page, resource: form1, key: 'field5').update_column(:ordering, 4)

      form2 = create(:custom_form)
      create(:custom_field_page, resource: form2, key: 'field1')
      create(:custom_field, resource: form2, input_type: 'number', key: 'field2')
      create(:custom_field, resource: form2, input_type: 'text', key: 'field3')
      create(:custom_field_page, resource: form2, key: 'field4')

      create(:custom_field, resource_id: nil, resource_type: 'User', input_type: 'text', key: 'field1')
      create(:custom_field, resource_id: nil, resource_type: 'User', input_type: 'number', key: 'field2').update_column(:ordering, 2)

      Rake::Task['fix_existing_tenants:custom_fields_orderings'].invoke

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

  describe 'fix_existing_tenants:custom_field_options_orderings rake task' do
    before { load_rake_tasks_if_not_loaded }

    it 'Fixes the orderings of custom field options and areas' do
      field1 = create(:custom_field_select)
      create(:custom_field_option, custom_field: field1, key: 'option1')
      create(:custom_field_option, custom_field: field1, key: 'option3').update_column(:ordering, 2)
      create(:custom_field_option, custom_field: field1, key: 'option2').update_column(:ordering, 0)

      field2 = create(:custom_field_ranking)
      create(:custom_field_option, custom_field: field2, key: 'by_train')
      create(:custom_field_option, custom_field: field2, key: 'by_bike')

      create(:area, title_multiloc: { 'en' => 'Area 1' })
      create(:area, title_multiloc: { 'en' => 'Area 4' }).update_column(:ordering, 3)
      create(:area, title_multiloc: { 'en' => 'Area 3' }).update_column(:ordering, 1)
      create(:area, title_multiloc: { 'en' => 'Area 2' }).update_column(:ordering, 0)

      Rake::Task['fix_existing_tenants:custom_field_options_orderings'].invoke

      expect(field1.reload.options.pluck(:key, :ordering)).to match([
        [an_instance_of(String), 0],
        [an_instance_of(String), 1],
        ['option3', 2]
      ])

      expect(field2.reload.options.pluck(:key, :ordering)).to eq([
        ['by_train', 0],
        ['by_bike', 1]
      ])

      expect(Area.order(:ordering).pluck(:title_multiloc, :ordering)).to match([
        [{ 'en' => an_instance_of(String) }, 0],
        [{ 'en' => an_instance_of(String) }, 1],
        [{ 'en' => 'Area 3' }, 2],
        [{ 'en' => 'Area 4' }, 3]
      ])
    end
  end
end
