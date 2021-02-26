module FactoryHelpers
  extend self

  def extract_permissions_config phase_config
    permissions_config = {}
    permission_keys = phase_config.keys.select do |key|
      key.to_s.end_with? '_permitted'
    end
    permission_keys.each do |key|
      permissions_config[key.to_s.chomp('_permitted')] = phase_config[key]
      phase_config.delete(key)
    end
    permissions_config
  end

  def apply_permissions_config phase, permissions_config
    permissions_config.each do |action, is_permitted|
      permission = phase.permissions.find_by action: action
      permission = phase.permissions.create!(action: action) if !permission
      permission.update!(permitted_by: (is_permitted ? 'everyone' : 'admins_moderators'))
    end
  end
end

FactoryBot.define do
  factory :project do
    ideas_order { nil }
    input_term { nil }
    admin_publication_attributes { {} }
    title_multiloc {{
      'en' => 'Renew West Parc',
      'nl-BE' => 'Westpark vernieuwen'
    }}
    description_multiloc {{
      'en' => '<p>Let\'s renew the parc at the city border and make it an enjoyable place for young and old.</p>',
      'nl-BE' => '<p>Laten we het park op de grend van de stad vernieuwen en er een aangename plek van maken, voor jong en oud.</p>'
    }}
    description_preview_multiloc {{
      'en' => 'Let\'s renew the parc at the city border and make it an enjoyable place for young and old.',
      'nl-BE' => 'Laten we het park op de grend van de stad vernieuwen en er een aangename plek van maken, voor jong en oud.'
    }}
    sequence(:slug) { |n| "renew-west-parc-#{n}" }

    transient do
      with_permissions { false }
    end

    after(:create) do |project, evaluator|
      if evaluator.with_permissions && project.participation_context?
        PermissionsService.new.update_permissions_for_context project
      end
    end

    factory :project_with_topics do
      transient do
        topics_count { 5 }
      end
      after(:create) do |project, evaluator|
        evaluator.topics_count.times do |i|
          project.topics << create(:topic)
        end
      end
    end

    factory :project_with_areas do
      transient do
        areas_count { 5 }
      end
      after(:create) do |project, evaluator|
        evaluator.areas_count.times do |i|
          project.areas << create(:area)
        end
      end
    end

    factory :project_with_phases do
      transient do
        phases_count { 5 }
      end
      after(:create) do |project, evaluator|
        start_at = Faker::Date.between(from: 1.year.ago, to: 1.year.from_now)
        evaluator.phases_count.times do |i|
          project.phases << create(:phase,
            start_at: start_at + 1,
            end_at: start_at += (1 + rand(120)).days,
            project: project,
            with_permissions: evaluator.with_permissions
          )
        end
      end
    end

    factory :project_with_active_ideation_phase do
      after(:create) do |project, evaluator|
        project.phases << create(:active_phase,
          project: project,
          participation_method: 'ideation',
          with_permissions: evaluator.with_permissions
          )
      end
    end


    factory :project_with_past_phases do
      transient do
        phases_count { 5 }
        last_end_at { Faker::Date.between(from: 1.year.ago, to: Time.now) }
      end
      after(:create) do |project, evaluator|
        end_at = evaluator.last_end_at
        evaluator.phases_count.times do |i|
          project.phases << create(:phase,
            end_at: end_at - 1,
            start_at: end_at -= (1+ rand(72)).days,
            project: project,
            with_permissions: evaluator.with_permissions
          )
        end
      end
    end

    factory :project_with_current_phase do
      transient do
        current_phase_attrs {{}}
        phases_config {{sequence: "xxcxx"}}
      end
      after(:create) do |project, evaluator|
        phase_config = evaluator.current_phase_attrs.merge((evaluator.phases_config[:c].clone || {}))
        permissions_config = FactoryHelpers.extract_permissions_config phase_config
        active_phase = create(:phase,
          start_at: Faker::Date.between(from: 6.months.ago, to: Time.now),
          end_at: Faker::Date.between(from: Time.now+1.day, to: 6.months.from_now),
          project: project,
          with_permissions: evaluator.with_permissions,
          **phase_config
        )
        FactoryHelpers.apply_permissions_config active_phase, permissions_config
        phases_before, phases_after = evaluator.phases_config[:sequence].split('c')

        end_at = active_phase.start_at
        phases_before&.chars&.map(&:to_sym)&.reverse&.each do |sequence_char|
          phase_config = evaluator.phases_config[sequence_char].clone || {}
          permissions_config = FactoryHelpers.extract_permissions_config phase_config
          phase = create(:phase,
            end_at: end_at - 1,
            start_at: end_at -= (1 + rand(120)).days,
            project: project,
            with_permissions: evaluator.with_permissions,
            **phase_config
          )
          project.phases << phase
          FactoryHelpers.apply_permissions_config phase, permissions_config
        end

        start_at = active_phase.end_at
        phases_after&.chars&.map(&:to_sym)&.each do |sequence_char|
          phase_config = evaluator.phases_config[sequence_char].clone || {}
          permissions_config = FactoryHelpers.extract_permissions_config phase_config
          phase = create(:phase,
            start_at: start_at + 1,
            end_at: start_at += (1 + rand(120)).days,
            project: project,
            with_permissions: evaluator.with_permissions,
            **phase_config
          )
          project.phases << phase
          FactoryHelpers.apply_permissions_config phase, permissions_config
        end
      end
    end

    factory :project_with_future_phases do
      transient do
        phases_count { 5 }
        first_start_at { Faker::Date.between(from: Time.now, to: 1.year.from_now) }
      end
      after(:create) do |project, evaluator|
        start_at = evaluator.first_start_at
        evaluator.phases_count.times do |i|
          project.phases << create(:phase,
            start_at: start_at + 1,
            end_at: start_at += (1 + rand(120)).days,
            project: project,
            with_permissions: evaluator.with_permissions
          )
        end
      end
    end

    factory :project_xl do
      transient do
        ideas_count { 10 }
        topics_count { 3 }
        areas_count { 3 }
        phases_count { 3 }
        events_count { 3 }
        pages_count { 3 }
        images_count { 3 }
        files_count { 3 }
        groups_count { 3 }
      end
      after(:create) do |project, evaluator|
        evaluator.ideas_count.times do |i|
          project.ideas << create(:idea, project: project)
        end
        evaluator.topics_count.times do |i|
          project.topics << create(:topic)
        end
        evaluator.areas_count.times do |i|
          project.areas << create(:area)
        end
        evaluator.phases_count.times do |i|
          project.phases << create(:phase_sequence, with_permissions: evaluator.with_permissions, project: project)
        end
        evaluator.events_count.times do |i|
          project.events << create(:event, project: project)
        end
        evaluator.pages_count.times do |i|
          project.pages << create(:page, project: project)
        end
        evaluator.images_count.times do |i|
          project.project_images << create(:project_image, project: project)
        end
        evaluator.files_count.times do |i|
          project.project_files << create(:project_file, project: project)
        end
        evaluator.groups_count.times do |i|
          project.groups << create(:group)
        end
      end
    end

    factory :private_admins_project do
      visible_to { :admins }
    end

    factory :private_groups_project do
      visible_to { 'groups' }
      transient do
        groups_count { 1 }
        user { nil }
      end
      after(:create) do |project, evaluator|
        evaluator.groups_count.times do |i|
          group = create(:group)
          project.groups << group
          if evaluator&.user
            group.members << evaluator&.user
          end
        end
      end

      factory :private_groups_continuous_project do
        process_type { 'continuous' }
        factory :private_groups_continuous_budgeting_project do
          participation_method { 'budgeting' }
          max_budget { 10000 }
        end
      end
    end

    factory :continuous_project do
      process_type { 'continuous' }
      participation_method { 'ideation' }
      voting_method { 'unlimited' }
      voting_limited_max { 7 }
    end

    factory :continuous_survey_project do
      process_type { 'continuous' }
      participation_method { 'survey' }
      survey_service { 'typeform' }
      survey_embed_url { "https://citizenlabco.typeform.com/to/HKGaPV?source=xxxxx" }
    end

    factory :continuous_google_survey_project do
      process_type { 'continuous' }
      participation_method { 'survey' }
      survey_service { 'google_forms' }
      survey_embed_url { "https://docs.google.com/forms/d/e/fake/viewform?embedded=true" }
    end

    factory :continuous_budgeting_project do
      process_type { 'continuous' }
      participation_method { 'budgeting' }
      max_budget { 10000 }
    end

    factory :continuous_poll_project do
      process_type { 'continuous' }
      participation_method { 'poll' }
    end

    factory :continuous_volunteering_project do
      process_type { 'continuous' }
      participation_method { 'volunteering' }
    end
  end
end
