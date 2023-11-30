# frozen_string_literal: true

FactoryBot.define do
  factory :cause, class: 'Volunteering::Cause' do
    phase { create(:volunteering_phase) }
    sequence(:title_multiloc) do |n|
      {
        'en' => "Good cause #{n}",
        'nl-BE' => "Goed doel #{n}"
      }
    end
    description_multiloc { {} }
  end
end
