# frozen_string_literal: true

FactoryBot.define do
  factory :poll_response, class: 'Polls::Response' do
    participation_context { create(:single_phase_poll_project).phases.first }
    user
  end
end
