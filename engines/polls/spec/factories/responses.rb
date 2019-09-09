FactoryBot.define do
  factory :poll_response, class: 'Polls::Response' do
    participation_context { create(:continuous_poll_project) }
    user
  end
end
