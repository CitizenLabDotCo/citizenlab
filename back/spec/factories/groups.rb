# frozen_string_literal: true

FactoryBot.define do
  factory :group do
    sequence(:title_multiloc) do |n|
      {
        'en' => "Martians #{n}",
        'nl-BE' => "Marsmannen #{n}"
      }
    end
    membership_type { 'manual' }
  end
end
