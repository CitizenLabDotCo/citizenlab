# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WebApi::V1::Events::AttendancesController do
  let_it_be(:current_user) { create(:admin) }

  before do
    token = AuthToken::AuthToken.new(payload: current_user.to_token_payload).token
    request.headers['Authorization'] = "Bearer #{token}"
    request.headers['Content-Type'] = 'application/json'
  end

  describe '#create' do
    it 'runs the after_create side effect' do
      event = create(:event)
      side_fx = controller.send(:side_fx)

      expect(side_fx).to receive(:after_create) do |attendance, user|
        expect(attendance.attendee_id).to eq(current_user.id)
        expect(attendance.event_id).to eq(event.id)
        expect(user).to eq(current_user)
      end

      params = { event_id: event.id }
      post :create, params: params, format: :json
    end
  end

  describe '#destroy' do
    it 'runs the after_destroy side effect' do
      attendance = create(:event_attendance)
      side_fx = controller.send(:side_fx)

      expect(side_fx).to receive(:after_destroy).with(attendance, current_user)

      params = { id: attendance.id }
      delete :destroy, params: params, format: :json
    end
  end
end
