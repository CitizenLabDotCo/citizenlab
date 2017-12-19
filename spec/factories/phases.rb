FactoryGirl.define do
  factory :phase do
    project
    title_multiloc {{
      "en" => "Idea phase",
      "nl" => "Ideeën fase"
    }}
    description_multiloc {{
      "en" => "<p>In this phase we gather ideas. Don't be shy, there are no stupid ideas!</p>",
      "nl" => "<p>In deze fase verzamelen we ideeën. Wees niet verlegen, er zijn geen domme ideeën!</p>"
    }}
    consultation_method 'ideation'
    start_at "2017-05-01"
    end_at "2017-06-30"

    factory :active_phase do
      after(:create) do |phase, evaluator|
        phase.start_at  = Time.now - (1 + rand(120)).days
        phase.end_at = Time.now + (1 + rand(120)).days
      end
    end

  end

end
