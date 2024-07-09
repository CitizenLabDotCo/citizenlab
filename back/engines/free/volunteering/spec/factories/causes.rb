# frozen_string_literal: true

FactoryBot.define do
  factory :cause, class: 'Volunteering::Cause' do
    phase do
      create(
        :volunteering_phase,
        start_at: Faker::Date.between(from: 6.months.ago, to: Time.zone.now),
        end_at: nil
      )
    end
    sequence(:title_multiloc) do |n|
      {
        'en' => "Good cause #{n}",
        'nl-BE' => "Goed doel #{n}"
      }
    end
    description_multiloc { {} }
  end
end
