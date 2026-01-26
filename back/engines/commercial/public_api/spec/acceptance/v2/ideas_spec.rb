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
      'List only the ideas that have all of the specified input topics',
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
      let(:topics) { idea.input_topics.take(2) }
      let(:topic_ids) { topics.pluck(:id) }

      before do
        # This idea should not be returned because it only has one of the requested
        # topics.
        create(:idea, project_id: idea.project_id).input_topics << topics.first
      end

      example_request 'List only the ideas that have all of the specified topics' do
        assert_status 200
        expect(json_response_body[:ideas].size).to eq(1)
        expect(json_response_body[:ideas].pluck(:id)).to eq [idea.id]
      end
    end

    context 'when filtering by parent topic id' do
      let(:project) { create(:project) }
      let(:parent_topic) { create(:input_topic, project: project) }
      let(:child_topic) { create(:input_topic, project: project, parent: parent_topic) }
      let!(:idea_with_child) { create(:idea, project: project, input_topics: [child_topic]) }
      let(:topic_ids) { [parent_topic.id] }

      example_request 'List ideas with child topic when filtering by parent topic' do
        assert_status 200
        expect(json_response_body[:ideas].pluck(:id)).to include(idea_with_child.id)
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
    route_summary 'Create a new post'
    route_description <<~DESC.squish
      Create a new post. Posts can be created in projects with an ideation, proposal, or native survey phase. 
    DESC
    include_context 'common_auth'
    header 'Content-Type', 'application/json'

    with_options scope: :idea do
      parameter :project_id, 'The unique ID of the project where the input will be created', type: 'string', required: true
      parameter :title_multiloc, 'The input title in multiple languages', type: 'object', required: true
      parameter :body_multiloc, 'The input description in multiple languages', type: 'object', required: true
      parameter :assignee_id, 'The ID of the user to assign this input to', type: 'string', required: false
      parameter :idea_status_id, 'The ID of the status to assign to this input', type: 'string', required: false
      parameter :topic_ids, '[deprecated] Array of topic IDs to associate with the input', type: 'array', required: false
      parameter :input_topic_ids, 'Array of input topic IDs to associate with the input', type: 'array', required: false
      parameter :phase_ids, 'Array of phase IDs to associate with the input', type: 'array', required: false
    end

    before do
      @project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      create(:idea_status_proposed) # Ensure default status exists
    end

    let(:project_id) { @project.id }
    let(:phase) { create(:phase, project:) }
    let(:title_multiloc) { { 'en' => 'My great idea', 'nl-NL' => 'Mijn geweldige idee' } }
    let(:body_multiloc) { { 'en' => 'This is a detailed description of my idea', 'nl-NL' => 'Dit is een gedetailleerde beschrijving van mijn idee' } }
    let(:input_topic_ids) { create_list(:input_topic, 2, project: @project).map(&:id) }

    example_request 'Create a new idea successfully' do
      explanation 'Create a new idea in an active ideation phase. The idea will be published automatically.'

      do_request(publication_status: 'published')

      assert_status 201
      expect(json_response_body[:idea]).to include({
        title: 'My great idea',
        project_id: project_id,
        publication_status: 'published'
      })
      expect(Idea.find(json_response_body[:idea][:id]).input_topic_ids).to match_array(input_topic_ids)
    end
  end

  put '/api/v2/ideas/:idea_id' do
    route_summary 'Update a post'
    route_description <<~DESC.squish
      Update an existing post. Only certain fields can be updated and the input
      must be in a state that allows modifications.
    DESC
    include_context 'common_auth'
    header 'Content-Type', 'application/json'

    parameter :idea_id, 'The unique ID of the idea to update', type: 'string', required: true

    with_options scope: :idea do
      parameter :title_multiloc, 'Updated post title in multiple languages', type: 'object', required: false
      parameter :body_multiloc, 'Updated post description in multiple languages', type: 'object', required: false
      parameter :publication_status, 'The publication status of the input (draft, submitted, published)', type: 'string', required: false
      parameter :assignee_id, 'The ID of the user to assign this post to', type: 'string', required: false
      parameter :idea_status_id, 'The ID of the status to assign to this post', type: 'string', required: false
      parameter :topic_ids, '[deprecated] Array of topic IDs to associate with the input. Use `input_topic_ids` instead.', type: 'array', required: false
      parameter :input_topic_ids, 'Array of input topic IDs to associate with the input', type: 'array', required: false
      parameter :phase_ids, 'Array of phase IDs to associate with the input', type: 'array', required: false
    end

    before do
      @project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      @existing_idea = create(:idea,
        project: @project,
        title_multiloc: { 'en' => 'Original Title', 'nl-NL' => 'Oorspronkelijke Titel' },
        body_multiloc: { 'en' => 'Original description', 'nl-NL' => 'Oorspronkelijke beschrijving' },
        publication_status: 'published')
    end

    let(:idea_id) { @existing_idea.id }
    let(:title_multiloc) { { 'en' => 'Updated Amazing Idea', 'nl-NL' => 'Bijgewerkt Geweldig Idee' } }
    let(:body_multiloc) { { 'en' => 'This is an updated detailed description', 'nl-NL' => 'Dit is een bijgewerkte gedetailleerde beschrijving' } }
    let(:assignee_id) { nil }
    let(:idea_status_id) { nil }
    let(:phase_ids) { [] }

    example_request 'Update an idea successfully' do
      explanation 'Update an existing published idea with new content.'

      assert_status 200
      expect(json_response_body[:idea]).to include({
        title: 'Updated Amazing Idea',
        id: idea_id
      })
    end

    context 'when the idea does not exist' do
      example 'Update non-existent idea fails' do
        expect do
          do_request(idea_id: 'non-existent-id')
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when updating with partial data' do
      let(:title_multiloc) { { 'en' => 'Partially Updated Title' } }
      let(:body_multiloc) { nil }
      let(:assignee_id) { nil }
      let(:idea_status_id) { nil }
      let(:phase_ids) { nil }

      example 'Update with partial data succeeds' do
        explanation 'Update an existing idea with only some fields provided.'

        do_request

        assert_status 200
        expect(json_response_body[:idea][:title]).to eq 'Partially Updated Title'
      end
    end

    context 'when using the deprecated topic_ids parameter' do
      let(:topic_ids) { create_list(:input_topic, 2, project: @project).map(&:id) }

      example 'Update idea with deprecated topic_ids parameter' do
        do_request

        assert_status 200
        expect(@existing_idea.input_topics.pluck(:id)).to match_array(topic_ids)
      end
    end

    context 'when using the new input_topic_ids parameter' do
      let(:input_topic_ids) { create_list(:input_topic, 2, project: @project).map(&:id) }

      example 'Update idea with new input_topic_ids parameter' do
        do_request

        assert_status 200
        expect(@existing_idea.input_topics.pluck(:id)).to match_array(input_topic_ids)
      end
    end

    context 'when updating the project_id' do
      let(:other_project) { create(:project) }

      example 'Update idea with project_id has no effect' do
        original_project_id = @existing_idea.project_id
        do_request(idea: { project_id: other_project.id })

        assert_status 200
        expect(json_response_body[:idea][:project_id]).to eq(original_project_id)
      end
    end

    context 'when updating assignee' do
      before do
        # Create a user with moderation permissions for the project
        @assignee_user = create(:project_moderator, projects: [@project])
      end

      let(:assignee_id) { @assignee_user.id }
      let(:title_multiloc) { { 'en' => 'Updated Idea with Assignee' } }
      let(:body_multiloc) { nil }
      let(:idea_status_id) { nil }
      let(:phase_ids) { nil }

      example 'Update idea with assignee and topic succeeds' do
        explanation 'Update an existing idea with a new assignee and topic.'

        do_request

        assert_status 200
        expect(json_response_body[:idea]).to include({
          title: 'Updated Idea with Assignee',
          id: idea_id
        })
        expect(json_response_body[:idea][:assignee_id]).to eq(assignee_id)
      end
    end
  end

  include_examples '/api/v2/.../deleted', :ideas
end
