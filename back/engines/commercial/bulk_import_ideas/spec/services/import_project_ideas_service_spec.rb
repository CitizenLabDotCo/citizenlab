# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportProjectIdeasService do
  let(:project) { create(:continuous_project) }
  let(:service) { described_class.new project.id, 'en' }

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
    let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
    let!(:another_field) { create(:custom_field, resource: custom_form, key: 'another_field', title_multiloc: { 'en' => 'Another field:' }, enabled: true) }

    it 'converts the output from GoogleFormParser into idea rows' do
      docs = [
        {
          'Name:' => { name: 'Name:', value: 'John Rambo', type: '', page: 1, x: 0.09, y: 1.16 },
          'Email:' => { name: 'Email:', value: 'john_rambo@gravy.com', type: '', page: 1, x: 0.09, y: 1.24 },
          'Title:' => { name: 'Title:', value: 'Free donuts for all', type: '', page: 1, x: 0.09, y: 1.34 },
          'Body:' => { name: 'Body:', value: 'Give them all donuts', type: '', page: 1, x: 0.09, y: 1.41 },
          'Yes' => { name: 'Yes', value: nil, type: 'filled_checkbox', page: 1, x: 0.11, y: 1.6600000000000001 },
          'No' => { name: 'No', value: nil, type: 'unfilled_checkbox', page: 1, x: 0.45, y: 1.6600000000000001 },
          'Another field:' => { name: 'Another field:', value: 'Not really got much to say', type: '', page: 2, x: 0.09, y: 2.12 }
        },
        {
          'Name:' => { name: 'Name:', value: 'Ned Flanders', type: '', page: 1, x: 0.09, y: 1.16 },
          'Email:' => { name: 'Email:', value: 'ned@simpsons.com', type: '', page: 1, x: 0.09, y: 1.24 },
          'Title:' => { name: 'Title:', value: 'New Wrestling Arena needed', type: '', page: 1, x: 0.09, y: 1.34 },
          'Body:' => { name: 'Body:', value: 'I am convinced that if we do not get this we will be sad.', type: '', page: 1, x: 0.09, y: 1.41 },
          'Yes' => { name: 'Yes', value: nil, type: 'unfilled_checkbox', page: 1, x: 0.11, y: 1.6600000000000001 },
          'No' => { name: 'No', value: nil, type: 'filled_checkbox', page: 1, x: 0.45, y: 1.6600000000000001 },
          'Another field:' => { name: 'Another field:', value: 'Not really got much to say', type: '', page: 2, x: 0.09, y: 2.12 }
        }
      ]

      rows = service.paper_docs_to_idea_rows docs

      expect(rows.count).to eq 2
      expect(rows[0][:title_multiloc]).to eq({ en: 'Free donuts for all' })
      expect(rows[0][:body_multiloc]).to eq({ en: 'Give them all donuts' })
      expect(rows[0][:user_email]).to eq 'john_rambo@gravy.com'
      expect(rows[0][:user_name]).to eq 'John Rambo'
      expect(rows[0][:project_id]).to eq project.id
      expect(rows[0][:custom_field_values]).to eq({ another_field: 'Not really got much to say' })
    end
  end
end
