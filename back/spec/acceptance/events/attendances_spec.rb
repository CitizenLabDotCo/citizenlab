# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Event attendances' do
  explanation 'Attendances represent the fact that a user is registered to an event.'

  post 'web_api/v1/events/:event_id/attendances' do
    context 'when the user is not logged in' do
      let(:event_id) { create(:event).id }

      example_request 'registration fails', document: false do
        expect(status).to eq(401)
      end
    end

    context 'when the user is a regular user' do
      let(:user) { create(:user) }
      let(:event_id) { create(:event).id }

      before { header_token_for(user) }

      example_request 'Register oneself to an event' do
        expect(status).to eq(201)
        expect(Events::Attendance.where(event_id: event_id, attendee_id: user.id)).to exist
        expect(response_data.dig(:relationships, :attendee, :data, :id)).to eq user.id
        expect(response_data.dig(:relationships, :event, :data, :id)).to eq event_id
      end
    end
  end
end
