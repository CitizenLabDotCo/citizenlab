# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Event attendances' do
  explanation 'Attendances represent the fact that a user is registered to an event.'

  get 'web_api/v1/events/:event_id/attendances' do
    let_it_be(:event) { create(:event) }
    let_it_be(:event_id) { event.id }
    let_it_be(:attendances) { create_list(:event_attendance, 2, event: event) }

    before_all do
      # Attendances that should not be returned
      create_list(:event_attendance, 2)
    end

    context 'when the user is not logged in' do
      example_request 'Listing fails', document: false do
        expect(status).to eq(401)
      end
    end

    context 'when the user is a regular user' do
      before { resident_header_token }

      example_request 'Listing fails', document: false do
        expect(status).to eq(401)
      end
    end

    context 'when the user is an admin' do
      before { admin_header_token }

      example_request 'Listing attendances of an event' do
        expect(status).to eq(200)
        expect(response_data.size).to eq 2
        expect(response_data.pluck(:id)).to match_array attendances.map(&:id)

        created_at_values = response_data.map { |item| item.dig(:attributes, :created_at) }
        expect(created_at_values).to eq created_at_values.sort
      end
    end
  end

  post 'web_api/v1/events/:event_id/attendances' do
    context 'when the user is not logged in' do
      let(:event_id) { create(:event).id }

      example_request 'Registration fails', document: false do
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

      example 'Registering oneself to an event twice fails', document: false do
        create(:event_attendance, event_id: event_id, attendee_id: user.id)
        do_request
        expect(status).to eq(422)
        expect(json_response_body)
          .to match(errors: ['Attendee is already registered to this event'])
      end
    end

    context 'when the user is an admin' do
      example_request 'Register another user to an event', pending: 'TODO'
    end
  end

  delete 'web_api/v1/event_attendances/:id' do
    let!(:attendance) { create(:event_attendance) }
    let(:id) { attendance.id }

    context 'when the user is not logged in' do
      example_request 'Unregistration fails', document: false do
        expect(status).to eq(401)
      end
    end

    context 'when the user is a regular user' do
      context 'when the user is the attendee' do
        before { header_token_for(attendance.attendee) }

        example_request 'Unregister oneself from an event' do
          expect(status).to eq(204)
          expect { attendance.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      context 'when the user is not the attendee' do
        before { header_token_for(create(:user)) }

        example_request 'Fails to unregister another user from an event', document: false do
          expect(status).to eq(401)
        end
      end
    end

    context 'when the user is an admin' do
      before { admin_header_token }

      example_request 'Unregister another user from an event' do
        expect(status).to eq(204)
        expect { attendance.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
