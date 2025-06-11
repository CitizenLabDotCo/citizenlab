# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Events' do
  explanation 'Events organized in the city, related to a project.'

  header 'Content-Type', 'application/json'

  before_all do
    @project = create(:project)
    @project2 = create(:project)
    @events = create_list(:event, 2, project: @project, online_link: 'https://example.com', start_at: '2017-05-01', end_at: '2017-05-02')
    @other_events = create_list(:event, 2, project: @project2, start_at: '2017-05-01', end_at: '2017-05-02')
  end

  get 'web_api/v1/events' do
    parameter :project_ids, 'The ids of the project to filter events by', type: :array
    parameter :static_page_id, 'The id of the static page that shows events linked by projects', type: :string
    parameter :start_at_lt, 'Filter by maximum start at', type: :string
    parameter :start_at_gteq, 'Filter by minimum start at', type: :string
    parameter :project_publication_statuses, 'The publication statuses of the project to filter events by', type: :array
    parameter :ongoing_during, <<~DESC, required: false, type: :string
      Filter events by date range. Only returns events that are ongoing during the 
      specified date range, meaning events that overlap with the given range. The date 
      range should be provided as a string in the format "[<start_date>,<end_date>]", 
      where <start_date> and <end_date> are ISO 8601 dates. 'null' can be used for 
      open-ended ranges.
    DESC

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

        user_attendances = response_data.map do |event_data|
          event_data.dig(:relationships, :user_attendance, :data)
        end
        # User attendances are always nil for visitors as they cannot register to
        # events.
        expect(user_attendances).to all(be_nil)
      end
    end

    context 'when filtering by ongoing_during' do
      let!(:event1) do
        create(:event, start_at: '2020-12-31T23:00:00Z', end_at: '2021-01-01T01:00:00Z')
      end

      let!(:event2) do
        create(:event, start_at: '2021-12-31T23:00:00Z', end_at: '2022-01-01T02:00:00Z')
      end

      example 'List events that overlap with the given range' do
        do_request(ongoing_during: '[2020-12-31T00:00:00Z,2020-12-31T23:59:59Z]')
        expect(response_ids).to match_array [event1.id]
      end

      example 'List events that overlap with the given range (right open-ended)', document: false do
        do_request(ongoing_during: '[2020-12-31,null]')
        expect(response_ids).to match_array [event1.id, event2.id]
      end

      example 'List events that overlap with the given range (left open-ended)', document: false do
        do_request(ongoing_during: '[null,2021-06-01]')
        expect(response_data.size).to eq(5)
      end

      example 'List events that overlap with the given range (both open-ended)', document: false do
        do_request(ongoing_during: '[null,null]')
        expect(response_data.size).to eq(Event.count)
      end
    end

    context 'when the user registered to some events' do
      before { header_token_for(user) }

      let(:user) { create(:user) }
      let!(:user_attendances) do
        @events.map { |event| create(:event_attendance, event: event, attendee: user) }
      end

      example_request <<~DESC, document: false do
        user_attendance relationships reference the user attendances
      DESC
        expected_attendance_ids = user_attendances.to_h do |attendance|
          [attendance.event_id, attendance.id]
        end

        actual_attendance_ids = response_data.to_h do |event_data|
          [
            event_data[:id],
            event_data.dig(:relationships, :user_attendance, :data, :id)
          ]
        end.compact

        expect(actual_attendance_ids).to eq expected_attendance_ids
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

  get 'web_api/v1/events/:id/attendees_xlsx' do
    let(:event) { @events.first }
    let(:id) { event.id }

    context 'as a regular user' do
      before { header_token_for(create(:user)) }

      example_request '[Unauthorized] Get xlsx of attendees of an event', document: false do
        expect(status).to eq 401
      end
    end

    context 'as an admin' do
      before do
        @admin = create(:admin)
        header_token_for(@admin)
      end

      example_request 'Get xlsx of attendees of an event' do
        expect(status).to eq 200
        expect(response_headers['Content-Type']).to include('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        expect(response_headers['Content-Disposition']).to include('attendees.xlsx')
      end

      example 'Get xlsx of attendees of an event successfully translates column headers', document: false do
        fixtures = YAML.load_file(Rails.root.join('spec/fixtures/locales/fr-FR.yml'))
        french_column_headers = fixtures['fr']['xlsx_export']['column_headers']
        @admin.update!(locale: 'fr-FR')

        do_request
        expect(status).to eq 200

        workbook = RubyXL::Parser.parse_buffer(response_body)
        header_row = workbook.worksheets[0][0].cells.map(&:value)

        expect(header_row).to match_array([
          french_column_headers['first_name'],
          french_column_headers['last_name'],
          french_column_headers['email'],
          french_column_headers['registration_completed_at']
        ])
      end
    end

    context 'as a project moderator' do
      before do
        header 'Content-Type', 'application/json'
        @user = create(:user, roles: [{ type: 'project_moderator', project_id: event.project.id }])
        header_token_for @user
      end

      example_request 'Get xlsx of attendees of event in project the user moderates' do
        expect(status).to eq 200
        expect(response_headers['Content-Type']).to include('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        expect(response_headers['Content-Disposition']).to include('attendees.xlsx')
      end

      example '[Unauthorized] Get xlsx of attendees of event in project the user does NOT moderate', document: false do
        do_request(id: @other_events.first.id)
        expect(status).to eq 401
      end
    end
  end

  get 'web_api/v1/events/:id' do
    let(:event) { @events.first }
    let(:id) { event.id }

    example_request 'Get one event by id' do
      expect(status).to eq 200
      expect(response_data.with_indifferent_access).to include(
        id: event.id,
        type: 'event',
        attributes: {
          title_multiloc: event.title_multiloc,
          description_multiloc: event.description_multiloc,
          address_1: event.address_1,
          address_2_multiloc: event.address_2_multiloc,
          attend_button_multiloc: event.attend_button_multiloc,
          using_url: event.using_url,
          location_multiloc: event.location_multiloc,
          location_point_geojson: event.location_point_geojson,
          start_at: event.start_at.iso8601(3),
          end_at: event.end_at.iso8601(3),
          created_at: event.created_at.iso8601(3),
          updated_at: event.updated_at.iso8601(3),
          attendees_count: event.attendees_count,
          maximum_attendees: event.maximum_attendees,
          online_link: event.online_link
        }
      )
    end

    context 'when the user registered to the event' do
      before { header_token_for(user) }

      let(:user) { create(:user) }
      let!(:user_attendance) do
        create(:event_attendance, event: event, attendee: user)
      end

      example_request <<~DESC, document: false do
        user_attendance relationship references the user attendance
      DESC
        expect(
          response_data.dig(:relationships, :user_attendance, :data, :id)
        ).to eq user_attendance.id
      end
    end
  end

  get 'web_api/v1/events/:id.ics' do
    let(:event) { @events.first }
    let(:id) { event.id }

    example_request 'Get one event by id in ics format' do
      expect(status).to eq 200
      expect(response_headers['Content-Type']).to include('text/calendar')
      expect(response_body.scan('BEGIN:VEVENT').count).to eq(1)
      expect(response_body).to satisfy do |body|
        event.title_multiloc.values.any? { |title| body.include?(title) }
      end
    end
  end

  context 'when admin' do
    before { admin_header_token }

    post 'web_api/v1/projects/:project_id/events' do
      with_options scope: :event do
        with_options required: true do
          parameter :title_multiloc, 'The title of the event in multiple locales'
          parameter :start_at, 'The start datetime of the event'
          parameter :end_at, 'The end datetime of the event'
        end

        # Optional parameters
        parameter :description_multiloc, 'The description of the event in multiple languages. Supports basic HTML.'
        parameter :location_multiloc, 'The location of the event in text format, , in multiple languages. [DEPRECATED]'
        parameter :location_point_geojson, 'A GeoJSON point representing the event location.'
        parameter :address_1, 'A human-readable primary address for the event location.'
        parameter :address_2_multiloc, 'Additional address details, such as floor or room number, in multiple languages.'
        parameter :using_url, 'A URL to an external website where the event is hosted.'
        parameter :attend_button_multiloc, 'The text to display on the attend button, in multiple languages.'
        parameter :online_link, 'Link to the online event'
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
        let(:online_link) { event.online_link }

        example_request 'Create an event for a project' do
          assert_status 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
          expect(json_response.dig(:data, :attributes, :start_at)).to eq start_at.iso8601(3)
          expect(json_response.dig(:data, :attributes, :end_at)).to eq end_at.iso8601(3)
          expect(json_response.dig(:data, :attributes, :online_link)).to eq online_link
          expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
        end
      end

      describe do
        let(:project_id) { @project.id }
        let(:title_multiloc) { { 'en' => '' } }
        let(:start_at) { event.start_at }
        let(:end_at) { event.start_at - 1.day }
        let(:online_link) { 'Invalid' }

        example_request '[error] Create an invalid event' do
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:title_multiloc, 'blank')
          expect(json_response).to include_response_error(:start_at, 'after_end_at')
          expect(json_response).to include_response_error(:online_link, 'url')
        end
      end

      example 'Create an event with a location using location_multiloc parameter', document: false do
        address_1 = 'event-location'

        do_request(
          project_id: @project.id,
          event: {
            title_multiloc: event.title_multiloc,
            start_at: event.start_at,
            end_at: event.end_at,
            location_multiloc: { en: address_1 }
          }
        )

        expect(status).to eq 201
        expect(response_data.dig(:attributes, :location_multiloc, :en)).to eq(address_1)
        expect(response_data.dig(:attributes, :address_1)).to eq(address_1)

        event = Event.find(response_data[:id])
        expect(event.address_1).to eq(address_1)
      end

      example 'Create an event with a location using location_point_geojson parameter', document: false do
        geojson_point = { 'type' => 'Point', 'coordinates' => [10, 20] }

        do_request(
          project_id: @project.id,
          event: {
            title_multiloc: event.title_multiloc,
            start_at: event.start_at,
            end_at: event.end_at,
            location_point_geojson: geojson_point
          }
        )

        expect(status).to eq 201
        expect(response_data.dig(:attributes, :location_point_geojson).with_indifferent_access)
          .to eq(geojson_point)

        event = Event.find(response_data[:id])
        expect(event.location_point_geojson).to eq(geojson_point)
        expect(event.location_point.coordinates).to eq(geojson_point['coordinates'])
      end

      example 'Create an event with a location using address_1 and address_2_multiloc parameters', document: false do
        address_1 = 'event-location'
        address_2_multiloc = { 'en' => 'event-location-details' }

        do_request(
          project_id: @project.id,
          event: {
            title_multiloc: event.title_multiloc,
            start_at: event.start_at,
            end_at: event.end_at,
            address_1: address_1,
            address_2_multiloc: address_2_multiloc
          }
        )

        expect(status).to eq 201
        # with deep indifferent access
        attributes = response_data[:attributes].with_indifferent_access
        expect(attributes[:address_1]).to eq(address_1)
        expect(attributes[:address_2_multiloc]).to eq(address_2_multiloc)

        event = Event.find(response_data[:id])
        expect(event.address_1).to eq(address_1)
        expect(event.address_2_multiloc).to eq(address_2_multiloc)
        expect(event.location_multiloc).to eq({})
      end
    end

    patch 'web_api/v1/events/:id' do
      with_options scope: :event do
        parameter :project_id, 'The id of the project this event belongs to'
        parameter :title_multiloc, 'The title of the event in multiple locales'
        parameter :description_multiloc, 'The description of the event in multiple languages. Supports basic HTML.'
        parameter :location_multiloc, 'The location of the event in text format, , in multiple languages. [DEPRECATED]'
        parameter :location_point_geojson, 'A GeoJSON point representing the event location.'
        parameter :address_1, 'A human-readable primary address for the event location.'
        parameter :address_2_multiloc, 'Additional address details, such as floor or room number, in multiple languages.'
        parameter :start_at, 'The start datetime of the event'
        parameter :end_at, 'The end datetime of the event'
        parameter :using_url, 'A URL to an external website where the event is hosted.'
        parameter :attend_button_multiloc, 'The text to display on the attend button, in multiple languages.'
      end

      ValidationErrorHelper.new.error_fields(self, Event)

      let(:event) { create(:event, project: @project) }
      let(:id) { event.id }

      example 'Update an event' do
        address_1 = "#{event.address_1} (updated)"
        address_2_multiloc = event.address_2_multiloc.transform_values { |v| "#{v} (updated)" }

        do_request(event: {
          address_1: address_1,
          address_2_multiloc: address_2_multiloc
        })

        assert_status 200

        attributes = response_data[:attributes].with_indifferent_access
        expect(attributes[:address_1]).to eq(address_1)
        expect(attributes[:address_2_multiloc]).to eq(address_2_multiloc)
      end

      example 'Update event location using location_multiloc parameter', document: false do
        address_1 = 'event-location'
        location_multiloc = { en: address_1 }

        do_request(event: { location_multiloc: location_multiloc })

        expect(status).to eq 200
        expect(response_data.dig(:attributes, :location_multiloc)).to include(location_multiloc)
        expect(response_data.dig(:attributes, :address_1)).to eq(address_1)

        event.reload
        expect(event.address_1).to eq(address_1)
      end

      example 'Update event location using location_point_geojson parameter', document: false do
        geojson_point = { 'type' => 'Point', 'coordinates' => [10, 20] }

        expect(event.location_point).to be_nil # sanity check

        do_request(event: { location_point_geojson: geojson_point })

        expect(status).to eq 200
        expect(response_data.dig(:attributes, :location_point_geojson).with_indifferent_access)
          .to eq(geojson_point)

        event.reload
        expect(event.location_point_geojson).to eq(geojson_point)
        expect(event.location_point.coordinates).to eq(geojson_point['coordinates'])
      end

      example 'Remove event location_point_geojson', document: false do
        event.update!(location_point_geojson: { 'type' => 'Point', 'coordinates' => [10, 20] })

        do_request(event: { location_point_geojson: nil })

        expect(status).to eq 200
        expect(response_data.dig(:attributes, :location_point_geojson)).to be_nil

        event.reload
        expect(event.location_point_geojson).to be_nil
        expect(event.location_point).to be_nil
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

  get 'web_api/v1/users/:user_id/events' do
    route_summary 'List all events to which a user is registered'

    let_it_be(:user) { create(:user) }
    let_it_be(:user_id) { user.id }

    let_it_be(:user_events) do
      [@events.first, @other_events.first].tap do |events|
        events.each { |event| event.attendees << user }
      end
    end

    shared_examples 'authorized' do
      example_request 'List all events of a user' do
        expect(status).to eq 200
        expect(response_ids).to match_array user_events.map(&:id)
      end
    end

    shared_examples 'unauthorized' do
      example_request 'Unauthorized (401)', document: false do
        expect(status).to eq 401
      end
    end

    context 'when admin' do
      before { admin_header_token }

      include_examples 'authorized'
    end

    context "when 'user_id' corresponds to the current user" do
      before { header_token_for(user) }

      include_examples 'authorized'
    end

    context "when 'user_id' does not correspond to the current user" do
      before { resident_header_token }

      include_examples 'unauthorized'
    end

    context('when visitor') { include_examples 'unauthorized' }
  end
end
