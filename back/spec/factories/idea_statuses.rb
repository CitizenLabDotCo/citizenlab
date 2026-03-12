# frozen_string_literal: true

FactoryBot.define do
  factory :idea_status do
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

    trait :prescreening do
      code { 'prescreening' }
      title_multiloc { { 'en' => 'screening' } }
    end

    trait :proposed do
      code { 'proposed' }
      title_multiloc { { 'en' => 'proposed' } }
    end

    trait :proposals do
      participation_method { 'proposals' }
    end

    trait :ideation do
      participation_method { 'ideation' }
    end

    factory :proposal_status_threshold_reached, traits: [:proposals] do
      code { 'threshold_reached' }
      title_multiloc { { 'en' => 'Threshold reached' } }
    end

    factory :proposals_status, traits: [:proposals]
    factory :idea_status_proposed, traits: %i[ideation proposed]
    factory :idea_status_prescreening, traits: %i[ideation prescreening]
    factory :proposal_status_prescreening, traits: %i[proposals prescreening]
  end
end
