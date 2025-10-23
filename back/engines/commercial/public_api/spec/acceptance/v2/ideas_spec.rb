# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Posts' do
  explanation <<~DESC.squish
    Posts are written inputs created by citizens. These can be ideas, proposals, or survey responses.
  DESC

  include_context 'common_auth'

  before_all { create(:idea_status_proposed) }

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
  let!(:survey_timeline) do
    project = create(:project_with_active_native_survey_phase)
    create_list(
      :native_survey_response,
      2,
      created_at: '2020-01-01',
      project: project,
      creation_phase: project.phases.first
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
      enum: %w[idea survey],
      in: :query
    )

    context 'when the page size is smaller than the total number of ideas' do
      let(:page_size) { 2 }

      example_request 'List only the first ideas' do
        assert_status 200
        expect(json_response_body[:ideas].size).to eq(page_size)

        total_pages = (Idea.count.to_f / page_size).ceil
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
          expect(json_response_body[:ideas].pluck(:type)).to all eq 'survey'
        end
      end

      context 'ideas' do
        let(:type) { 'idea' }

        example_request 'List only ideas' do
          assert_status 200
          expect(json_response_body[:ideas].size).to eq(3)
          expect(json_response_body[:ideas].pluck(:type)).to all eq 'idea'
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

  post '/api/v2/ideas' do
    route_summary 'Create an idea'
    route_description <<~DESC.squish
      Create a new idea in an active project phase. The project must have an active ideation 
      or native survey phase to accept new ideas.
    DESC

    parameter :project_id, 'The unique ID of the project where the idea will be created', type: 'string', required: true
    parameter 'idea[title_multiloc]', 'The idea title in multiple languages (object with language codes as keys)', type: 'object', required: true
    parameter 'idea[body_multiloc]', 'The idea description in multiple languages (object with language codes as keys)', type: 'object', required: true
    parameter 'idea[location_description]', 'A textual description of the location', type: 'string', required: false
    parameter 'idea[proposed_budget]', 'The proposed budget for the idea', type: 'integer', required: false
    parameter 'idea[topic_ids]', 'Array of topic IDs to associate with the idea', type: 'array', required: false

    before do
      @project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      create(:idea_status_proposed) # Ensure default status exists
    end

    let(:project_id) { @project.id }
    let(:idea) do
      {
        title_multiloc: { 'en' => 'My great idea', 'nl' => 'Mijn geweldige idee' },
        body_multiloc: { 'en' => 'This is a detailed description of my idea', 'nl' => 'Dit is een gedetailleerde beschrijving van mijn idee' },
        location_description: 'City center',
        proposed_budget: 50000
      }
    end

    example_request 'Create a new idea successfully' do
      explanation 'Create a new idea in an active ideation phase. The idea will be published automatically.'
      
      assert_status 201
      expect(json_response_body[:idea]).to include({
        title: 'My great idea',
        project_id: project_id
      })
    end

    example 'Create idea without active phase fails' do
      inactive_project = create(:project)
      
      do_request(project_id: inactive_project.id)
      
      assert_status 422
      expect(json_response_body[:error]).to include('No active phase found')
    end

    example 'Create idea with invalid project fails' do
      do_request(project_id: 'invalid-id')
      
      assert_status 404
      expect(json_response_body[:error]).to include('Project not found')
    end

    example 'Create idea without required parameters fails' do
      do_request(project_id: project_id, idea: { title_multiloc: { 'en' => 'Title only' } })
      
      assert_status 422
      expect(json_response_body[:errors]).to be_present
    end
  end

  put '/api/v2/ideas/:idea_id' do
    route_summary 'Update an idea'
    route_description <<~DESC.squish
      Update an existing published idea. Only certain fields can be updated and the idea 
      must be in a state that allows modifications.
    DESC

    parameter :idea_id, 'The unique ID of the idea to update', type: 'string', required: true
    parameter 'idea[title_multiloc]', 'Updated idea title in multiple languages', type: 'object', required: false
    parameter 'idea[body_multiloc]', 'Updated idea description in multiple languages', type: 'object', required: false
    parameter 'idea[location_description]', 'Updated textual description of the location', type: 'string', required: false
    parameter 'idea[proposed_budget]', 'Updated proposed budget for the idea', type: 'integer', required: false
    parameter 'idea[custom_field_values]', 'Updated custom field values', type: 'object', required: false

    before do
      @project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      @existing_idea = create(:idea, 
        project: @project, 
        title_multiloc: { 'en' => 'Original Title', 'nl' => 'Oorspronkelijke Titel' },
        body_multiloc: { 'en' => 'Original description', 'nl' => 'Oorspronkelijke beschrijving' },
        publication_status: 'published'
      )
    end

    let(:idea_id) { @existing_idea.id }
    let(:idea) do
      {
        title_multiloc: { 'en' => 'Updated Amazing Idea', 'nl' => 'Bijgewerkt Geweldig Idee' },
        body_multiloc: { 'en' => 'This is an updated detailed description', 'nl' => 'Dit is een bijgewerkte gedetailleerde beschrijving' },
        location_description: 'Updated city center',
        proposed_budget: 85000,
        custom_field_values: { 'priority' => 'updated_high', 'category' => 'updated_infrastructure' }
      }
    end

    example_request 'Update an idea successfully' do
      explanation 'Update an existing published idea with new content and custom field values.'
      
      assert_status 200
      expect(json_response_body[:idea]).to include({
        title: 'Updated Amazing Idea',
        id: idea_id,
        proposed_budget: 85000
      })
      expect(json_response_body[:idea][:custom_field_values]).to include({
        'priority' => 'updated_high',
        'category' => 'updated_infrastructure'
      })
    end

    example 'Update non-existent idea fails' do
      do_request(idea_id: 'non-existent-id')
      
      assert_status 404
      expect(json_response_body[:error]).to include('Idea not found')
    end

    example 'Update with partial data succeeds' do
      partial_idea = { title_multiloc: { 'en' => 'Partially Updated Title' } }
      
      do_request(idea_id: idea_id, idea: partial_idea)
      
      assert_status 200
      expect(json_response_body[:idea][:title]).to eq 'Partially Updated Title'
    end
  end

  include_examples '/api/v2/.../deleted', :ideas
end
