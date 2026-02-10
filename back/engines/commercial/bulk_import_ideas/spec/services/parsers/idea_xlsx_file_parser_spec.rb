# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Parsers::IdeaXlsxFileParser do
  let(:project) { create(:single_phase_ideation_project) }
  let(:service) { described_class.new create(:admin), 'en', project.phases.first&.id, false }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

  before do
    # Topics for project
    project.input_topics << create(:input_topic_economy, project:)
    project.input_topics << create(:input_topic_waste, project:)

    # Custom fields - 1 of each type
    create(:custom_field_text, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'Text field' })
    create(:custom_field_multiline_text, resource: custom_form, key: 'multiline_text_field', title_multiloc: { 'en' => 'Multiline text field' })
    create(:custom_field_number, resource: custom_form, key: 'number_field', title_multiloc: { 'en' => 'Number field' })
    create(:custom_field_point, resource: custom_form, key: 'point_field', title_multiloc: { 'en' => 'Point field' })
    create(:custom_field_linear_scale, resource: custom_form, key: 'linear_scale_field', title_multiloc: { 'en' => 'Linear scale field' })
    create(:custom_field_rating, resource: custom_form, key: 'rating_field', title_multiloc: { 'en' => 'Rating field' })

    select_field = create(:custom_field_select, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Select field' })
    create(:custom_field_option, custom_field: select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
    create(:custom_field_option, custom_field: select_field, key: 'no', title_multiloc: { 'en' => 'No' })
    create(:custom_field_option, custom_field: select_field, key: 'other', other: true, title_multiloc: { 'en' => 'Other' })

    multiselect_field = create(:custom_field_multiselect, resource: custom_form, key: 'multiselect_field', title_multiloc: { 'en' => 'Multi select field' })
    create(:custom_field_option, custom_field: multiselect_field, key: 'this', title_multiloc: { 'en' => 'This' })
    create(:custom_field_option, custom_field: multiselect_field, key: 'that', title_multiloc: { 'en' => 'That' })

    image_multiselect_field = create(:custom_field_multiselect_image, resource: custom_form, key: 'image_select_field', title_multiloc: { 'en' => 'Image select field' })
    create(:custom_field_option, custom_field: image_multiselect_field, key: 'image1', title_multiloc: { 'en' => 'Image 1' })
    create(:custom_field_option, custom_field: image_multiselect_field, key: 'image2', title_multiloc: { 'en' => 'Image 2' })

    ranking_field = create(:custom_field_ranking, resource: custom_form, key: 'ranking_field', title_multiloc: { 'en' => 'Ranking field' })
    create(:custom_field_option, custom_field: ranking_field, key: 'one', title_multiloc: { 'en' => 'One' })
    create(:custom_field_option, custom_field: ranking_field, key: 'two', title_multiloc: { 'en' => 'Two' })

    create(
      :custom_field_matrix_linear_scale,
      resource: custom_form,
      key: 'matrix_field',
      title_multiloc: { 'en' => 'Matrix field' },
      maximum: 3,
      linear_scale_label_1_multiloc: { 'en' => 'No' },
      linear_scale_label_2_multiloc: { 'en' => 'Maybe' },
      linear_scale_label_3_multiloc: { 'en' => 'Yes' }
    )
  end

  describe 'parse_file_async' do
    it 'creates a job to process a file with less that 50 ideas' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/import.xlsx').read
      expect do
        service.parse_file_async("data:application/pdf;base64,#{base_64_content}")
      end.to have_enqueued_job(BulkImportIdeas::IdeaImportJob)
    end
  end

  describe 'create_files' do
    it 'splits the file into separate files (1 original & 1 copy) when uploading' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/import.xlsx').read
      service.send(:create_files, "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base_64_content}")
      expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 2
      expect(BulkImportIdeas::IdeaImportFile.first.import_type).to eq 'xlsx'
      expect(BulkImportIdeas::IdeaImportFile.last.import_type).to eq 'xlsx'
    end
  end

  describe 'ideas_to_idea_rows' do
    let(:xlsx_ideas_array) do
      [
        {
          pdf_pages: [1],
          fields: {
            'First name(s)' => 'Bill',
            'Last name' => 'Test',
            'Email address' => 'bill@citizenlab.co',
            'Permission' => 'X',
            'Date Published (dd-mm-yyyy)' => '15-08-2023',
            'Title' => 'A title',
            'Description' => 'A description',
            'Tags' => 'Economy; Waste',
            'Location' => 'Somewhere',
            'Text field' => 'Loads to say here',
            'Multiline text field' => 'More to say here',
            'Number field' => 5,
            'Linear scale field' => 3,
            'Rating field' => 2,
            'Select field' => 'Yes',
            'Multi select field' => 'This; That',
            'Image select field' => 'Image 1; Image 2',
            'Ranking field' => 'Two; One',
            'Image URL' => 'https://images.com/image.png',
            'Latitude' => 50.5035,
            'Longitude' => 6.0944
          }
        }
      ]
    end
    let!(:import_file) { create(:idea_import_file) }
    let(:rows) { service.send(:ideas_to_idea_rows, xlsx_ideas_array, import_file) }

    it 'converts parsed XLSX core fields into idea rows' do
      expect(rows[0]).to include({
        title_multiloc: { en: 'A title' },
        body_multiloc: { en: 'A description' },
        project_id: project.id,
        topic_titles: %w[Economy Waste],
        published_at: '15-08-2023',
        latitude: 50.5035,
        longitude: 6.0944,
        location_description: 'Somewhere',
        image_url: 'https://images.com/image.png',
        pdf_pages: [1]
      })
    end

    it 'includes user details when "Permission" is not blank' do
      expect(rows[0]).to include({
        user_first_name: 'Bill',
        user_last_name: 'Test',
        user_email: 'bill@citizenlab.co'
      })
    end

    it 'does not include user details when "Permission" is blank' do
      xlsx_ideas_array[0][:fields]['Permission'] = ''
      rows = service.send(:ideas_to_idea_rows, xlsx_ideas_array, import_file)

      expect(rows[0]).not_to include({
        user_first_name: 'Bill',
        user_last_name: 'Test',
        user_email: 'bill@citizenlab.co'
      })
    end

    it 'converts parsed XLSX custom fields into idea rows' do
      expect(rows[0][:custom_field_values][:text_field]).to eq 'Loads to say here'
      expect(rows[0][:custom_field_values][:multiline_text_field]).to eq 'More to say here'
      expect(rows[0][:custom_field_values][:number_field]).to eq 5
      expect(rows[0][:custom_field_values][:linear_scale_field]).to eq 3
      expect(rows[0][:custom_field_values][:rating_field]).to eq 2
      expect(rows[0][:custom_field_values][:select_field]).to eq 'yes'
      expect(rows[0][:custom_field_values][:multiselect_field]).to match_array %w[this that]
      expect(rows[0][:custom_field_values][:ranking_field]).to eq %w[two one]
      expect(rows[0][:custom_field_values][:image_select_field]).to match_array %w[image1 image2]
    end

    it 'ignores completely blank rows' do
      xlsx_ideas_array = [
        {
          pdf_pages: [1],
          fields: {
            'First name' => '',
            'Last name' => '',
            'Email address' => '',
            'Permission' => '',
            'Date Published (dd-mm-yyyy)' => '',
            'Title' => '',
            'Description' => '',
            'Tags' => '',
            'Location' => '',
            'Text field' => '',
            'Number field' => '',
            'Select field' => '',
            'Multi select field' => '',
            'Another select field' => '',
            'Image URL' => ''
          }
        }
      ]
      idea_rows = service.send(:ideas_to_idea_rows, xlsx_ideas_array, import_file)
      expect(idea_rows.count).to eq 0
    end

    it 'correctly converts fields with the same title' do
      create(:custom_field_text, resource: custom_form, key: 'text_field2', title_multiloc: { 'en' => 'Text field' })
      xlsx_ideas_array = [
        {
          pdf_pages: [1],
          fields: {
            'Text field' => 'First text field',
            'Text field__1' => 'Second text field'
          }
        }
      ]
      idea_rows = service.send(:ideas_to_idea_rows, xlsx_ideas_array, import_file)
      expect(idea_rows.count).to eq 1
      expect(idea_rows[0][:custom_field_values][:text_field]).to eq 'First text field'
      expect(idea_rows[0][:custom_field_values][:text_field2]).to eq 'Second text field'
    end

    it 'correctly converts multiple select fields with other options' do
      another_select_field = create(:custom_field_multiselect, resource: custom_form, key: 'another_select_field', title_multiloc: { 'en' => 'Another select field' })
      create(:custom_field_option, custom_field: another_select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
      create(:custom_field_option, custom_field: another_select_field, key: 'no', title_multiloc: { 'en' => 'No' })
      create(:custom_field_option, custom_field: another_select_field, key: 'other', other: true, title_multiloc: { 'en' => 'Other' })

      third_select_field = create(:custom_field_multiselect, resource: custom_form, key: 'third_select_field', title_multiloc: { 'en' => 'Third select field' })
      create(:custom_field_option, custom_field: third_select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
      create(:custom_field_option, custom_field: third_select_field, key: 'no', title_multiloc: { 'en' => 'No' })
      create(:custom_field_option, custom_field: third_select_field, key: 'other', other: true, title_multiloc: { 'en' => 'Other' })

      fourth_select_field = create(:custom_field_multiselect, resource: custom_form, key: 'fourth_select_field', title_multiloc: { 'en' => 'Fourth select field' })
      create(:custom_field_option, custom_field: fourth_select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
      create(:custom_field_option, custom_field: fourth_select_field, key: 'no', title_multiloc: { 'en' => 'No' })
      create(:custom_field_option, custom_field: fourth_select_field, key: 'other', other: true, title_multiloc: { 'en' => 'Other' })

      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/import_select_other.xlsx').read
      file = service.send(:upload_source_file, "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base_64_content}")
      parsed_rows = service.parse_rows(file)

      expect(parsed_rows.pluck(:custom_field_values)).to eq(
        [
          {
            select_field: 'other',
            select_field_other: 'Answer one',
            another_select_field: ['other'],
            another_select_field_other: 'Answer two',
            third_select_field: ['other'],
            third_select_field_other: 'Answer three',
            fourth_select_field: ['other'],
            fourth_select_field_other: 'Answer Four'
          },
          {
            select_field: 'other',
            another_select_field: ['other'],
            another_select_field_other: 'Answer two',
            third_select_field: ['other'],
            fourth_select_field: ['other'],
            fourth_select_field_other: 'Answer Four'
          }
        ]
      )
    end

    it 'correctly parses the rows of a real xlsx file and converts to idea_rows' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/import.xlsx').read
      file = service.send(:upload_source_file, "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{base_64_content}")
      parsed_rows = service.parse_rows(file)
      expect(parsed_rows.count).to eq 2
      expect(parsed_rows[0]).to include(
        title_multiloc: { en: 'Another idea from xlsx' },
        body_multiloc: { en: 'And some bigger description here' },
        location_description: 'Oxford',
        custom_field_values: { text_field: 'Some custom text here' }
      )
      expect(parsed_rows[1]).to include(
        title_multiloc: { en: 'One more idea from xlsx' },
        body_multiloc: { en: 'And another description here' },
        location_description: 'Cambridge',
        custom_field_values: {}
      )
    end

    it 'processes select fields with integer values' do
      create(
        :custom_field_select,
        resource: custom_form,
        key: 'select_integer',
        title_multiloc: { 'en' => 'Select integer field' },
        options: [create(:custom_field_option, key: '2', title_multiloc: { 'en' => '2' })]
      )
      xlsx_ideas_array = [
        {
          pdf_pages: [1],
          fields: {
            'Select integer field' => 2
          }
        }
      ]
      idea_rows = service.send(:ideas_to_idea_rows, xlsx_ideas_array, import_file)
      expect(idea_rows.count).to eq 1
      expect(idea_rows[0][:custom_field_values][:select_integer]).to eq '2'
    end

    it 'text fields return text values if xlsx values are integers or floats' do
      xlsx_ideas_array = [
        { pdf_pages: [1], fields: { 'Text field' => 2 } },
        { pdf_pages: [1], fields: { 'Text field' => 2.2 } }
      ]
      idea_rows = service.send(:ideas_to_idea_rows, xlsx_ideas_array, import_file)
      expect(idea_rows.count).to eq 2
      expect(idea_rows[0][:custom_field_values][:text_field]).to eq '2'
      expect(idea_rows[1][:custom_field_values][:text_field]).to eq '2.2'
    end

    it 'parses matrix fields correctly' do
      xlsx_ideas_array = [
        { pdf_pages: [1], fields: { 'Matrix field' => 'We should send more animals into space: Yes; We should ride our bicycles more often: Maybe' } }
      ]
      idea_rows = service.send(:ideas_to_idea_rows, xlsx_ideas_array, import_file)
      expect(idea_rows.count).to eq 1
      expect(idea_rows[0][:custom_field_values][:matrix_field]).to eq({ 'send_more_animals_to_space' => 3, 'ride_bicycles_more_often' => 2 })

      # Misformatted matrix field - detects what it can
      xlsx_ideas_array[0][:fields]['Matrix field'] = 'We should send more animals into spaceNo; We should ride our bicycles more often: Yes'
      idea_rows = service.send(:ideas_to_idea_rows, xlsx_ideas_array, import_file)
      expect(idea_rows[0][:custom_field_values][:matrix_field]).to eq({ 'ride_bicycles_more_often' => 3 })
    end

    it 'parses user fields in surveys correctly' do
      # Basic survey
      phase = create(:native_survey_phase, with_permissions: true)
      phase.permissions.find_by(action: 'posting_idea').update!(user_fields_in_form: true)
      custom_form = create(:custom_form, participation_context: phase)
      create(:custom_field_page, resource: custom_form, title_multiloc: { 'en' => 'First page' })
      create(:custom_field_text, resource: custom_form, key: 'text_field', title_multiloc: { 'en' => 'Text field' })
      create(:custom_field_form_end_page, resource: custom_form)

      # User fields
      create(:custom_field_gender, :with_options, key: 'gender', title_multiloc: { 'en' => 'Gender' })
      create(:custom_field_checkbox, resource_type: 'User', key: 'checkbox', title_multiloc: { 'en' => 'A Checkbox field' })
      create(:custom_field_date, resource_type: 'User', key: 'date', title_multiloc: { 'en' => 'A Date field' })

      service = described_class.new(create(:admin), 'en', phase.id, false)

      xlsx_ideas_array = [
        {
          pdf_pages: [1],
          fields: {
            'Text field' => 'Something',
            'Gender' => 'Male',
            'A Checkbox field' => 'X',
            'A Date field' => '01-01-2025'
          }
        }
      ]
      idea_rows = service.send(:ideas_to_idea_rows, xlsx_ideas_array, import_file)
      expect(idea_rows.count).to eq 1
      custom_field_values = idea_rows[0][:custom_field_values]
      expect(custom_field_values[:text_field]).to eq 'Something'
      expect(custom_field_values[:u_gender]).to eq 'male'
      expect(custom_field_values[:u_checkbox]).to be true
      expect(custom_field_values[:u_date]).to eq '2025-01-01'
    end
  end

  describe 'format_date' do
    it 'formats date strings in dd-mm-yyyy format' do
      date_string = '15-08-2023'
      formatted_date = service.send(:format_date, date_string)
      expect(formatted_date).to eq '2023-08-15'
    end

    it 'formats date objects' do
      date_object = Date.new(2023, 8, 15)
      formatted_date = service.send(:format_date, date_object)
      expect(formatted_date).to eq '2023-08-15'
    end

    it 'returns nil for invalid date strings' do
      invalid_date_string = 'A DATE'
      formatted_date = service.send(:format_date, invalid_date_string)
      expect(formatted_date).to be_nil
    end
  end
end
