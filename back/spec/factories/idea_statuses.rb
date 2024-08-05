# frozen_string_literal: true

FactoryBot.define do
  factory :idea_status do
    participation_method { 'ideation' }
    title_multiloc do
      {
        'en' => 'At the mayor',
        'nl-BE' => 'Bij de burgemeester'
      }
    end
    code { 'custom' }
    color { '#AABBCC' }
    description_multiloc do
      {
        'en' => 'This idea has been presented to the mayor',
        'nl-BE' => 'Het idee werd voorgesteld aan de burgemeester'
      }
    end

    factory :proposals_status do
      participation_method { 'proposals' }
    end

    factory :idea_status_proposed do
      code { 'proposed' }
      title_multiloc { { 'en' => 'proposed' } }
    end
  end
end
