# frozen_string_literal: true

FactoryBot.define do
  factory :poll_response, class: 'Polls::Response' do
    phase { create(:single_phase_poll_project).phases.first }
    user
  end
end
