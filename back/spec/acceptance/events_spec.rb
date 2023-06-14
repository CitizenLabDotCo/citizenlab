# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Events' do
  explanation 'Events organized in the city, related to a project.'

  before do
    header 'Content-Type', 'application/json'
    @project = create(:project)
    @project2 = create(:project)
    @events = create_list(:event, 2, project: @project)
    @other_events = create_list(:event, 2, project: @project2)
  end

  get 'web_api/v1/events' do
    parameter :project_ids, 'The ids of the project to filter events by', type: :array
    parameter :static_page_id, 'The id of the static page that shows events linked by projects', type: :string
    parameter :start_at_lt, 'Filter by maximum start at', type: :string
    parameter :start_at_gteq, 'Filter by minimum start at', type: :string
    parameter :project_publication_statuses, 'The publication statuses of the project to filter events by', type: :array

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of events per page'
    end

    context 'passing project ids' do
      let(:project_ids) { [@project.id] }

      example_request 'List all events of a project' do
        assert_status 200
        expect(response_data.size).to eq 2
      end
    end

    context 'passing static page id' do
      let(:static_page_id) { create(:static_page, projects_filter_type: 'topics', topics: [topic]).id }

      let(:topic) { create(:topic) }

      before { @project.update!(topics: [topic]) }

      example_request 'List all events of a page' do
        assert_status 200
        expect(response_data.size).to eq 2
        expect(response_ids).to match_array(@project.events.pluck(:id))
      end
    end

    context 'not passing project ids' do
      example_request 'List all events' do
        assert_status 200
        expect(response_data.size).to eq 4
      end
    end

    context 'when admin' do
      before do
        admin_header_token
        @project3 = create(:project, { admin_publication_attributes: { publication_status: 'draft' } })
        @more_events = create_list(:event, 2, project: @project3)
      end

      context 'passing project publication statuses' do
        let(:project_publication_statuses) { ['published'] }

        example_request 'List only events of published projects' do
          assert_status 200
          expect(response_data.size).to eq 4
        end
      end

      context 'not passing project publication statuses' do
        example_request 'List all events' do
          assert_status 200
          expect(response_data.size).to eq 6
        end
      end
    end
  end

  get 'web_api/v1/events/:id' do
    let(:id) { @events.first.id }

    example_request 'Get one event by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @events.first.id
    end
  end

  context 'when admin' do
    before { admin_header_token }

    post 'web_api/v1/projects/:project_id/events' do
      with_options scope: :event do
        parameter :title_multiloc, 'The title of the event in multiple locales', required: true
        parameter :description_multiloc, 'The description of the event in multiple languages. Supports basic HTML.', required: false
        parameter :location_multiloc, 'The location of the event. Textual', required: false
        parameter :start_at, 'The start datetime of the event', required: true
        parameter :end_at, 'The end datetime of the event', required: true
      end
      ValidationErrorHelper.new.error_fields(self, Event)
      response_field :start_at, "Array containing objects with signature {error: 'after_end_at'}", scope: :errors

      let(:event) { build(:event) }

      describe do
        let(:project_id) { @project.id }
        let(:title_multiloc) { event.title_multiloc }
        let(:description_multiloc) { event.description_multiloc }
        let(:start_at) { event.start_at }
        let(:end_at) { event.end_at }

        example_request 'Create an event for a project' do
          assert_status 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
          expect(json_response.dig(:data, :attributes, :start_at)).to eq start_at.iso8601(3)
          expect(json_response.dig(:data, :attributes, :end_at)).to eq end_at.iso8601(3)
          expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
        end
      end

      describe do
        let(:project_id) { @project.id }
        let(:title_multiloc) { { 'en' => '' } }
        let(:start_at) { event.start_at }
        let(:end_at) { event.start_at - 1.day }

        example_request '[error] Create an invalid event' do
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:title_multiloc, 'blank')
          expect(json_response).to include_response_error(:start_at, 'after_end_at')
        end
      end
    end

    patch 'web_api/v1/events/:id' do
      with_options scope: :event do
        parameter :project_id, 'The id of the project this event belongs to'
        parameter :title_multiloc, 'The title of the event in multiple locales'
        parameter :description_multiloc, 'The description of the event in multiple languages. Supports basic HTML.'
        parameter :location_multiloc, 'The location of the event. Textual'
        parameter :start_at, 'The start datetime of the event'
        parameter :end_at, 'The end datetime of the event'
      end
      ValidationErrorHelper.new.error_fields(self, Event)

      let(:event) { create(:event, project: @project) }
      let(:id) { event.id }
      let(:location_multiloc) { build(:event).location_multiloc }

      example_request 'Update an event' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :location_multiloc).stringify_keys).to match location_multiloc
      end
    end

    delete 'web_api/v1/events/:id' do
      let(:event) { create(:event, project: @project) }
      let(:id) { event.id }
      example_request 'Delete a event' do
        assert_status 200
        expect { Event.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
