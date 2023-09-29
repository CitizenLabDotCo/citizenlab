# frozen_string_literal: true

FactoryBot.define do
  factory :initiative do
    title_multiloc do
      {
        'en' => 'Install water turbines on kanals',
        'nl-BE' => 'Waterturbines op kanalen installeren'
      }
    end
    body_multiloc do
      {
        'en' => "<p>Surely we'll gain huge amounts of green energy from this!</p>",
        'nl-BE' => '<p>Hier zullen we vast wel hopen groene energie uit halen!</p>'
      }
    end
    sequence(:slug) { |n| "turbines-on-kanals-#{n}" }
    publication_status { 'published' }
    author
    assignee { nil }

    transient do
      initiative_status { nil }
    end

    transient do
      build_status_change { true }
    end

    before :create do |initiative, evaluator|
      if initiative.initiative_status_changes.blank? && evaluator.build_status_change
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
        evaluator.topics_count.times do |_i|
          initiative.topics << create(:topic)
        end
      end
    end

    factory :initiative_with_areas do
      transient do
        areas_count { 2 }
      end
      after(:create) do |initiative, evaluator|
        evaluator.areas_count.times do |_i|
          initiative.areas << create(:area)
        end
      end
    end
  end
end
