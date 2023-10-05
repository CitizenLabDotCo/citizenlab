# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::PrintCustomFieldsService do
  let(:project) { create(:continuous_project) }
  let(:service) { described_class.new project, custom_form.custom_fields, 'en', false }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

  before do
    # Custom fields
    create(:custom_field, resource: custom_form, key: 'a_text_field', title_multiloc: { 'en' => 'A text field' }, enabled: true)
    create(:custom_field, resource: custom_form, key: 'number_field', title_multiloc: { 'en' => 'Number field' }, input_type: 'number', enabled: true)
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

  describe 'create_pdf' do
    it 'prints a PDF form' do
      expect(service.create_pdf).not_to be_nil
    end
  end

  describe 'importer_data' do
    it 'returns form meta data for importer - page count, fields, options and positions' do
      expect(service.importer_data[:fields].pluck(:key)).to eq %w[
        title_multiloc
        body_multiloc
        location_description
        proposed_budget
        a_text_field
        number_field
        select_field
        yes
        no
        multiselect_field
        this
        that
        another_select_field
        yes
        no
      ]
    end
  end
end
