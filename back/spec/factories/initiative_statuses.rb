# frozen_string_literal: true

FactoryBot.define do
  factory :initiative_status do
    title_multiloc do
      {
        'en' => 'Made Joke cry',
        'nl-BE' => 'Deed Joke wenen'
      }
    end
    ordering { 2 }
    code { 'custom' }
    color { '#AABBCC' }
    description_multiloc do
      {
        'en' => 'This initiative has made Joke cry',
        'nl-BE' => 'Het initiatief heeft Joke doen wenen'
      }
    end

    factory :initiative_status_review_pending do
      code { 'review_pending' }
      title_multiloc { { 'en' => 'review_pending' } }
    end

    factory :initiative_status_changes_requested do
      code { 'changes_requested' }
      title_multiloc { { 'en' => 'changes_requested' } }
    end

    factory :initiative_status_proposed do
      code { 'proposed' }
      title_multiloc { { 'en' => 'proposed' } }
    end

    factory :initiative_status_expired do
      code { 'expired' }
      title_multiloc { { 'en' => 'expired' } }
    end

    factory :initiative_status_threshold_reached do
      code { 'threshold_reached' }
      title_multiloc { { 'en' => 'threshold_reached' } }
    end

    factory :initiative_status_answered do
      code { 'answered' }
      title_multiloc { { 'en' => 'answered' } }
    end

    factory :initiative_status_ineligible do
      code { 'ineligible' }
      title_multiloc { { 'en' => 'ineligible' } }
    end
  end
end
