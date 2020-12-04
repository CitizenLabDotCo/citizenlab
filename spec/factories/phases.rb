FactoryBot.define do
  factory :phase do
    project
    ideas_order { nil }
    input_term { nil }
    title_multiloc {{
      "en" => "Idea phase",
      "nl-BE" => "Ideeën fase"
    }}
    description_multiloc {{
      "en" => "<p>In this phase we gather ideas. Don't be shy, there are no stupid ideas!</p>",
      "nl-BE" => "<p>In deze fase verzamelen we ideeën. Wees niet verlegen, er zijn geen domme ideeën!</p>"
    }}
    participation_method { 'ideation' }
    start_at { "2017-05-01" }
    end_at { "2017-06-30" }

    transient do
      with_permissions { false }
    end

    after(:create) do |phase, evaluator|
      PermissionsService.new.update_permissions_for_context(phase) if evaluator.with_permissions
    end

    factory :active_phase do
      after(:create) do |phase, evaluator|
        phase.start_at  = Time.now - (1 + rand(120)).days
        phase.end_at = Time.now + (1 + rand(120)).days
      end
    end

    factory :phase_sequence do
      transient do
        duration_in_days { 5 }
      end

      after(:build) do |phase, evaluator|
        phase.start_at  = Time.now + (evaluator.duration_in_days * Phase.count + 1).days
        phase.end_at = Time.now + (evaluator.duration_in_days * (Phase.count + 1)).days
      end
    end

    factory :poll_phase do
      participation_method { "poll" }
    end

    factory :volunteering_phase do
      participation_method { "volunteering" }
    end

    trait :with_ideas do
      after(:create) do |phase|
        phase.ideas = create_list(:idea, 3, project: phase.project)
        phase.save
      end
    end
  end
end
