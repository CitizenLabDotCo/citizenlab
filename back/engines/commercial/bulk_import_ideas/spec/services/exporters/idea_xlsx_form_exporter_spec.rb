# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Exporters::IdeaXlsxFormExporter do
  let(:service) { described_class.new phase, 'en', false }

  describe 'export an ideation form' do
    let(:phase) { create(:phase) }
    let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: phase.project) }

    it 'produces an xlsx file with the default fields for an ideation phase' do
      xlsx = service.export
      xlsx_hash = XlsxService.new.xlsx_to_hash_array xlsx

      expect(xlsx).not_to be_nil
      expect(xlsx_hash.count).to eq 1
      expect(xlsx_hash[0].keys).to contain_exactly('First name(s)', 'Last name', 'Email address', 'Permission', 'Date Published (dd-mm-yyyy)', 'Title', 'Description', 'Tags', 'Location', 'Image URL', 'Latitude', 'Longitude')
    end
  end

  describe 'export a survey form' do
    let(:phase) { create(:native_survey_phase, with_permissions: true) }
    let(:custom_form) { create(:custom_form, participation_context: phase) }

    before do
      # Custom fields - 1 of each type
      create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'First page' })
      create(:custom_field_text, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'Text field' })
      create(:custom_field_multiline_text, resource: custom_form, key: 'multiline_text_field', title_multiloc: { 'en' => 'Multiline text field' })
      create(:custom_field_number, resource: custom_form, key: 'number_field', title_multiloc: { 'en' => 'Number field' })
      create(:custom_field_linear_scale, resource: custom_form, key: 'linear_scale_field', title_multiloc: { 'en' => 'Linear scale field' })
      create(:custom_field_rating, resource: custom_form, key: 'rating_field', title_multiloc: { 'en' => 'Rating field' })

      select_field = create(:custom_field_select, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Select field' })
      create(:custom_field_option, custom_field: select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
      create(:custom_field_option, custom_field: select_field, key: 'no', title_multiloc: { 'en' => 'No' })
      create(:custom_field_option, custom_field: select_field, other: true, title_multiloc: { 'en' => 'Other' })

      multiselect_field = create(:custom_field_multiselect, resource: custom_form, key: 'multiselect_field', title_multiloc: { 'en' => 'Multi select field' })
      create(:custom_field_option, custom_field: multiselect_field, key: 'this', title_multiloc: { 'en' => 'This' })
      create(:custom_field_option, custom_field: multiselect_field, key: 'that', title_multiloc: { 'en' => 'That' })

      image_multiselect_field = create(:custom_field_multiselect_image, resource: custom_form, key: 'image_select_field', title_multiloc: { 'en' => 'Image select field' })
      create(:custom_field_option, custom_field: image_multiselect_field, key: 'this', title_multiloc: { 'en' => 'Image1' })
      create(:custom_field_option, custom_field: image_multiselect_field, key: 'that', title_multiloc: { 'en' => 'Image2' })

      ranking_field = create(:custom_field_ranking, resource: custom_form, key: 'ranking_field', title_multiloc: { 'en' => 'Ranking field' })
      create(:custom_field_option, custom_field: ranking_field, key: 'one', title_multiloc: { 'en' => 'One' })
      create(:custom_field_option, custom_field: ranking_field, key: 'two', title_multiloc: { 'en' => 'Two' })

      create(:custom_field_matrix_linear_scale, resource: custom_form, key: 'matrix_field', title_multiloc: { 'en' => 'Matrix field' })

      # These will not be exported as we don't support their import via XLSX. Included here to document this fact.
      create(:custom_field_point, resource: custom_form, key: 'point_field', title_multiloc: { 'en' => 'Point field' })
      create(:custom_field_line, resource: custom_form, key: 'line_field', title_multiloc: { 'en' => 'Line field' })
      create(:custom_field_polygon, resource: custom_form, key: 'polygon_field', title_multiloc: { 'en' => 'Polygon field' })
      create(:custom_field_form_end_page, resource: custom_form)
    end

    it 'produces an xlsx file with the expected fields for the survey phase' do
      xlsx = service.export
      xlsx_hash = XlsxService.new.xlsx_to_hash_array xlsx

      expect(xlsx).not_to be_nil
      expect(xlsx_hash.count).to eq 1
      expect(xlsx_hash[0].keys).to contain_exactly('First name(s)', 'Last name', 'Email address', 'Permission', 'Date Published (dd-mm-yyyy)', 'Text field', 'Multiline text field', 'Number field', 'Linear scale field', 'Rating field', 'Select field', 'Type your answer', 'Multi select field', 'Image select field', 'Ranking field', 'Matrix field')
    end

    context 'when user fields in surveys are enabled' do
      it 'produces an xlsx file including user fields for the survey phase' do
        # Create some user fields
        create(:custom_field_gender, :with_options)
        create(:custom_field_checkbox, resource_type: 'User')
        create(:custom_field_date, resource_type: 'User')

        phase.permissions.find_by(action: 'posting_idea').update!(user_fields_in_form: true)
        xlsx = service.export
        xlsx_hash = XlsxService.new.xlsx_to_hash_array xlsx

        expect(xlsx).not_to be_nil
        expect(xlsx_hash.count).to eq 1
        row = xlsx_hash[0]

        # form fields
        expect(row.keys.count).to eq 19
        expect(row['First name(s)']).to eq 'Bill'
        expect(row['Last name']).to eq 'Test'
        expect(row['Email address']).to eq 'bill@govocal.com'
        expect(row['Permission']).to eq 'X'
        expect(row['Date Published (dd-mm-yyyy)']).to eq Time.zone.today.strftime('%d-%m-%Y')
        expect(row['Text field']).to eq 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        expect(row['Multiline text field']).to eq 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        expect(row['Number field']).to eq 3
        expect(row['Linear scale field']).to eq 5
        expect(row['Rating field']).to eq 5
        expect(row['Select field']).to eq 'Yes'
        expect(row['Type your answer']).to eq 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        expect(row['Multi select field']).to eq 'This; That'
        expect(row['Image select field']).to eq 'Image1; Image2'
        expect(row['Ranking field']).to eq 'One; Two'
        expect(row['Matrix field']).to eq 'We should send more animals into space: Strongly disagree; We should ride our bicycles more often: Strongly agree'
        # user fields in form
        expect(row['gender']).to eq 'Male'
        expect(row['I want to join the army']).to eq 'X'
        expect(row['When did you last see a mermaid?']).to eq Time.zone.today.strftime('%d-%m-%Y')
      end
    end
  end
end
