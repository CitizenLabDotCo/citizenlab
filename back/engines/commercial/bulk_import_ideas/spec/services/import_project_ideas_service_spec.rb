# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportProjectIdeasService do
  let(:project) { create(:continuous_project) }
  let(:service) { described_class.new create(:admin), project.id, 'en', nil, false }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

  before do
    # Topics for project
    project.allowed_input_topics << create(:topic_economy)
    project.allowed_input_topics << create(:topic_waste)

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

  describe 'upload_file' do
    it 'splits a 12 page file successfully based on the number of pages in the template (2) and creates additional files' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_12.pdf').read
      service.create_files "data:application/pdf;base64,#{base_64_content}"
      expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 3
      expect(BulkImportIdeas::IdeaImportFile.all.pluck(:num_pages)).to match_array [12, 8, 4]
      expect(BulkImportIdeas::IdeaImportFile.where(parent: nil).pluck(:num_pages)).to eq [12]
    end

    it 'raises an error if a PDF file has too many pages (more than 50)' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_64.pdf').read
      expect { service.create_files "data:application/pdf;base64,#{base_64_content}" }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_ideas_maximum_pdf_pages_exceeded'))
      )
    end
  end

  describe 'generate_example_xlsx' do
    it 'produces an xlsx file with all the fields for a project' do
      xlsx = service.generate_example_xlsx
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
        'Select field',
        'Multi select field',
        'Another select field',
        'Image URL',
        'Latitude',
        'Longitude'
      ])
    end
  end

  describe 'private' do
    describe 'ideas_to_idea_rows' do
      let(:pdf_ideas) do
        [
          {
            pdf_pages: [1, 2],
            fields: {
              'First name(s) (optional)' => 'John',
              'Last name (optional)' => 'Rambo',
              'Email address (optional)' => 'john_rambo@gravy.com',
              'Permission' => 'X',
              'Title' => 'Free donuts for all',
              'Description' => 'Give them all donuts',
              'Location' => 'Somewhere',
              'Select field' => 'Yes;No',
              'Multi select field' => 'This;That',
              'A text field (optional)' => 'Not much to say',
              'Another select field' => 'No',
              'Ignored field' => 'Ignored value',
              'Number field' => '22'
            }
          },
          {
            pdf_pages: [3, 4],
            fields: {
              'First name(s) (optional)' => 'Ned',
              'Last name (optional)' => 'Flanders',
              'Email address (optional)' => 'ned@simpsons.com',
              'Permission' => '',
              'Title' => 'New Wrestling Arena needed',
              'Description' => 'I am convinced that if we do not get this we will be sad.',
              'Location' => 'Behind the sofa',
              'Select field' => 'No',
              'Multi select field' => 'That',
              'A text field (optional)' => 'Something else',
              'Another select field' => '',
              'Ignored field' => 'Ignored value',
              'Number field' => '28'
            }
          }
        ]
      end
      let(:rows) { service.send(:ideas_to_idea_rows, pdf_ideas) }

      it 'converts the output from GoogleFormParser into idea rows' do
        expect(rows.count).to eq 2
        expect(rows[0][:title_multiloc]).to eq({ en: 'Free donuts for all' })
        expect(rows[0][:body_multiloc]).to eq({ en: 'Give them all donuts' })
        expect(rows[0][:project_id]).to eq project.id
        expect(rows[1][:location_description]).to eq 'Behind the sofa'
      end

      it 'includes user details when "Permissions" field is completed' do
        expect(rows[0][:user_email]).to eq 'john_rambo@gravy.com'
        expect(rows[0][:user_first_name]).to eq 'John'
        expect(rows[0][:user_last_name]).to eq 'Rambo'
      end

      it 'does not include user details when "Permissions" field is blank' do
        expect(rows[1][:user_email]).to be_nil
        expect(rows[1][:user_first_name]).to be_nil
        expect(rows[1][:user_last_name]).to be_nil
      end

      it 'converts text & number custom fields' do
        expect(rows.count).to eq 2
        expect(rows[0][:custom_field_values][:a_text_field]).to eq 'Not much to say'
        expect(rows[1][:custom_field_values][:a_text_field]).to eq 'Something else'
        expect(rows[0][:custom_field_values][:number_field]).to eq 22
        expect(rows[1][:custom_field_values][:number_field]).to eq 28
      end

      it 'converts single select custom fields and only uses the first checked value' do
        expect(rows.count).to eq 2
        expect(rows[0][:custom_field_values][:select_field]).to eq 'yes'
        expect(rows[1][:custom_field_values][:select_field]).to eq 'no'
      end

      it 'correctly imports different select fields with the same option values' do
        expect(rows.count).to eq 2
        expect(rows[0][:custom_field_values][:another_select_field]).to eq 'no'
      end

      it 'can deal with empty select fields' do
        expect(rows.count).to eq 2
        expect(rows[1][:custom_field_values].keys).not_to include(:another_select_field)
      end

      it 'converts multi-select custom fields' do
        expect(rows.count).to eq 2
        expect(rows[0][:custom_field_values][:multiselect_field]).to match_array %w[this that]
        expect(rows[1][:custom_field_values][:multiselect_field]).to match_array ['that']
      end

      it 'ignores fields/options that it cannot find in the form' do
        # check that option name or field value does not appear in a text representation of the rows object
        expect(rows.count).to eq 2
        expect(rows.inspect).to include 'John'
        expect(rows.inspect).not_to include 'Ignored value'
        expect(rows.inspect).not_to include 'Ignored option'
      end

      it 'lists the correct pages for the document' do
        expect(rows[0][:pdf_pages]).to eq [1, 2]
        expect(rows[1][:pdf_pages]).to eq [3, 4]
      end

      it 'does not return an email if it does not validate' do
        ideas = [{
          pdf_pages: [1, 2],
          fields: { 'First name' => 'John', 'Last name' => 'Rambo', 'Email address' => 'john_rambo.com' }
        }]
        rows = service.send(:ideas_to_idea_rows, ideas)
        expect(rows[0].keys).not_to include :user_email
      end

      it 'can convert a document in french' do
        service = described_class.new create(:admin), project.id, 'fr-FR', nil, true
        ideas = [{
          pdf_pages: [1, 2],
          fields: {
            'Prénom(s)' => 'Jean',
            'Nom de famille' => 'Rambo',
            'Adresse e-mail' => 'jean@france.com',
            'Autorisation' => 'X',
            'Titre' => 'Bonjour',
            'Description' => "Je suis un chien. J'aime les chats."
          }
        }]
        rows = service.send(:ideas_to_idea_rows, ideas)

        expect(rows[0][:title_multiloc]).to eq({ 'fr-FR': 'Bonjour' })
        expect(rows[0][:body_multiloc]).to eq({ 'fr-FR': "Je suis un chien. J'aime les chats." })
        expect(rows[0][:user_email]).to eq 'jean@france.com'
        expect(rows[0][:user_first_name]).to eq 'Jean'
        expect(rows[0][:user_last_name]).to eq 'Rambo'
      end

      it 'can parse select fields from option values with page locations' do
        expect_any_instance_of(described_class).to receive(:import_form_data).and_return(pdf_form_data)
        ideas = [{
          pdf_pages: [1, 2],
          fields: {
            'Title' => 'Free donuts for all',
            'Description' => 'Give them all donuts',
            'Yes_2.50' => 'filled_checkbox',
            'This_2.70' => 'filled_checkbox',
            'That_2.73' => 'filled_checkbox'
          }
        }]
        rows = service.send(:ideas_to_idea_rows, ideas)

        expect(rows[0][:title_multiloc]).to eq({ en: 'Free donuts for all' })
        expect(rows[0][:body_multiloc]).to eq({ en: 'Give them all donuts' })
        expect(rows[0][:custom_field_values][:select_field]).to eq 'yes'
        expect(rows[0][:custom_field_values][:multiselect_field]).to match_array %w[this that]
      end

      it 'can accept select fields as arrays as well as delimited strings' do
        pdf_ideas[0][:fields]['Multi select field'] = 'This;That'
        pdf_ideas[1][:fields]['Multi select field'] = %w[This That]

        expect(rows[0][:custom_field_values][:multiselect_field]).to match_array %w[this that]
        expect(rows[1][:custom_field_values][:multiselect_field]).to match_array %w[this that]
      end

      it 'includes user details when "PDF Permission Checkbox" field is present in PDF output' do
        # Remove permission field and use output from checkbox on PDF scan
        pdf_ideas[0][:fields].delete('Permission')
        pdf_ideas[0][:fields]['By checking this box I consent to my data'] = 'filled_checkbox'
        rows = service.send(:ideas_to_idea_rows, pdf_ideas)

        expect(rows[0][:user_email]).to eq 'john_rambo@gravy.com'
        expect(rows[0][:user_first_name]).to eq 'John'
        expect(rows[0][:user_last_name]).to eq 'Rambo'
      end

      context 'xlsx specific fields' do
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
                'A text field' => 'Loads to say here',
                'Number field' => 5,
                'Select field' => 'Yes',
                'Multi select field' => 'This; That',
                'Another select field' => 'No',
                'Image URL' => 'https://images.com/image.png',
                'Latitude' => 50.5035,
                'Longitude' => 6.0944
              }
            }
          ]
        end
        let(:rows) { service.send(:ideas_to_idea_rows, xlsx_ideas_array) }

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
          rows = service.send(:ideas_to_idea_rows, xlsx_ideas_array)

          expect(rows[0]).not_to include({
            user_first_name: 'Bill',
            user_last_name: 'Test',
            user_email: 'bill@citizenlab.co'
          })
        end

        it 'converts parsed XLSX custom fields into idea rows' do
          expect(rows[0][:custom_field_values][:a_text_field]).to eq 'Loads to say here'
          expect(rows[0][:custom_field_values][:number_field]).to eq 5
          expect(rows[0][:custom_field_values][:select_field]).to eq 'yes'
          expect(rows[0][:custom_field_values][:another_select_field]).to eq 'no'
          expect(rows[0][:custom_field_values][:multiselect_field]).to match_array %w[this that]
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
                'A text field' => '',
                'Number field' => '',
                'Select field' => '',
                'Multi select field' => '',
                'Another select field' => '',
                'Image URL' => ''
              }
            }
          ]
          idea_rows = service.send(:ideas_to_idea_rows, xlsx_ideas_array)
          expect(idea_rows.count).to eq 0
        end
      end
    end

    describe 'merge_pdf_rows' do
      let(:pdf_ideas) do
        {
          form_parsed_ideas: [
            {
              pdf_pages: [1, 2],
              fields: { 'Title' => 'Form title 1', 'Location' => 'Formville' }
            },
            {
              pdf_pages: [3, 4],
              fields: { 'Title' => 'Form title 2', 'Description' => 'Form description 2', 'Select field' => 'Yes' }
            }
          ],
          text_parsed_ideas: [
            {
              pdf_pages: [1, 2],
              fields: { 'Title' => 'Text title 1', 'Description' => 'Text description 1', 'Location' => 'Textville' }
            },
            {
              pdf_pages: [3, 4],
              fields: { 'Title' => 'Text title 2', 'Description' => 'Text description 2', 'Location' => 'Textington', 'Another select field' => 'No' }
            }
          ]
        }
      end

      it 'merges both sources, prioritising those from the form parser' do
        rows = service.send(:merge_pdf_rows, pdf_ideas)
        expect(rows[0]).to include({
          title_multiloc: { en: 'Form title 1' },
          body_multiloc: { en: 'Text description 1' },
          location_description: 'Formville'
        })
        expect(rows[1]).to include({
          title_multiloc: { en: 'Form title 2' },
          body_multiloc: { en: 'Form description 2' },
          location_description: 'Textington'
        })
      end

      it 'merges custom fields successfully' do
        rows = service.send(:merge_pdf_rows, pdf_ideas)
        expect(rows[1][:custom_field_values]).to match_array({ select_field: 'yes', another_select_field: 'no' })
      end

      it 'ignores the text parsed ideas if the array lengths differ' do
        pdf_ideas[:text_parsed_ideas].pop
        rows = service.send(:merge_pdf_rows, pdf_ideas)
        expect(rows[0]).not_to include({
          body_multiloc: { en: 'Text description 1' }
        })
        expect(rows[1]).not_to include({
          location_description: 'Textington'
        })
      end
    end

    describe 'parse_pdf' do
      it 'ignores errors from the plain text service' do
        form_parser_output = [{
          form_pages: [1],
          pdf_pages: [1],
          fields: {
            'Title' => 'My very good idea',
            'Description' => 'And this is the very good body'
          }
        }]
        expect_any_instance_of(BulkImportIdeas::GoogleFormParserService).to receive(:parse_pdf).and_return(form_parser_output)
        expect_any_instance_of(BulkImportIdeas::GoogleFormParserService).to receive(:raw_text_page_array).and_raise(BulkImportIdeas::Error.new('something'))

        file = create(:idea_import_file)
        expect(service.send(:parse_pdf_ideas, file)).to eq(
          { form_parsed_ideas: form_parser_output, text_parsed_ideas: [] }
        )
      end
    end

    describe 'clean_field_names' do
      it 'converts the fields for mapping to custom fields' do
        idea = {
          'Title (optional)' => 'This fine title',
          'Yes_1.23' => 'filled_checkbox'
        }
        cleaned_idea = service.send(:clean_field_names, idea)
        expect(cleaned_idea).to match_array([
          { name: 'Title', value: 'This fine title', type: 'field', page: nil, position: nil },
          { name: 'Yes', value: 'filled_checkbox', type: 'option', page: 1, position: 23 }
        ])
      end
    end

    describe 'process_custom_form_fields' do
      context 'maps parsed values onto actual form fields' do
        let(:idea) do
          [
            { name: 'Title', value: 'This fine title', type: 'field', page: nil, position: nil },
            { name: 'Description', value: 'A description', type: 'field', page: nil, position: nil },
            { name: 'Location', value: 'Somewhere', type: 'field', page: nil, position: nil },
            { name: 'A text field', value: 'Some text yeah', type: 'field', page: nil, position: nil },
            { name: 'Yes', value: 'filled_checkbox', type: 'option', page: 2, position: 53 },
            { name: 'This', value: 'filled_checkbox', type: 'option', page: 2, position: 74 },
            { name: 'That', value: 'filled_checkbox', type: 'option', page: 2, position: 76 },
            { name: 'Yes', value: 'filled_checkbox', type: 'option', page: 2, position: 92 },
            { name: 'No', value: 'filled_checkbox', type: 'option', page: 2, position: 95 },
            { name: 'Yes', value: 'filled_checkbox', type: 'option', page: 3, position: 26 },
            { name: 'Yes', value: 'filled_checkbox', type: 'option', page: 3, position: 46 },
            { name: 'No', value: 'filled_checkbox', type: 'option', page: 3, position: 68 }
          ]
        end
        let(:idea_row) { service.send(:process_custom_form_fields, idea, {}) }

        it 'converts core fields' do
          expect_any_instance_of(described_class).to receive(:import_form_data).and_return(pdf_form_data)
          expect(idea_row).to include({
            title_multiloc: { en: 'This fine title' },
            body_multiloc: { en: 'A description' },
            location_description: 'Somewhere'
          })
        end

        it 'converts custom fields' do
          expect_any_instance_of(described_class).to receive(:import_form_data).and_return(pdf_form_data)
          expect(idea_row[:custom_field_values]).to include({
            a_text_field: 'Some text yeah',
            select_field: 'yes',
            multiselect_field: %w[this that],
            another_select_field: 'yes'
          })
        end

        it 'can cope with multiple checkboxes with same values' do
          expect_any_instance_of(described_class).to receive(:import_form_data).and_return(pdf_form_data)
          expect(idea_row[:custom_field_values]).to include({
            select_field3: 'yes',
            select_field4: 'yes',
            select_field5: 'no'
          })
        end
      end
    end
  end

  def pdf_form_data
    {
      page_count: 3,
      fields: [
        { name: 'Title', type: 'field', input_type: 'text_multiloc', code: 'title_multiloc', key: 'title_multiloc', parent_key: nil, page: 1, position: 17 },
        { name: 'Description', type: 'field', input_type: 'html_multiloc', code: 'body_multiloc', key: 'body_multiloc', parent_key: nil, page: 1, position: 30 },
        { name: 'Location', type: 'field', input_type: 'text', code: 'location_description', key: 'location_description', parent_key: nil, page: 1, position: 74 },
        { name: 'A text field', type: 'field', input_type: 'text', code: nil, key: 'a_text_field', parent_key: nil, page: 2, position: 0 },
        { name: 'Number field', type: 'field', input_type: 'number', code: nil, key: 'number_field', parent_key: nil, page: 2, position: 19 },
        { name: 'Select field', type: 'field', input_type: 'select', code: nil, key: 'select_field', parent_key: nil, page: 2, position: 38 },
        { name: 'Yes', type: 'option', input_type: nil, code: nil, key: 'yes', parent_key: 'select_field', page: 2, position: 50 },
        { name: 'No', type: 'option', input_type: nil, code: nil, key: 'no', parent_key: 'select_field', page: 2, position: 52 },
        { name: 'Multi select field', type: 'field', input_type: 'multiselect', code: nil, key: 'multiselect_field', parent_key: nil, page: 2, position: 57 },
        { name: 'This', type: 'option', input_type: nil, code: nil, key: 'this', parent_key: 'multiselect_field', page: 2, position: 70 },
        { name: 'That', type: 'option', input_type: nil, code: nil, key: 'that', parent_key: 'multiselect_field', page: 2, position: 73 },
        { name: 'Another select field', type: 'field', input_type: 'select', code: nil, key: 'another_select_field', parent_key: nil, page: 2, position: 78 },
        { name: 'Yes', type: 'option', input_type: nil, code: nil, key: 'yes', parent_key: 'another_select_field', page: 2, position: 90 },
        { name: 'No', type: 'option', input_type: nil, code: nil, key: 'no', parent_key: 'another_select_field', page: 2, position: 92 },
        { name: 'Select field 3', type: 'field', input_type: 'select', code: nil, key: 'select_field3', parent_key: nil, page: 3, position: 10 },
        { name: 'Yes', type: 'option', input_type: nil, code: nil, key: 'yes', parent_key: 'select_field3', page: 3, position: 22 },
        { name: 'No', type: 'option', input_type: nil, code: nil, key: 'no', parent_key: 'select_field3', page: 3, position: 25 },
        { name: 'Select field 4', type: 'field', input_type: 'select', code: nil, key: 'select_field4', parent_key: nil, page: 3, position: 30 },
        { name: 'Yes', type: 'option', input_type: nil, code: nil, key: 'yes', parent_key: 'select_field4', page: 3, position: 42 },
        { name: 'No', type: 'option', input_type: nil, code: nil, key: 'no', parent_key: 'select_field4', page: 3, position: 45 },
        { name: 'Select field 5', type: 'field', input_type: 'select', code: nil, key: 'select_field5', parent_key: nil, page: 3, position: 50 },
        { name: 'Yes', type: 'option', input_type: nil, code: nil, key: 'yes', parent_key: 'select_field5', page: 3, position: 62 },
        { name: 'No', type: 'option', input_type: nil, code: nil, key: 'no', parent_key: 'select_field5', page: 3, position: 65 }
      ]
    }
  end
end
