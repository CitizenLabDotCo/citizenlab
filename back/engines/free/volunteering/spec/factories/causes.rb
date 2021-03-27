FactoryBot.define do
  factory :cause, class: 'Volunteering::Cause' do
    participation_context { create(:continuous_volunteering_project) }
    sequence(:title_multiloc) do |n|
      {
        "en" => "Good cause #{n}",
        "nl-BE" => "Goed doel #{n}"
      }
    end
    description_multiloc {{}}
  end
end
