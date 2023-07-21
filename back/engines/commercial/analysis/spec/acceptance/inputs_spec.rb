# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Inputs' do
  explanation 'Inputs (ideas and survey responses) in the context of an analysis'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/analyses/:id/inputs' do
    with_options scope: :page, required: false do
      parameter :number, 'Page number (starts at 1)'
      parameter :size, 'Number of inputs per page'
    end

    with_options required: false do
      parameter :search, 'Filter by searching in title and body'
      parameter :tag_id, 'Filter inputs by analysis_tags (union)', type: :array
      parameter :'author_custom_<uuid>_from', 'Filter by custom field value of the author for numerical or date fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>_to', 'Filter by custom field value of the author for numerical or date fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>', 'Filter by custom field value of the author, for select and multi-select fields (union). Replace <uuid> with the custom_field id', type: :array
      parameter :published_at_from, 'Filter by input publication date, after or equal to', type: :date
      parameter :published_at_to, 'Filter by input publication date, before or equal to', type: :date
      parameter :reactions_from, 'Filter by number of reactions on the input, larger than or equal to', type: :integer
      parameter :reactions_to, 'Filter by number of reactions on the input, smaller than or equal to', type: :integer
      parameter :votes_from, 'Filter by number of votes on the input, larger than or equal to', type: :integer
      parameter :votes_to, 'Filter by number of votes on the input, smaller than or equal to', type: :integer
      parameter :comments_from, 'Filter by number of comments on the input, larger than or equal to', type: :integer
      parameter :comments_to, 'Filter by number of comments on the input, smaller than or equal to', type: :integer
    end

    let_it_be(:analysis) { create(:analysis) }
    let_it_be(:id) { analysis.id }
    let_it_be(:ideas) { create_list(:idea, 5, project: analysis.source_project) }

    context 'when visitor' do
      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end

    context 'when resident' do
      before { resident_header_token }

      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'lists all inputs in the analysis' do
        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to match_array(ideas.pluck(:id))
        expect(json_response_body[:included].pluck(:id)).to include(*ideas.pluck(:id))
      end

      example 'supports text search', document: false do
        idea = create(:idea, title_multiloc: { en: 'Love & Peace' }, project: analysis.source_project)
        do_request(search: 'peace')
        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to eq([idea.id])
      end

      example 'supports published_at_to filter', document: false do
        idea = create(:idea, project: analysis.source_project, published_at: '2000-01-01')
        do_request(published_at_to: '2001-01-01')
        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to eq([idea.id])
      end
    end
  end
end
