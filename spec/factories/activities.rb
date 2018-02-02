FactoryBot.define do
  factory :activity do
    association :item, factory: :idea
    action "published"
    acted_at {Time.now}
    user

    factory :idea_published_activity do
      action "published"
    end

    factory :idea_changed_title_activity do
      action "changed_title"
      payload {{
        "change" => [
          {"en" => "old title"},
          {"en" => "new title"}
        ]
      }}
    end

    factory :idea_changed_body_activity do
      action "changed_body"
      payload {{
        "change" => [
          {"en" => "old body"},
          {"en" => "new body"}
        ]
      }}
    end

    factory :idea_changed_status_activity do
      action "changed_status"
      payload {{
        "change" => [
          "somepreviousstatusid",
          "somenewstatusid"
        ]
      }}
    end
  end



end
