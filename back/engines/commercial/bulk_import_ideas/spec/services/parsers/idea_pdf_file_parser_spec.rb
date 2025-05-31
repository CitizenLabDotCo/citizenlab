# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Parsers::IdeaPdfFileParser do
  let(:project) { create(:single_phase_ideation_project) }
  let(:service) { described_class.new create(:admin), 'en', project.phases.first&.id, false }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

  before do
    # Topics for project
    project.allowed_input_topics << create(:topic_economy)
    project.allowed_input_topics << create(:topic_waste)

    # Custom fields - will produce a PDF form with 2 pages
    create(:custom_field, resource: custom_form, key: 'a_text_field', title_multiloc: { 'en' => 'A text field' }, description_multiloc: { 'en' => 'A text field description' }, enabled: true)
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

  describe 'parse_file_async' do
    it 'creates jobs to process 5 ideas at a time' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_12.pdf').read
      expect do
        service.parse_file_async("data:application/pdf;base64,#{base_64_content}")
      end.to have_enqueued_job(BulkImportIdeas::IdeaImportJob).exactly(:twice)
    end
  end

  describe 'create_files' do
    it 'splits a 12 page PDF file into a file per idea based on the number of pages in the template (2)' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_12.pdf').read
      service.send(:create_files, "data:application/pdf;base64,#{base_64_content}")
      expect(BulkImportIdeas::IdeaImportFile.all.count).to eq 7
      expect(BulkImportIdeas::IdeaImportFile.all.pluck(:num_pages)).to match_array [2, 2, 2, 2, 2, 2, 12]
      expect(BulkImportIdeas::IdeaImportFile.where(parent: nil).pluck(:num_pages)).to eq [12]
    end

    it 'raises an error if a PDF file has too many pages (more than 100)' do
      base_64_content = Base64.encode64 Rails.root.join('engines/commercial/bulk_import_ideas/spec/fixtures/scan_128.pdf').read
      expect { service.send(:create_files, "data:application/pdf;base64,#{base_64_content}") }.to raise_error(
        an_instance_of(BulkImportIdeas::Error).and(having_attributes(key: 'bulk_import_maximum_pdf_pages_exceeded'))
      )
    end
  end

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
    let!(:import_file) { create(:idea_import_file) }
    let(:rows) { service.send(:ideas_to_idea_rows, pdf_ideas, import_file) }

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

    it 'does not return an email address if email does not validate' do
      ideas = [{
        pdf_pages: [1, 2],
        fields: { 'First name(s)' => 'John', 'Last name' => 'Rambo', 'Email address' => 'john_rambo.com', 'Permission' => 'X' }
      }]
      rows = service.send(:ideas_to_idea_rows, ideas, import_file)
      expect(rows[0][:user_consent]).to be true
      expect(rows[0][:user_email]).to be_nil
      expect(rows[0][:user_first_name]).to eq 'John'
      expect(rows[0][:user_last_name]).to eq 'Rambo'
    end

    it 'corrects the email if it has spaces in it' do
      ideas = [{
        pdf_pages: [1, 2],
        fields: { 'First name(s)' => 'John', 'Last name' => 'Rambo', 'Email address' => 'john  @rambo.com', 'Permission' => 'X' }
      }]
      rows = service.send(:ideas_to_idea_rows, ideas, import_file)
      expect(rows[0][:user_email]).to eq 'john@rambo.com'
    end

    it 'can convert a document in french' do
      service = described_class.new create(:admin), 'fr-FR', project.phases.first&.id, true
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
      rows = service.send(:ideas_to_idea_rows, ideas, import_file)

      expect(rows[0][:title_multiloc]).to eq({ 'fr-FR': 'Bonjour' })
      expect(rows[0][:body_multiloc]).to eq({ 'fr-FR': "Je suis un chien. J'aime les chats." })
      expect(rows[0][:user_email]).to eq 'jean@france.com'
      expect(rows[0][:user_first_name]).to eq 'Jean'
      expect(rows[0][:user_last_name]).to eq 'Rambo'
    end

    it 'can convert where the description is detected as the field name instead of the title' do
      ideas = [{
        pdf_pages: [1, 2],
        fields: {
          'Title' => 'Free donuts for all',
          'Description' => 'Give them all donuts',
          'A text field description' => 'Not much to say'
        }
      }]
      rows = service.send(:ideas_to_idea_rows, ideas, import_file)

      expect(rows.count).to eq 1
      expect(rows[0][:custom_field_values][:a_text_field]).to eq 'Not much to say'
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
      rows = service.send(:ideas_to_idea_rows, pdf_ideas, import_file)

      expect(rows[0][:user_email]).to eq 'john_rambo@gravy.com'
      expect(rows[0][:user_first_name]).to eq 'John'
      expect(rows[0][:user_last_name]).to eq 'Rambo'
    end
  end

  describe 'merge_parsed_ideas_into_idea_row' do
    let(:form_parsed_idea) do
      {
        pdf_pages: [1, 2],
        fields: {
          'Title' => 'Form title 2',
          'Description' => 'Form description 2',
          'A text field' => 'Something',
          'Select field' => 'Yes',
          'Another select field' => 'Yes',
          'Multi select field' => ['This']
        }
      }
    end

    let(:text_parsed_idea) do
      {
        pdf_pages: [1, 2],
        fields: {
          'Title' => 'Text title 2',
          'Description' => 'Text description 2',
          'Location' => 'Textington',
          'Select field' => nil,
          'Another select field' => 'No',
          'Multi select field' => ['That']
        }
      }
    end

    it 'merges both sources of core fields, prioritising those from the form parser' do
      row = service.send(:merge_parsed_ideas_into_idea_row, form_parsed_idea, text_parsed_idea, nil)
      expect(row).to include({
        title_multiloc: { en: 'Form title 2' },
        body_multiloc: { en: 'Form description 2' },
        location_description: 'Textington'
      })
    end

    it 'merges custom fields successfully and prefers the answers from the text parser' do
      row = service.send(:merge_parsed_ideas_into_idea_row, form_parsed_idea, text_parsed_idea, nil)
      expect(row[:custom_field_values]).to match({
        a_text_field: 'Something',
        select_field: 'yes',
        another_select_field: 'no',
        multiselect_field: %w[that this]
      })
    end

    it 'does not duplicate multiselect values where present in both' do
      form_parsed_idea[:fields]['Multi select field'] = %w[This That]
      row = service.send(:merge_parsed_ideas_into_idea_row, form_parsed_idea, text_parsed_idea, nil)
      expect(row[:custom_field_values][:multiselect_field]).to match %w[that this]
    end

    it 'uses text parser answers when no custom fields at all are found in form_parsed_idea' do
      form_parsed_idea[:fields].delete('A text field')
      form_parsed_idea[:fields].delete('Select field')
      form_parsed_idea[:fields].delete('Another select field')
      form_parsed_idea[:fields].delete('Multi select field')
      row = service.send(:merge_parsed_ideas_into_idea_row, form_parsed_idea, text_parsed_idea, nil)
      expect(row[:custom_field_values]).to match({
        another_select_field: 'no',
        multiselect_field: %w[that]
      })
    end
  end

  describe 'parse_rows' do
    it 'ignores errors from the plain text service' do
      form_parser_output = [{
        pdf_pages: [1],
        fields: {
          'Title' => 'My very good idea',
          'Description' => 'And this is the very good body'
        }
      }]
      file = create(:idea_import_file)

      expect_any_instance_of(BulkImportIdeas::Parsers::Pdf::IdeaGoogleFormParserService).to receive(:parse_pdf).and_return(form_parser_output)
      expect_any_instance_of(BulkImportIdeas::Parsers::Pdf::IdeaGoogleFormParserService).to receive(:raw_text_page_array).and_raise(BulkImportIdeas::Error.new('something'))
      expect(service).to receive(:merge_parsed_ideas_into_idea_row).with(form_parser_output, [], file)

      service.send(:parse_rows, file)
    end
  end

  describe 'structure_raw_fields' do
    it 'converts the fields for mapping to custom fields' do
      idea = {
        'Title (optional)' => 'This fine title',
        'Yes_1.3.23' => 'filled_checkbox',
        'No_3.12.46' => 'filled_checkbox',
        'No_12.24.35' => 'unfilled_checkbox'
      }
      cleaned_idea = service.send(:structure_raw_fields, idea)
      expect(cleaned_idea).to match_array([
        { name: 'Title', value: 'This fine title', type: 'field', page: nil, position: nil },
        { name: 'Yes', value: 'filled_checkbox', type: 'option', page: 1, position: 23 },
        { name: 'No', value: 'filled_checkbox', type: 'option', page: 3, position: 46 },
        { name: 'No', value: 'unfilled_checkbox', type: 'option', page: 12, position: 35 }
      ])
    end
  end

  describe 'process_custom_form_fields' do
    context 'maps parsed values onto actual form fields' do
      let(:pdf_form_data) do
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
        expect_any_instance_of(described_class).to receive(:template_data).and_return(pdf_form_data)
        expect(idea_row).to include({
          title_multiloc: { en: 'This fine title' },
          body_multiloc: { en: 'A description' },
          location_description: 'Somewhere'
        })
      end

      it 'converts custom fields' do
        expect_any_instance_of(described_class).to receive(:template_data).and_return(pdf_form_data)
        expect(idea_row[:custom_field_values]).to include({
          a_text_field: 'Some text yeah',
          select_field: 'yes',
          multiselect_field: %w[this that],
          another_select_field: 'yes'
        })
      end

      it 'can cope with multiple checkboxes with same values' do
        expect_any_instance_of(described_class).to receive(:template_data).and_return(pdf_form_data)
        expect(idea_row[:custom_field_values]).to include({
          select_field3: 'yes',
          select_field4: 'yes',
          select_field5: 'no'
        })
      end
    end

    context 'maps multiselect values correctly' do
      let(:pdf_form_data) do
        {
          page_count: 3,
          fields: [
            { name: 'Multi one', type: 'field', input_type: 'multiselect', code: nil, key: 'multi_one', parent_key: nil, page: 2, position: 63 },
            { name: 'Monkeys', type: 'option', input_type: nil, code: nil, key: 'monkeys', parent_key: 'multi_one', page: 2, position: 72 },
            { name: 'Cows', type: 'option', input_type: nil, code: nil, key: 'cows', parent_key: 'multi_one', page: 2, position: 74 },
            { name: 'Sparrows', type: 'option', input_type: nil, code: nil, key: 'sparrows', parent_key: 'multi_one', page: 2, position: 77 },
            { name: 'Another multi', type: 'field', input_type: 'multiselect', code: nil, key: 'another_multi', parent_key: nil, page: 3, position: 0 },
            { name: 'Monkeys', type: 'option', input_type: nil, code: nil, key: 'monkeys', parent_key: 'another_multi', page: 3, position: 9 },
            { name: 'Cows', type: 'option', input_type: nil, code: nil, key: 'cows', parent_key: 'another_multi', page: 3, position: 11 },
            { name: 'Sparrows', type: 'option', input_type: nil, code: nil, key: 'sparrows', parent_key: 'another_multi', page: 3, position: 14 },
            { name: 'Last multi', type: 'field', input_type: 'multiselect', code: nil, key: 'last_multi', parent_key: nil, page: 3, position: 19 },
            { name: 'Monkeys', type: 'option', input_type: nil, code: nil, key: 'monkeys', parent_key: 'last_multi', page: 3, position: 28 },
            { name: 'Cows', type: 'option', input_type: nil, code: nil, key: 'cows', parent_key: 'last_multi', page: 3, position: 30 },
            { name: 'Sparrows', type: 'option', input_type: nil, code: nil, key: 'sparrows', parent_key: 'last_multi', page: 3, position: 33 }
          ]
        }
      end

      it 'converts multiselect fields - independently for each idea' do
        expect_any_instance_of(BulkImportIdeas::Exporters::IdeaPdfFormExporter).to receive(:importer_data).and_return(pdf_form_data)
        idea1 = [
          { name: 'Monkeys', value: 'filled_checkbox', type: 'option', page: 2, position: 68 },
          { name: 'Cows', value: 'filled_checkbox', type: 'option', page: 2, position: 70 },
          { name: 'Sparrows', value: 'filled_checkbox', type: 'option', page: 2, position: 73 },
          { name: 'Monkeys', value: 'unfilled_checkbox', type: 'option', page: 3, position: 11 },
          { name: 'Cows', value: 'filled_checkbox', type: 'option', page: 3, position: 13 },
          { name: 'Sparrows', value: 'filled_checkbox', type: 'option', page: 3, position: 16 },
          { name: 'Monkeys', value: 'unfilled_checkbox', type: 'option', page: 3, position: 28 },
          { name: 'Cows', value: 'filled_checkbox', type: 'option', page: 3, position: 31 },
          { name: 'Sparrows', value: 'unfilled_checkbox', type: 'option', page: 3, position: 33 }
        ]
        idea2 = [
          { name: 'Monkeys', value: 'filled_checkbox', type: 'option', page: 2, position: 68 },
          { name: 'Cows', value: 'unfilled_checkbox', type: 'option', page: 2, position: 71 },
          { name: 'Sparrows', value: 'unfilled_checkbox', type: 'option', page: 2, position: 74 },
          { name: 'Monkeys', value: 'filled_checkbox', type: 'option', page: 3, position: 11 },
          { name: 'Cows', value: 'filled_checkbox', type: 'option', page: 3, position: 14 },
          { name: 'Sparrows', value: 'unfilled_checkbox', type: 'option', page: 3, position: 17 },
          { name: 'Monkeys', value: 'unfilled_checkbox', type: 'option', page: 3, position: 29 },
          { name: 'Cows', value: 'filled_checkbox', type: 'option', page: 3, position: 32 },
          { name: 'Sparrows', value: 'filled_checkbox', type: 'option', page: 3, position: 34 }
        ]
        idea_row1 = service.send(:process_custom_form_fields, idea1, {})
        expect(idea_row1[:custom_field_values]).to include({
          multi_one: %w[monkeys cows sparrows],
          another_multi: %w[cows sparrows],
          last_multi: %w[cows]
        })

        idea_row2 = service.send(:process_custom_form_fields, idea2, {})
        expect(idea_row2[:custom_field_values]).to include({
          multi_one: %w[monkeys],
          another_multi: %w[monkeys cows],
          last_multi: %w[cows sparrows]
        })
      end
    end
  end

  describe 'complete_page_range' do
    it 'returns the full range of page numbers from two arrays' do
      array1 = [1, 3, 4]
      array2 = [2, 6, 7]
      range = service.send(:complete_page_range, array1, array2)
      expect(range).to eq [1, 2, 3, 4, 5, 6, 7]

      array3 = [7, 10, 12]
      array4 = [7, 8, 9]
      range = service.send(:complete_page_range, array3, array4)
      expect(range).to eq [7, 8, 9, 10, 11, 12]
    end
  end

  describe 'process_field_value' do
    let(:form_fields) do
      [
        {
          name: 'Title',
          description: nil,
          type: 'field',
          input_type: 'text_multiloc',
          value: 'A modern childrens playground'
        },
        {
          name: 'Description',
          description: 'This is a description of the field that may be detected in the scanned text.',
          type: 'field',
          input_type: 'html_multiloc',
          value: 'This is a description of the field that may be detected in the scanned text. This is the text that we really want. This is the next field title'
        },
        {
          name: 'This is the next field title',
          description: nil,
          type: 'field',
          input_type: 'text'
        }
      ]
    end

    it 'removes text that is either in from description of the field or the title of the next field' do
      field = service.send(:process_field_value, form_fields[1], form_fields)
      expect(field[:value]).to eq 'This is the text that we really want.'
    end

    it 'removes moderator disclaimer text' do
      form_fields[1][:value] = '*This answer will only be shared with moderators, and not to the public. This is the text that we really want.'
      field = service.send(:process_field_value, form_fields[1], form_fields)
      expect(field[:value]).to eq 'This is the text that we really want.'
    end

    it 'does not remove text if the next field title has fewer than five words in it' do
      form_fields[1][:value] = 'This is the text that we really want. Four word field title'
      form_fields[2][:name] = 'Four word field title'
      field = service.send(:process_field_value, form_fields[1], form_fields)
      expect(field[:value]).to eq 'This is the text that we really want. Four word field title'
    end
  end

  describe 'fix_email_address' do
    it 'removes spaces from email addresses' do
      expect(service.send(:fix_email_address, 'john  @rambo.com')).to eq 'john@rambo.com'
    end

    it 'replaces commas with dots' do
      expect(service.send(:fix_email_address, 'bart,simpson@simpsons.com')).to eq 'bart.simpson@simpsons.com'
    end

    it 'fixes common suffixes' do
      expect(service.send(:fix_email_address, 'homer@simpsonscom')).to eq 'homer@simpsons.com'
      expect(service.send(:fix_email_address, 'homer@simpsonsco')).to eq 'homer@simpsons.co'
      expect(service.send(:fix_email_address, 'homer@simpsonsuk')).to eq 'homer@simpsons.uk'
      expect(service.send(:fix_email_address, 'homer@simpsonsfr')).to eq 'homer@simpsons.fr'
      expect(service.send(:fix_email_address, 'homer@simpsonscouk')).to eq 'homer@simpsons.co.uk'
    end

    it 'returns nil if it cannot correct the email address' do
      expect(service.send(:fix_email_address, 'john_rambo.com')).to be_nil
    end
  end
end
