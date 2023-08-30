# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Inputs' do
  explanation 'Inputs (inputs and survey responses) in the context of an analysis'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/analyses/:id/inputs' do
    with_options scope: :page, required: false do
      parameter :number, 'Page number (starts at 1)'
      parameter :size, 'Number of inputs per page'
    end

    with_options required: false do
      parameter :search, 'Filter by searching in title and body'
      parameter :tag_ids, 'Filter inputs by analysis_tags (union)', type: :array
      parameter :'author_custom_<uuid>_from', 'Filter by custom field value of the author for numerical fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>_to', 'Filter by custom field value of the author for numerical fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>', 'Filter by custom field value of the author, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
      parameter :'input_custom_<uuid>_from', 'Filter by custom field value of the input for numerical fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'input_custom_<uuid>_to', 'Filter by custom field value of the input for numerical fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'input_custom_<uuid>', 'Filter by custom field value of the input, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
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
    let_it_be(:inputs) { create_list(:idea, 3, project: analysis.source_project) }

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
        expect(response_data.pluck(:id)).to match_array(inputs.pluck(:id))
        expect(response_data.dig(0, :type)).to eq 'analysis_input'
        expect(response_data.dig(0, :attributes)).to match({
          title_multiloc: { en: 'Plant more trees', 'nl-BE': 'Plant meer bomen' },
          body_multiloc: { en: '<p>It would improve the air quality!</p>', 'nl-BE': '<p>De luchtkwaliteit zou er gevoelig op vooruitgaan!</p>' },
          location_description: 'Some road',
          comments_count: 0,
          custom_field_values: {},
          dislikes_count: 0,
          likes_count: 0,
          published_at: kind_of(String),
          updated_at: kind_of(String),
          votes_count: 0
        })
        expect(response_data.dig(0, :relationships, :author, :data)).to match({
          type: 'user',
          id: kind_of(String)
        })
        expect(response_data.dig(0, :relationships, :idea, :data)).to match({
          type: 'idea',
          id: response_data.dig(0, :id)
        })
        expect(json_response_body[:included].pluck(:id)).to include(*inputs.map(&:author_id))
        expect(json_response_body[:meta]).to match({
          filtered_count: 3
        })
      end

      # We smoke test a few filters, more extensive coverage is taken care of by the filter service spec

      example 'supports text search', document: false do
        idea = create(:idea, title_multiloc: { en: 'Love & Peace' }, project: analysis.source_project)
        do_request(search: 'peace')
        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to eq([idea.id])
        expect(json_response_body[:meta]).to match({
          filtered_count: 1
        })
      end

      example 'supports published_at_to filter', document: false do
        idea = create(:idea, project: analysis.source_project, published_at: '2000-01-01')
        do_request(published_at_to: '2001-01-01')
        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to eq([idea.id])
      end

      example 'supports input_custom_uuid[] filter', document: false do
        custom_form = create(:custom_form, participation_context: analysis.source_project)
        custom_field = create(:custom_field_select, :with_options, resource: custom_form)
        idea = create(:idea, project: analysis.source_project, custom_field_values: {
          custom_field.key => custom_field.options[0].key
        })
        do_request("input_custom_#{custom_field.id}" => [custom_field.options[0].key])
        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to eq([idea.id])
      end

      example 'supports tag_ids empty filtering', document: false do
        tagged_idea = create(:idea, project: analysis.source_project)
        tag = create(:tag, analysis: analysis)
        create(:tagging, input: tagged_idea, tag: tag)

        # What the front-end passes to its request framework
        #  -> `tag_ids: [null]`
        # How it gets encoded in url parameters
        #  -> `?tag_ids[]=`
        # How rails interprets this and passed it in the params object
        #  -> `tag_ids: [""]`

        # do_request bypasses first 2 layers, so we feed it the rails
        # interpretations immediately
        do_request('tag_ids' => [''])

        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to match_array(inputs.pluck(:id))
      end

      example 'supports custom_author_<uuid>[] filter', document: false do
        cf = create(:custom_field_number)
        author1 = create(:user, custom_field_values: { cf.key => 7 })
        author2 = create(:user, custom_field_values: { cf.key => 8 })
        idea1 = create(:idea, project: analysis.source_project, author: author1)
        _idea2 = create(:idea, project: analysis.source_project, author: author2)
        do_request("author_custom_#{cf.id}": ['7'])
        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to eq([idea1.id])
      end
    end
  end

  get 'web_api/v1/analyses/:analysis_id/inputs/:id' do
    before { admin_header_token }

    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let(:input) { create(:idea, project: analysis.project) }
    let(:id) { input.id }
    example_request 'get one inputs in the analysis by id' do
      expect(status).to eq(200)
    end
  end
end
