FactoryBot.define do
  factory :poll_question, class: 'Polls::Question' do
    participation_context { create(:continuous_poll_project) }
    title_multiloc {{
      "en" => "How many townhalls would you like to have?",
      "nl-BE" => "Hoeveel gemeentehuizen wil je?"
    }}

    trait :with_options do
      after :create do |question|
        create_list(:poll_option, 3, question: question)
      end
    end
  end
end
