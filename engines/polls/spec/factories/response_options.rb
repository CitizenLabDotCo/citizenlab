FactoryBot.define do
  factory :poll_response_option, class: 'Polls::ResponseOption' do
    option { create(:poll_option) }
    response { create(:poll_response, participation_context: option.question.participation_context) }
  end
end
