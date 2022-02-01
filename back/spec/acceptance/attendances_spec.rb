require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Attendance' do
  explanation 'Attendances are associations between events and users who will be present at the event'

  let(:json_response) { json_parse(response_body) }

  before do
    header 'Content-Type', 'application/json'
    @event = create :event
    @attendances = create_list :attendance, 2, event: @event
  end

  get 'web_api/v1/events/:event_id/attendances' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of attendances per page'
    end

    let(:event_id) { @event.id }

    example_request 'List all attendances of an event' do
      expect(status).to eq 200
      expect(json_response[:data].size).to eq 2
      expect(json_response.dig(:data, 0, :attributes, :created_at)).to be_present
    end
  end

  get 'web_api/v1/attendances/:id' do
    let(:id) { @attendances.first.id }

    example_request 'Get one event by id' do
      expect(status).to eq 200

      expect(json_response.dig(:data, :id)).to eq @attendances.first.id
      expect(json_response.dig(:data, :type)).to eq 'attendance'
      expect(json_response.dig(:data, :attributes, :created_at)).to be_present
      expect(json_response.dig(:data, :relationships)).to include(
        event: {
          data: { id: @event.id, type: 'event' }
        },
        user: {
          data: { id: @attendances.first.user_id, type: 'user' }
        }
      )
    end
  end

  context 'when authenticated as normal user' do
    before do
      @user = create :user
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"

      @event = create :event
    end

    post 'web_api/v1/events/:event_id/attendances' do
      ValidationErrorHelper.new.error_fields self, Attendance

      let(:event_id) { @event.id }
      let(:feedback) { build(:attendance) }

      example_request 'Create an attendance on an event' do
        expect(response_status).to eq 201
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq @user.id
        expect(json_response.dig(:data, :relationships, :event, :data, :id)).to eq event_id
        expect(@event.reload.attendances_count).to eq 1
      end
    end

    delete 'web_api/v1/attendances/:id' do
      let(:attendance) { create(:attendance, user: @user, event: @event) }
      let(:id) { attendance.id }
      example_request 'Delete an attendance from an event' do
        expect(response_status).to eq 200
        expect { Attendance.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(@event.reload.attendances_count).to eq 0
      end
    end
  end
end
