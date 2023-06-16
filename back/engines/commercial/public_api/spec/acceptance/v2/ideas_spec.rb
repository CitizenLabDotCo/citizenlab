# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Posts' do
  # NOTE: Same name as in initiatives_spec to combine the documentation into the same section
  explanation <<~DESC.squish
    Posts are written inputs created by citizens. These can be ideas, initiatives
    (proposals), or survey responses.
  DESC

  include_context 'common_auth'

  let!(:ideas) do
    create_list(:idea, 5, created_at: '2020-01-01').tap do |ideas|
      ideas.each do |idea|
        idea.update!(custom_field_values: {
          'audience_size' => rand(101...4000),
          'audience_type' => 'young people'
        })
      end
    end
  end

  # TODO: How do we get the format etc of response fields out into the spec? This doesn't seem to work
  response_field :created_at, 'Date the resource was created at'

  get '/api/v2/ideas/' do
    route_summary 'List ideas'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the ideas in the platform.
    DESC

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of ideas' do
      let(:page_size) { 2 }

      example_request 'List only the first ideas' do
        assert_status 200
        expect(json_response_body[:ideas].size).to eq(page_size)

        total_pages = (ideas.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    context "when filtering by 'created_at'" do
      let(:created_at) { '2022-05-01,2022-05-03' }

      let!(:idea) do
        ideas.first.tap { |idea| idea.update(created_at: '2022-05-02') }
      end

      example_request 'List only the ideas created between the specified dates' do
        assert_status 200
        expect(json_response_body[:ideas].pluck(:id)).to eq [idea.id]
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end

    context "when filtering by 'updated_at'" do
      let(:updated_at) { ',2023-01-31' }

      let!(:idea) do
        ideas.first.tap { |idea| idea.update(updated_at: '2023-01-01') }
      end

      example_request 'List only the ideas updated between the specified dates' do
        assert_status 200
        expect(json_response_body[:ideas].pluck(:id)).to eq [idea.id]
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end
  end

  get '/api/v2/ideas/:id' do
    route_summary 'Get idea'
    route_description 'Retrieve a single idea by its ID.'

    include_context 'common_item_params'

    let(:idea) { ideas.first }
    let(:id) { idea.id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      # Currently, the tenant locales are ["en", "fr-FR", "nl-NL"], while the factory
      # locales are ["en", "nl-BE"]. The following code aligns the two by replacing
      # the "nl-BE" locale with "nl-NL" in the idea.
      title = idea[:title_multiloc]
      title['nl-NL'] = title.delete 'nl-BE'
      idea.update(title_multiloc: title)
    end

    example_request 'Returns the idea in the default locale' do
      assert_status 200
      expect(json_response_body[:idea]).to include({ id: id })
    end

    context 'when requesting the idea in a specific locale' do
      let(:locale) { 'nl-NL' }

      example_request 'Returns the idea in the specified locale' do
        assert_status 200
        expect(json_response_body.dig(:idea, :title))
          .to eq idea.title_multiloc['nl-NL']
      end
    end
  end
end
