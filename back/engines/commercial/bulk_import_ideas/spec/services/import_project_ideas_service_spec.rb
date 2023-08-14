# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportProjectIdeasService do
  let(:project) { create(:continuous_project) }
  let(:service) { described_class.new create(:admin), project.id, 'en' }

  describe 'generate_example_xlsx' do
    it 'produces an xlsx file with all the fields for a project' do
      xlsx = service.generate_example_xlsx
      expect(xlsx).not_to be_nil
      # TODO: Better tests for this
      # TODO: Test that phase only appears if timeline project
      # TODO: Test that all custom fields appear
    end
  end

  describe 'paper_docs_to_idea_rows' do
    before do
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      create(:custom_field, resource: custom_form, key: 'another_field', title_multiloc: { 'en' => 'Another field:' }, enabled: true)
      select_field = create(:custom_field, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Select field:' }, input_type: 'select', enabled: true)
      create(:custom_field_option, custom_field: select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
      create(:custom_field_option, custom_field: select_field, key: 'no', title_multiloc: { 'en' => 'No' })
      multiselect_field = create(:custom_field, resource: custom_form, key: 'multiselect_field', title_multiloc: { 'en' => 'Multi select field:' }, input_type: 'multiselect', enabled: true)
      create(:custom_field_option, custom_field: multiselect_field, key: 'this', title_multiloc: { 'en' => 'This' })
      create(:custom_field_option, custom_field: multiselect_field, key: 'that', title_multiloc: { 'en' => 'That' })
    end

    let(:docs) do
      [
        [
          { name: 'Name:', value: 'John Rambo', type: '', page: 1, x: 0.09, y: 1.16 },
          { name: 'Email:', value: 'john_rambo@gravy.com', type: '', page: 1, x: 0.09, y: 1.24 },
          { name: 'Title:', value: 'Free donuts for all', type: '', page: 1, x: 0.09, y: 1.34 },
          { name: 'Body:', value: 'Give them all donuts', type: '', page: 1, x: 0.09, y: 1.41 },
          { name: 'Yes', value: nil, type: 'filled_checkbox', page: 1, x: 0.11, y: 1.66 },
          { name: 'No', value: nil, type: 'filled_checkbox', page: 1, x: 0.45, y: 1.66 },
          { name: 'This', value: nil, type: 'filled_checkbox', page: 1, x: 0.11, y: 1.86 },
          { name: 'That', value: nil, type: 'filled_checkbox', page: 1, x: 0.45, y: 1.86 },
          { name: 'Another field:', value: 'Not much to say', type: '', page: 2, x: 0.09, y: 2.12 },
          { name: 'Ignored field', value: 'Ignored value', type: 'filled_checkbox', page: 2, x: 0.45, y: 2.23 }
        ],
        [
          { name: 'Name:', value: 'Ned Flanders', type: '', page: 1, x: 0.09, y: 1.16 },
          { name: 'Email:', value: 'ned@simpsons.com', type: '', page: 1, x: 0.09, y: 1.24 },
          { name: 'Title:', value: 'New Wrestling Arena needed', type: '', page: 1, x: 0.09, y: 1.34 },
          { name: 'Body:', value: 'I am convinced that if we do not get this we will be sad.', type: '', page: 1, x: 0.09, y: 1.41 },
          { name: 'Yes', value: nil, type: 'unfilled_checkbox', page: 1, x: 0.11, y: 1.66 },
          { name: 'No', value: nil, type: 'filled_checkbox', page: 1, x: 0.45, y: 1.66 },
          { name: 'This', value: nil, type: 'unfilled_checkbox', page: 1, x: 0.11, y: 1.86 },
          { name: 'That', value: nil, type: 'filled_checkbox', page: 1, x: 0.45, y: 1.86 },
          { name: 'Another field:', value: 'Something else', type: '', page: 2, x: 0.09, y: 2.12 },
          { name: 'Ignored option', value: nil, type: 'filled_checkbox', page: 2, x: 0.45, y: 2.23 }
        ]
      ]
    end

    it 'converts the output from GoogleFormParser into idea rows' do
      rows = service.paper_docs_to_idea_rows docs
      expect(rows.count).to eq 2
      expect(rows[0][:title_multiloc]).to eq({ en: 'Free donuts for all' })
      expect(rows[0][:body_multiloc]).to eq({ en: 'Give them all donuts' })
      expect(rows[0][:user_email]).to eq 'john_rambo@gravy.com'
      expect(rows[0][:user_name]).to eq 'John Rambo'
      expect(rows[0][:project_id]).to eq project.id
    end

    it 'converts text custom fields' do
      rows = service.paper_docs_to_idea_rows docs
      expect(rows.count).to eq 2
      expect(rows[0][:custom_field_values][:another_field]).to eq 'Not much to say'
      expect(rows[1][:custom_field_values][:another_field]).to eq 'Something else'
    end

    it 'converts single select custom fields and only uses the first checked value' do
      rows = service.paper_docs_to_idea_rows docs
      expect(rows.count).to eq 2
      expect(rows[0][:custom_field_values][:select_field]).to eq 'yes'
      expect(rows[1][:custom_field_values][:select_field]).to eq 'no'
    end

    it 'converts multi-select custom fields' do
      rows = service.paper_docs_to_idea_rows docs
      expect(rows.count).to eq 2
      expect(rows[0][:custom_field_values][:multiselect_field]).to match_array %w[this that]
      expect(rows[1][:custom_field_values][:multiselect_field]).to match_array ['that']
    end

    it 'ignores fields/options that it cannot find in the form' do
      # check that option name or field value does not appear in a text representation of the rows object
      rows = service.paper_docs_to_idea_rows docs
      expect(rows.count).to eq 2
      expect(rows.inspect).to include 'John Rambo'
      expect(rows.inspect).not_to include 'Ignored value'
      expect(rows.inspect).not_to include 'Ignored option'
    end
  end
end
