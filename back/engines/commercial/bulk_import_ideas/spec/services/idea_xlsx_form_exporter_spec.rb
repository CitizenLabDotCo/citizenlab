# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::IdeaXlsxFormExporter do
  let(:phase) { create(:phase) }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: phase.project) }
  let(:service) { described_class.new phase, 'en', false }

  # TODO: JS - Make this a trait for the custom_form factory - :all_survey_field_types :all_ideation_field_types
  before do
    # Custom fields
    create(:custom_field, resource: custom_form, key: 'a_text_field', title_multiloc: { 'en' => 'A text field' }, enabled: true)
    create(:custom_field, resource: custom_form, key: 'number_field', title_multiloc: { 'en' => 'Number field' }, input_type: 'number', enabled: true)
    create(:custom_field_point, resource: custom_form, key: 'a_point_field', title_multiloc: { 'en' => 'Point field' }, enabled: true)

    select_field = create(:custom_field, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Select field' }, input_type: 'select', enabled: true)
    create(:custom_field_option, custom_field: select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
    create(:custom_field_option, custom_field: select_field, key: 'no', title_multiloc: { 'en' => 'No' })

    multiselect_field = create(:custom_field, resource: custom_form, key: 'multiselect_field', title_multiloc: { 'en' => 'Multi select field' }, input_type: 'multiselect', enabled: true)
    create(:custom_field_option, custom_field: multiselect_field, key: 'this', title_multiloc: { 'en' => 'This' })
    create(:custom_field_option, custom_field: multiselect_field, key: 'that', title_multiloc: { 'en' => 'That' })

    another_select_field = create(:custom_field, resource: custom_form, key: 'another_select_field', title_multiloc: { 'en' => 'Another select field' }, input_type: 'select', enabled: true)
    create(:custom_field_option, custom_field: another_select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
    create(:custom_field_option, custom_field: another_select_field, key: 'no', title_multiloc: { 'en' => 'No' })
  end

  describe 'export' do
    it 'produces an xlsx file with all the fields for an ideation phase' do
      xlsx = service.export
      xlsx_hash = XlsxService.new.xlsx_to_hash_array xlsx

      expect(xlsx).not_to be_nil
      expect(xlsx_hash.count).to eq 1
      expect(xlsx_hash[0].keys).to match_array([
        'First name(s)',
        'Last name',
        'Email address',
        'Permission',
        'Date Published (dd-mm-yyyy)',
        'Title',
        'Description',
        'Tags',
        'Location',
        'A text field',
        'Number field',
        'Point field - Latitude',
        'Point field - Longitude',
        'Select field',
        'Multi select field',
        'Another select field',
        'Image URL',
        'Latitude',
        'Longitude'
      ])
    end
  end
end
