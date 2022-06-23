# frozen_string_literal: true

FactoryBot.define do
  factory :poll_option, class: 'Polls::Option' do
    question { create(:poll_question) }
    sequence(:title_multiloc) do |n|
      {
        'en' => n.to_s,
        'nl-BE' => n.to_s
      }
    end
  end
end
