# frozen_string_literal: true

FactoryBot.define do
  factory :phase do
    project
    ideas_order { nil }
    input_term { nil }
    title_multiloc do
      {
        'en' => 'Idea phase',
        'nl-BE' => 'Ideeën fase'
      }
    end
    description_multiloc do
      {
        'en' => "<p>In this phase we gather ideas. Don't be shy, there are no stupid ideas!</p>",
        'nl-BE' => '<p>In deze fase verzamelen we ideeën. Wees niet verlegen, er zijn geen domme ideeën!</p>'
      }
    end
    participation_method { 'ideation' }
    start_at { '2017-05-01' }
    end_at { '2017-06-30' }
    min_budget { 1 }
    max_budget { 10_000 }

    factory :active_phase do
      after(:create) do |phase, _evaluator|
        phase.start_at = Time.now - 7.days
        phase.end_at = Time.now + 7.days
      end
    end

    factory :phase_sequence do
      transient do
        duration_in_days { 5 }
      end

      after(:build) do |phase, evaluator|
        phase.start_at = Time.now + ((evaluator.duration_in_days * Phase.count) + 1).days
        phase.end_at = Time.now + (evaluator.duration_in_days * (Phase.count + 1)).days
      end
    end

    factory :poll_phase do
      participation_method { 'poll' }
    end

    factory :volunteering_phase do
      participation_method { 'volunteering' }
    end

    factory :native_survey_phase do
      participation_method { 'native_survey' }
    end
  end
end
