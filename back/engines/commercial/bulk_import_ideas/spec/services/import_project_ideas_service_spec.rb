# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportProjectIdeasService do
  let(:project) { create(:continuous_project) }
  let(:service) { described_class.new create(:admin), project.id, 'en', nil }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

  before do
    # Topics for project
    project.allowed_input_topics << create(:topic_economy)
    project.allowed_input_topics << create(:topic_waste)

    # Custom fields
    # custom_form = create(:custom_form, :with_default_fields, participation_context: project)
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
        'Full name',
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

  describe 'ideas_to_idea_rows' do
    let(:pdf_ideas) do
      [
        {
          pdf_pages: [1, 2],
          fields: {
            'Full name' => 'John Rambo',
            'Email address' => 'john_rambo@gravy.com',
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
            'Full name' => 'Ned Flanders',
            'Email address' => 'ned@simpsons.com',
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
    let(:rows) { service.ideas_to_idea_rows pdf_ideas }

    it 'converts the output from GoogleFormParser into idea rows' do
      expect(rows.count).to eq 2
      expect(rows[0][:title_multiloc]).to eq({ en: 'Free donuts for all' })
      expect(rows[0][:body_multiloc]).to eq({ en: 'Give them all donuts' })
      expect(rows[0][:project_id]).to eq project.id
      expect(rows[1][:location_description]).to eq 'Behind the sofa'
    end

    it 'includes user details when "Permissions" field is completed' do
      expect(rows[0][:user_email]).to eq 'john_rambo@gravy.com'
      expect(rows[0][:user_name]).to eq 'John Rambo'
    end

    it 'does not include user details when "Permissions" field is blank' do
      expect(rows[1][:user_email]).to be_nil
      expect(rows[1][:user_name]).to be_nil
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
      expect(rows.inspect).to include 'John Rambo'
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
        fields: { 'Full name' => 'John Rambo', 'Email address' => 'john_rambo.com' }
      }]
      rows = service.ideas_to_idea_rows ideas
      expect(rows[0].keys).not_to include :user_email
    end

    it 'can convert a document in french' do
      service = described_class.new create(:admin), project.id, 'fr-FR', nil
      ideas = [{
        pdf_pages: [1, 2],
        fields: {
          'Nom et prénom' => 'Jean Rambo',
          'Adresse e-mail' => 'jean@france.com',
          'Autorisation' => 'X',
          'Titre' => 'Bonjour',
          'Description' => "Je suis un chien. J'aime les chats."
        }
      }]
      rows = service.ideas_to_idea_rows ideas

      expect(rows[0][:title_multiloc]).to eq({ 'fr-FR': 'Bonjour' })
      expect(rows[0][:body_multiloc]).to eq({ 'fr-FR': "Je suis un chien. J'aime les chats." })
      expect(rows[0][:user_email]).to eq 'jean@france.com'
      expect(rows[0][:user_name]).to eq 'Jean Rambo'
    end

    it 'can parse select fields from option values' do
      ideas = [{
        pdf_pages: [1, 2],
        fields: {
          'Title' => 'Free donuts for all',
          'Description' => 'Give them all donuts',
          'Yes' => 'filled_checkbox',
          'This' => 'filled_checkbox',
          'That' => 'filled_checkbox'
        }
      }]
      rows = service.ideas_to_idea_rows ideas

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

    context 'xlsx specific fields' do
      let(:xlsx_ideas_array) do
        [
          {
            pdf_pages: [1],
            fields: {
              'Full name' => 'Bill Test',
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
      let(:rows) { service.ideas_to_idea_rows xlsx_ideas_array }

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
          user_name: 'Bill Test',
          user_email: 'bill@citizenlab.co'
        })
      end

      it 'does not include user details when "Permission" is blank' do
        xlsx_ideas_array[0][:fields]['Permission'] = ''
        rows = service.ideas_to_idea_rows xlsx_ideas_array

        expect(rows[0]).not_to include({
          user_name: 'Bill Test',
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
              'Full name' => '',
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
        idea_rows = service.ideas_to_idea_rows xlsx_ideas_array
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
            fields: { 'Title' => 'Form title 2', 'Description' => 'Form description 2' }
          }
        ],
        text_parsed_ideas: [
          {
            pdf_pages: [1, 2],
            fields: { 'Title' => 'Text title 1', 'Description' => 'Text description 1', 'Location' => 'Textville' }
          },
          {
            pdf_pages: [3, 4],
            fields: { 'Title' => 'Text title 2', 'Description' => 'Text description 2', 'Location' => 'Textington' }
          }
        ]
      }
    end

    it 'merges both sources, prioritising those from the form parser' do
      rows = service.merge_pdf_rows pdf_ideas
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

    it 'ignores the text parsed ideas if the array lengths differ' do
      pdf_ideas[:text_parsed_ideas].pop
      rows = service.merge_pdf_rows pdf_ideas
      expect(rows[0]).not_to include({
                                   body_multiloc: { en: 'Text description 1' },
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

      # TODO: open(file) does not work here
      expect(service.parse_pdf_ideas nil).to eq(
                                               { form_parser_output: form_parser_output, text_parser_output: [] }
                                             )
    end
  end
end
