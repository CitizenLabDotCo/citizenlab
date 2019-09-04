FactoryBot.define do
  factory :poll_option, class: 'Polls::Option' do
  	question { create(:poll_question) }
    title_multiloc {{
      "en" => "one",
      "nl-BE" => "Een"
    }}
  end
end
