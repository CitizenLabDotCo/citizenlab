FactoryBot.define do
  factory :initiative do
    title_multiloc {{
      "en" => "Install water turbines on kanals",
      "nl-BE" => "Waterturbines op kanalen installeren"
    }}
    body_multiloc {{
      "en" => "<p>Surely we'll gain huge amounts of green energy from this!</p>",
      "nl-BE" => "<p>Hier zullen we vast wel hopen groene energie uit halen!</p>"
    }}
    sequence(:slug) {|n| "turbines-on-kanals-#{n}"}
    publication_status { "published" }
    author
    assignee { nil }

    transient do
      initiative_status { nil }
    end

    before :create do |initiative|
      if initiative.initiative_status_changes.blank?
        initiative.initiative_status_changes << build(:initiative_status_change, initiative: initiative, official_feedback: nil)
      end
    end

    after(:create) do |initiative, evaluator|
      if evaluator.initiative_status
        initiative.initiative_status_changes << create(
          :initiative_status_change, 
          initiative: initiative,
          initiative_status: evaluator.initiative_status,
          official_feedback: nil
          )
      end
    end

    factory :initiative_with_topics do
      transient do
        topics_count { 2 }
      end
      after(:create) do |initiative, evaluator|
        evaluator.topics_count.times do |i|
          initiative.topics << create(:topic)
        end
      end
    end

    factory :initiative_with_areas do
      transient do
        areas_count { 2 }
      end
      after(:create) do |initiative, evaluator|
        evaluator.areas_count.times do |i|
          initiative.areas << create(:area)
        end
      end
    end

    factory :assigned_initiative do
      transient do
        assigned_at { Time.now }
      end
      after(:create) do |initiative, evaluator|
        initiative.assignee = create(:admin)
        initiative.assigned_at = evaluator.assigned_at
      end
    end
  end
end
