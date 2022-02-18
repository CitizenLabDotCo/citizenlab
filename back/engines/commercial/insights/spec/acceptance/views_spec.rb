# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Views' do
  explanation 'Insights views'

  before { header 'Content-Type', 'application/json' }

  let!(:views) do
    nb_data_sources = [2, 2, 1]
    nb_data_sources.map { |n| create(:view, nb_data_sources: n) }
  end

  let(:json_response) { json_parse(response_body) }
  let(:assignment_service) { Insights::CategoryAssignmentsService.new }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end

    context 'when normal user' do
      before { user_header_token }

      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end
  end

  shared_examples 'unprocessable entity' do
    context 'when name is empty' do
      let(:name) { '' }

      example_request 'returns unprocessable-entity error', document: false do
        expect(status).to eq(422)
      end
    end
  end

  get 'web_api/v1/insights/views' do
    context 'when admin' do
      before { admin_header_token }

      example_request 'lists all views' do
        expect(status).to eq(200)
        expect(json_response[:data].pluck(:id)).to match_array(views.pluck(:id))

        data_source_ids = views.flat_map { |v| v.data_sources.pluck(:origin_id) }
        expect(json_response[:included].pluck(:id)).to match_array(data_source_ids)
      end
    end

    context 'when moderator' do
      let(:moderated_view) { views.first }
      let(:moderator) do
        moderated_projects = moderated_view.data_sources.pluck(:origin_id)
        # The user has moderators rights for only one data source of the second view
        # -> they should not be able to see the second view
        moderated_projects << views.second.data_sources.first.origin_id
        create(:project_moderator, project_ids: moderated_projects)
      end

      before { header_token_for(moderator) }

      example_request 'lists views of moderated projects' do
        expect(status).to eq(200)
        expect(json_response[:data].pluck(:id)).to eq [moderated_view.id]
      end
    end

    include_examples 'unauthorized requests'
  end

  get 'web_api/v1/insights/views/:id' do
    let(:view) { views.first }
    let(:id) { view.id }

    context 'when admin' do
      before { admin_header_token }

      let(:expected_response) do
        origin_ids = view.data_sources.pluck(:origin_id)

        {
          data: {
            id: view.id,
            type: 'view',
            attributes: {
              name: view.name,
              updated_at: anything
            },
            relationships: {
              data_sources: {
                data: origin_ids.map { |id| { id: id, type: 'project' } }
              }
            }
          },
          included: origin_ids.map { |id| hash_including(id: id) }
        }
      end

      example_request 'gets one view by id' do
        expect(status).to eq(200)
        expect(json_response).to match(expected_response)
      end
    end

    context 'when moderator' do
      let(:moderator) { create(:project_moderator, project_ids: view.data_sources.pluck(:origin_id)) }

      before { header_token_for(moderator) }

      example 'is authorized', document: false do
        do_request
        expect(status).to eq(200)
      end
    end

    include_examples 'unauthorized requests'
  end

  post 'web_api/v1/insights/views' do
    with_options scope: :view do
      parameter :name, 'The name of the view.', required: true
      # parameter :scope_id, 'The identifier of the project whose inputs will be analyzed.', required: true
      parameter :data_sources, '...', type: :array, items: {
        type: :object,
        required: [:origin_id],
        properties: {
          origin_id: { type: :string },
          origin_type: { type: :string, enum: ['project'] }
        }
      }
    end

    ValidationErrorHelper.new.error_fields(self, Insights::View)

    let(:name) { 'the-view' }
    let(:topics) { create_list(:topic, 2) }
    let(:ideas) { create_list(:idea, 2, topics: topics) }

    let(:origins) do
      [
        create(:project, allowed_input_topics: topics, ideas: ideas),
        create(:project)
      ]
    end

    let(:data_sources) do
      origins.map { |origin| { origin_id: origin.id } }
    end

    context 'when admin' do
      before { admin_header_token }

      let(:expected_response) do
        origin_ids = origins.map(&:id)

        {
          data: {
            id: anything,
            type: 'view',
            attributes: hash_including(name: name),
            relationships: {
              data_sources: {
                data: origin_ids.map { |id| { id: id, type: 'project' } }
              }
            }
          },
          included: origin_ids.map { |id| hash_including(id: id) }
        }
      end

      example_request 'creates a new view' do
        expect(status).to eq(201)
        expect(json_response).to match(expected_response)
      end

      example 'starts text-network-analysis tasks', document: false do
        expect { do_request }.to enqueue_job(Insights::CreateTnaTasksJob)
      end

      example 'imports topic assignments as category assignments', document: false do
        do_request
        expect(status).to eq(201)

        view = Insights::View.find(response_data[:id])

        # check imported categories
        expect(view.categories.pluck(:source_id)).to match_array(topics.pluck(:id))

        aggregate_failures 'check imported assignments' do
          assignments = view.category_assignments.includes(category: :source).to_a
          expect(assignments.count).to eq(4)

          ideas.each do |idea|
            topic_ids = assignments.select { |a| a.input_id == idea.id }
                                   .map { |a| a.category.source_id }
            expect(topic_ids).to match_array(topics.pluck(:id))
          end
        end
      end

      example 'marks existing inputs as already processed', document: false do
        do_request

        expect(status).to eq(201)

        view_id = response_data[:id]
        processed_input_ids = Insights::ProcessedFlag.where(view: view_id).pluck(:input_id)
        expect(ideas.pluck(:id)).to match_array(processed_input_ids)
      end

      include_examples 'unprocessable entity'
    end

    context 'when moderator' do
      let(:moderator) { create(:project_moderator, project_ids: origins.pluck(:id)) }

      before { header_token_for(moderator) }

      example 'is authorized', document: false do
        do_request
        expect(status).to eq(201)
      end
    end

    include_examples 'unauthorized requests'
  end

  patch 'web_api/v1/insights/views/:id' do
    with_options scope: :view do
      parameter :name, 'The name of the view.', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Insights::View)

    let(:view) { views.first }

    let(:id) { view.id }
    let(:previous_name) { view.name }
    let(:name) { 'Da view' }

    context 'when admin' do
      before { admin_header_token }

      let(:expected_response) do
        origin_ids = view.data_sources.pluck(:origin_id)

        {
          data: {
            id: anything,
            type: 'view',
            attributes: hash_including(name: name),
            relationships: {
              data_sources: {
                data: origin_ids.map { |id| { id: id, type: 'project' } }
              }
            }
          },
          included: origin_ids.map { |id| hash_including(id: id) }
        }
      end

      example_request 'updates a view' do
        expect(name).not_to eq(previous_name) # making sure we didn't reuse the same name by mistake
        expect(status).to eq(200)
        expect(json_response).to match(expected_response)
      end

      include_examples 'unprocessable entity'
    end

    context 'when moderator' do
      let(:moderator) { create(:project_moderator, project_ids: view.data_sources.pluck(:origin_id)) }

      before { header_token_for(moderator) }

      example 'is authorized', document: false do
        do_request
        expect(status).to eq(200)
      end
    end

    include_examples 'unauthorized requests'
  end

  delete 'web_api/v1/insights/views/:id' do
    let(:view) { views.first }
    let(:id) { view.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'deletes a view' do
        expect(status).to eq(200)
        expect { view.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when moderator' do
      let(:moderator) { create(:project_moderator, project_ids: view.data_sources.pluck(:origin_id)) }

      before { header_token_for(moderator) }

      example 'is authorized', document: false do
        do_request
        expect(status).to eq(200)
      end
    end

    include_examples 'unauthorized requests'
  end
end
