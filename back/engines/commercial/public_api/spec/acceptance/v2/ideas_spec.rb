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

  # 3 Ideas
  let!(:ideas) do
    create_list(:idea, 3, created_at: '2020-01-01').tap do |ideas|
      ideas.each do |idea|
        idea.update!(custom_field_values: {
          'audience_size' => rand(101...4000),
          'audience_type' => 'young people'
        })
      end
    end
  end

  # 2 surveys
  let!(:survey_continuous) { create(:native_survey_response, created_at: '2020-01-01') }
  let!(:survey_timeline) do
    timeline_project = create(:project_with_active_native_survey_phase)
    create(
      :native_survey_response,
      created_at: '2020-01-01',
      project: timeline_project,
      creation_phase: timeline_project.phases.first
    )
  end

  # TODO: How do we get the format etc of response fields out into the spec? This doesn't seem to work
  response_field :created_at, 'Date the resource was created at'

  get '/api/v2/ideas/' do
    route_summary 'List ideas'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the ideas in the platform, with the most recent
      ones appearing first.
    DESC

    include_context 'common_list_params'

    parameter(
      :author_id,
      'Filter by author ID',
      required: false,
      type: :string,
      in: :query
    )

    parameter(
      :project_id,
      'Filter by project ID',
      required: false,
      type: :string,
      in: :query
    )

    parameter(
      :topic_ids,
      'List only the ideas that have all of the specified topics',
      required: false,
      type: :array,
      items: { type: :string },
      in: :query
    )

    parameter(
      :type,
      'Filter by type of idea - idea or survey - returns both by default',
      required: false,
      type: :string,
      in: :query
    )

    context 'when the page size is smaller than the total number of ideas' do
      let(:page_size) { 2 }

      example_request 'List only the first ideas' do
        assert_status 200
        expect(json_response_body[:ideas].size).to eq(page_size)

        total_pages = ((ideas.size.to_f + surveys.size.to_f) / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    context 'when filtering by author id' do
      let(:author_id) { ideas.first.author_id }

      example_request 'List only the ideas of the specified user' do
        assert_status 200
        expect(json_response_body[:ideas].size).to eq(1)
        expect(json_response_body[:ideas].first[:author_id]).to eq(author_id)
      end
    end

    context 'when filtering by project id' do
      let(:project_id) { ideas.first.project_id }

      example_request 'List only the ideas of the specified project' do
        assert_status 200
        expect(json_response_body[:ideas].size).to eq(1)
        expect(json_response_body[:ideas].first[:project_id]).to eq(project_id)
      end
    end

    context 'when filtering by type' do
      context 'surveys' do
        let(:type) { 'survey' }

        example_request 'List only surveys' do
          assert_status 200
          expect(json_response_body[:ideas].size).to eq(2)
          expect(json_response_body[:ideas].pluck(:type)).to eq %w[survey survey]
        end
      end

      context 'ideas' do
        let(:type) { 'idea' }

        example_request 'List only ideas' do
          assert_status 200
          expect(json_response_body[:ideas].size).to eq(3)
          expect(json_response_body[:ideas].pluck(:type)).to eq %w[idea idea idea]
        end
      end
    end

    context 'when filtering by topic ids' do
      let(:idea) { create(:idea_with_topics, topics_count: 3) }
      let(:topics) { idea.topics.take(2) }
      let(:topic_ids) { topics.pluck(:id) }

      before do
        # This idea should not be returned because it only has one of the requested
        # topics.
        create(:idea, project_id: idea.project_id).topics << topics.first
      end

      example_request 'List only the ideas that have all of the specified topics' do
        assert_status 200
        expect(json_response_body[:ideas].size).to eq(1)
        expect(json_response_body[:ideas].pluck(:id)).to eq [idea.id]
      end
    end

    include_examples 'filtering_by_date', :idea, :created_at
    include_examples 'filtering_by_date', :idea, :updated_at
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

  include_examples '/api/v2/.../deleted', :ideas
end
