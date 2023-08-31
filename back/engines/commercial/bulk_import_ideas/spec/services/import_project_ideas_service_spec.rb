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

  describe 'pdf_to_idea_rows' do
    let(:docs) do
      [
        [
          { name: 'Full name', value: 'John Rambo', type: '', page: 1, x: 0.09, y: 1.16 },
          { name: 'Email address', value: 'john_rambo@gravy.com', type: '', page: 1, x: 0.09, y: 1.24 },
          { name: 'Title', value: 'Free donuts for all', type: '', page: 1, x: 0.09, y: 1.34 },
          { name: 'Description', value: 'Give them all donuts', type: '', page: 1, x: 0.09, y: 1.41 },
          { name: 'Yes', value: nil, type: 'filled_checkbox', page: 1, x: 0.11, y: 1.66 },
          { name: 'No', value: nil, type: 'filled_checkbox', page: 1, x: 0.45, y: 1.66 },
          { name: 'This', value: nil, type: 'filled_checkbox', page: 1, x: 0.11, y: 1.86 },
          { name: 'That', value: nil, type: 'filled_checkbox', page: 1, x: 0.45, y: 1.86 },
          { name: 'A text field (optional)', value: 'Not much to say', type: '', page: 2, x: 0.09, y: 2.12 },
          { name: 'Ignored field', value: 'Ignored value', type: 'filled_checkbox', page: 2, x: 0.45, y: 2.23 },
          { name: 'Yes', value: nil, type: 'unfilled_checkbox', page: 2, x: 0.11, y: 2.66 },
          { name: 'No', value: nil, type: 'filled_checkbox', page: 2, x: 0.45, y: 2.66 },
          { name: 'Number field', value: '22', type: '', page: 2, x: 0.11, y: 2.86 }
        ],
        [
          { name: 'Full name', value: 'Ned Flanders', type: '', page: 3, x: 0.09, y: 3.16 },
          { name: 'Email address', value: 'ned@simpsons.com', type: '', page: 3, x: 0.09, y: 3.24 },
          { name: 'Title', value: 'New Wrestling Arena needed', type: '', page: 3, x: 0.09, y: 3.34 },
          { name: 'Description', value: 'I am convinced that if we do not get this we will be sad.', type: '', page: 3, x: 0.09, y: 3.41 },
          { name: 'Location', value: 'Behind the sofa', type: '', page: 3, x: 0.11, y: 3.52 },
          { name: 'Yes', value: nil, type: 'unfilled_checkbox', page: 3, x: 0.11, y: 3.66 },
          { name: 'No', value: nil, type: 'filled_checkbox', page: 3, x: 0.45, y: 3.66 },
          { name: 'This', value: nil, type: 'unfilled_checkbox', page: 3, x: 0.11, y: 3.86 },
          { name: 'That', value: nil, type: 'filled_checkbox', page: 3, x: 0.45, y: 3.86 },
          { name: 'A text field (optional)', value: 'Something else', type: '', page: 4, x: 0.09, y: 4.12 },
          { name: 'Ignored option', value: nil, type: 'filled_checkbox', page: 4, x: 0.45, y: 4.23 },
          { name: 'Number field', value: '28', type: '', page: 4, x: 0.11, y: 4.86 }
        ]
      ]
    end
    let(:rows) { service.pdf_to_idea_rows docs }

    it 'converts the output from GoogleFormParser into idea rows' do
      expect(rows.count).to eq 2
      expect(rows[0][:title_multiloc]).to eq({ en: 'Free donuts for all' })
      expect(rows[0][:body_multiloc]).to eq({ en: 'Give them all donuts' })
      expect(rows[0][:project_id]).to eq project.id
      expect(rows[1][:location_description]).to eq 'Behind the sofa'
    end

    it 'includes user details when "Permissions" field is not present' do
      expect(rows[0][:user_email]).to eq 'john_rambo@gravy.com'
      expect(rows[0][:user_name]).to eq 'John Rambo'
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
      expect(rows[0][:pages]).to eq [1, 2]
      expect(rows[1][:pages]).to eq [3, 4]
    end

    it 'does not return an email if it does not validate' do
      docs = [[{ name: 'Full name', value: 'John Rambo' }, { name: 'Email address', value: 'john_rambo.com' }]]
      rows = service.pdf_to_idea_rows docs
      expect(rows[0].keys).not_to include :user_email
    end

    it 'can convert a document in french' do
      service = described_class.new create(:admin), project.id, 'fr-FR', nil
      docs = [[
        { name: 'Nom et prénom', value: 'Jean Rambo' },
        { name: 'Adresse e-mail', value: 'jean@france.com' },
        { name: 'Titre', value: 'Bonjour' },
        { name: 'Description', value: "Je suis un chien. J'aime les chats." }
      ]]
      rows = service.pdf_to_idea_rows docs

      expect(rows[0][:title_multiloc]).to eq({ 'fr-FR': 'Bonjour' })
      expect(rows[0][:body_multiloc]).to eq({ 'fr-FR': "Je suis un chien. J'aime les chats." })
      expect(rows[0][:user_email]).to eq 'jean@france.com'
      expect(rows[0][:user_name]).to eq 'Jean Rambo'
    end
  end

  describe 'xlsx_to_idea_rows' do
    let(:xlsx_array) do
      [
        {
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
      ]
    end
    let(:rows) { service.xlsx_to_idea_rows xlsx_array }

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
        image_url: 'https://images.com/image.png'
      })
    end

    it 'includes user details when "Permission" is not blank' do
      expect(rows[0]).to include({
        user_name: 'Bill Test',
        user_email: 'bill@citizenlab.co'
      })
    end

    it 'does not include user details when "Permission" is blank' do
      xlsx_array[0]['Permission'] = ''
      rows = service.xlsx_to_idea_rows xlsx_array
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
  end

  # describe 'pdf_raw_text_to_idea_rows' do
    # it 'can parse raw text into an idea row' do
    #   project = create(:continuous_project)

    #   custom_form = create(:custom_form, :with_default_fields, participation_context: project)
    #   create(:custom_field, resource: custom_form, key: 'a_new_field', title_multiloc: { 'en' => 'A NEW field' }, enabled: true)
    #   create(:custom_field, resource: custom_form, key: 'number_field', title_multiloc: { 'en' => 'Number field' }, input_type: 'number', enabled: true)
    #   select_field = create(:custom_field, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Select field' }, input_type: 'select', enabled: true)
    #   create(:custom_field_option, custom_field: select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
    #   create(:custom_field_option, custom_field: select_field, key: 'no', title_multiloc: { 'en' => 'No' })
    #   multiselect_field = create(:custom_field, resource: custom_form, key: 'multiselect_field', title_multiloc: { 'en' => 'Multi select field' }, input_type: 'multiselect', enabled: true)
    #   create(:custom_field_option, custom_field: multiselect_field, key: 'this', title_multiloc: { 'en' => 'This' })
    #   create(:custom_field_option, custom_field: multiselect_field, key: 'that', title_multiloc: { 'en' => 'That' })
    #   another_select_field = create(:custom_field, resource: custom_form, key: 'another_select_field', title_multiloc: { 'en' => 'Another select field' }, input_type: 'select', enabled: true)
    #   create(:custom_field_option, custom_field: another_select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
    #   create(:custom_field_option, custom_field: another_select_field, key: 'no', title_multiloc: { 'en' => 'No' })

    #   service = described_class.new create(:admin), project.id, 'en', nil

    #   text = "
    #     Title\n
    #     My very good idea\n
    #     Description\n
    #     would suggest building the\n
    #     new swimming Pool near the\n
    #     Shopping mall on Park Lane,\n
    #     It's easily accessible location\n
    #     with enough space\n
    #     an\n
    #     Location (optional)\n
    #     Dear shopping mall\n
    #     Your favourite name for a swimming pool (optional)\n
    #     *This answer will only be shared with moderators, and not to the public.\n
    #     The cool pool\n
    #     How much do you like pizza (optional)\n
    #     *This answer will only be shared with moderators, and not to the public.\n
    #     A lot\n
    #     ○ Not at all\n
    #     How much do you like burgers (optional)\n
    #     *This answer will only be shared with moderators, and not to the public.\n
    #     O A lot\n
    #     Not at all\n
    #   "

    #   idea = service.pdf_raw_text_to_idea_rows text

    #   expect(idea).not_to be_nil
    # end
  # end
end
