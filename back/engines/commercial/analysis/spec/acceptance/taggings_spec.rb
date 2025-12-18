# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Taggings' do
  explanation 'A tagging represents the association between a tag and an input, in the context of an analysis'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/analyses/:analysis_id/taggings' do
    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let!(:taggings) { create_list(:tagging, 3, tag: create(:tag, analysis: analysis)) }
    let!(:other_tagging) { create(:tag) }

    example_request 'List all taggings' do
      expect(status).to eq(200)
      expect(response_data.pluck(:id)).to match_array(taggings.pluck(:id))
      expect(response_data.dig(0, :relationships)).to match({
        tag: {
          data: {
            type: 'tag',
            id: kind_of(String)
          }
        },
        input: {
          data: {
            type: 'analysis_input',
            id: kind_of(String)
          }
        }
      })
    end
  end

  post 'web_api/v1/analyses/:analysis_id/taggings' do
    with_options scope: :tagging do
      parameter :tag_id, 'The ID of the tag to associate the input with', required: true
      parameter :input_id, 'The ID of the tag to associate the tag with', required: true
    end
    ValidationErrorHelper.new.error_fields(self, Analysis::Tagging)

    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let(:input_id) { create(:idea, project: analysis.project).id }
    let(:tag_id) { create(:tag, analysis: analysis).id }

    example_request 'Create a tagging' do
      expect(response_status).to eq 201
      expect(response_data.dig(:relationships, :tag, :data, :id)).to eq tag_id
      expect(response_data.dig(:relationships, :input, :data, :id)).to eq input_id
    end
  end

  delete 'web_api/v1/analyses/:analysis_id/taggings/:id' do
    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let!(:tagging) { create(:tagging, tag: create(:tag, analysis: analysis)) }
    let(:id) { tagging.id }

    example 'Delete a tagging' do
      expect { do_request }.to change(Analysis::Tagging, :count).from(1).to(0)
      expect(response_status).to eq 200
      expect { Analysis::Tagging.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  post 'web_api/v1/analyses/:analysis_id/taggings/bulk_create' do
    parameter :tag_id, 'The ID of the tag to associate the input with', required: true
    parameter :filters, 'The filters to select the inputs to associate the tag with', required: true

    ValidationErrorHelper.new.error_fields(self, Analysis::Tagging)

    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let!(:inputs) { create_list(:idea, 3, project: analysis.project) }

    example 'Bulk create taggings' do
      tag_id = create(:tag, analysis: analysis).id
      idea = create(:idea, project: analysis.project, title_multiloc: {
        'en' => 'My idea'
      })
      idea2 = create(:idea, project: analysis.project, title_multiloc: {
        'en' => 'My idea is great'
      })
      create(:tagging, input: idea2, tag_id: tag_id)
      do_request(tag_id: tag_id, filters: { search: 'My idea' })
      expect(response_status).to eq 201
      expect(Analysis::Tagging.count).to eq 2
      expect(Analysis::Tagging.pluck(:tag_id)).to all(eq(tag_id))
      expect(Analysis::Tagging.pluck(:input_id)).to contain_exactly(idea.id, idea2.id)
    end
  end
end
