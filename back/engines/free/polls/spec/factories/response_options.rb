# frozen_string_literal: true

FactoryBot.define do
  factory :poll_response_option, class: 'Polls::ResponseOption' do
    option { create(:poll_option) }
    response { create(:poll_response, phase: option.question.phase) }
  end
end
