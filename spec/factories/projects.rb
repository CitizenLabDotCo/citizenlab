FactoryGirl.define do
  factory :project do
    title_multiloc {{
      "en" => "Renew West Parc",
      "nl" => "Westpark vernieuwen"
    }}
    description_multiloc {{
      "en" => "<p>Let's renew the parc at the city border and make it an enjoyable place for young and old.</p>",
      "nl" => "<p>Laten we het park op de grend van de stad vernieuwen en er een aangename plek van maken, voor jong en oud.</p>"
    }}
    description_preview_multiloc {{
      "en" => "Let's renew the parc at the city border and make it an enjoyable place for young and old.",
      "nl" => "Laten we het park op de grend van de stad vernieuwen en er een aangename plek van maken, voor jong en oud."
    }}

    factory :project_with_topics do
      transient do
        topics_count 5
      end
      after(:create) do |project, evaluator|
        evaluator.topics_count.times do |i|
          project.topics << create(:topic)
        end
      end
    end

    factory :project_with_areas do
      transient do
        areas_count 5
      end
      after(:create) do |project, evaluator|
        evaluator.areas_count.times do |i|
          project.areas << create(:area)
        end
      end
    end

    factory :project_with_phases do
      transient do
        phases_count 5
      end
      after(:create) do |project, evaluator|
        start_at = Faker::Date.between(1.year.ago, 1.year.from_now)
        evaluator.phases_count.times do |i|
          project.phases << create(:phase, 
            start_at: start_at,
            end_at: start_at += rand(120).days
          )
        end
      end
    end

    factory :project_with_active_ideation_phase do
      after(:create) do |project, evaluator|
        project.phases << create(:active_phase, participation_method: 'ideation')
      end
    end

    factory :project_xl do
      transient do
        ideas_count 10
        topics_count 3
        areas_count 3
        phases_count 3
        events_count 3
        pages_count 3
        images_count 3
        files_count 3
        groups_count 3
      end
      after(:create) do |project, evaluator|
        evaluator.ideas_count.times do |i|
          project.ideas << create(:idea)
        end
        evaluator.topics_count.times do |i|
          project.topics << create(:topic)
        end
        evaluator.areas_count.times do |i|
          project.areas << create(:area)
        end
        evaluator.phases_count.times do |i|
          project.phases << create(:phase)
        end
        evaluator.events_count.times do |i|
          project.events << create(:event)
        end
        evaluator.pages_count.times do |i|
          project.pages << create(:page)
        end
        evaluator.images_count.times do |i|
          project.project_images << create(:project_image)
        end
        evaluator.files_count.times do |i|
          project.project_files << create(:project_file)
        end
        evaluator.groups_count.times do |i|
          project.groups << create(:group)
        end
      end
    end


    factory :private_admins_project do
      visible_to :admins
    end

    factory :private_groups_project do
      visible_to 'groups'
      transient do
        user nil
      end
      after(:create) do |project, evaluator|
        group = create(:group)
        project.groups << group
        if evaluator&.user
          group.users << evaluator&.user
        end
      end
    end
  end
end
