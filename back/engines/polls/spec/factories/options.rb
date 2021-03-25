FactoryBot.define do
  factory :poll_option, class: 'Polls::Option' do
  	question { create(:poll_question) }
    sequence(:title_multiloc) do |n|
      {
        "en" => "#{n}",
        "nl-BE" => "#{n}"
      }
    end
  end
end
