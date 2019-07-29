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

    # initiative_status_changes { build_list(:initiative_status_change, 1) }

    # after :create do |initiative|
    #   create_list :initiative_status_change, 1, initiative: initiative
    # end

    # before :create do |initiative|
    #   prrt = create!(:initiative_status)
    #   initiative.initiative_status_changes.create!(initiative_status: prrt)
    #   byebug
    #   # build_list(:initiative_status_change, 1, initiative: initiative)
    # end

    before :create do |initiative|
      initiative.initiative_status_changes << build(:initiative_status_change, initiative: initiative)
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
  end
end
