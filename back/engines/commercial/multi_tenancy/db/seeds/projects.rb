# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Projects < Base
      def run
        create_fixed_projects
        create_random_projects
      end

      private

      def create_fixed_projects
        create_mixed_3_methods_project
        create_archived_project
      end

      def create_mixed_3_methods_project
        project = Project.create!(
          title_multiloc: { 'en' => 'Mixed 3 methods project' },
          description_multiloc: runner.rand_description_multiloc,
          slug: 'mixed-3-methods-project',
          header_bg: Rails.root.join('spec/fixtures/3-methods-project-header-bg.png').open
        )
        project.phases.create!(
          title_multiloc: { 'en' => 'Past proposals phase' },
          description_multiloc: runner.rand_description_multiloc,
          participation_method: 'proposals',
          start_at: Time.zone.today - 30.days,
          end_at: Time.zone.today - 11.days
        )
        project.phases.create!(
          title_multiloc: { 'en' => 'Current ideation phase' },
          description_multiloc: runner.rand_description_multiloc,
          participation_method: 'ideation',
          start_at: Time.zone.today - 10.days,
          end_at: Time.zone.today + 10.days
        )
        project.phases.create!(
          title_multiloc: { 'en' => 'Future native survey phase' },
          description_multiloc: runner.rand_description_multiloc,
          participation_method: 'native_survey',
          start_at: Time.zone.today + 11.days,
          end_at: nil,
          native_survey_title_multiloc: { 'en' => 'Survey' },
          native_survey_button_multiloc: { 'en' => 'Take the survey' }
        )
        project.project_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open)
        project.input_topics.create!(
          title_multiloc: { 'en' => 'Environment' },
          description_multiloc: { 'en' => 'Ideas about the environment' }
        )
        transportation = project.input_topics.create!(
          title_multiloc: { 'en' => 'Transportation' },
          description_multiloc: { 'en' => 'Ideas about transportation' }
        )
        transportation.children.create!(
          title_multiloc: { 'en' => 'Public transport' },
          description_multiloc: { 'en' => 'Ideas about public transport' },
          project: project
        )
        transportation.children.create!(
          title_multiloc: { 'en' => 'Biking' },
          description_multiloc: { 'en' => 'Ideas about biking' },
          project: project
        )
        transportation.children.create!(
          title_multiloc: { 'en' => 'Walking' },
          description_multiloc: { 'en' => 'Ideas about walking' },
          project: project
        )
        project.input_topics.create!(
          title_multiloc: { 'en' => 'Housing' },
          description_multiloc: { 'en' => 'Ideas about housing' }
        )
      end

      def create_archived_project
        project = Project.create!(
          title_multiloc: { 'en' => 'Archived project' },
          description_multiloc: runner.rand_description_multiloc,
          slug: 'archived-project',
          header_bg: Rails.root.join('spec/fixtures/image6.jpg').open,
          admin_publication_attributes: { publication_status: 'archived' }
        )
        project.phases.create!(
          title_multiloc: { 'en' => 'Past information phase' },
          description_multiloc: runner.rand_description_multiloc,
          participation_method: 'information',
          start_at: Time.zone.today - 30.days,
          end_at: Time.zone.today - 11.days
        )
        project.project_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open)
        project.input_topics.create!(
          title_multiloc: { 'en' => 'Culture' },
          description_multiloc: { 'en' => 'Ideas about culture' }
        )
        project.input_topics.create!(
          title_multiloc: { 'en' => 'Sports' },
          description_multiloc: { 'en' => 'Ideas about sports' }
        )
      end

      def create_random_projects
        (runner.num_projects - Project.count).times do
          project = Project.new({
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
            description_multiloc: runner.rand_description_multiloc,
            description_preview_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
            header_bg: rand(25) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open,
            visible_to: %w[admins groups public public public][rand(5)],
            areas: Array.new(rand(3)) { rand(Area.count) }.uniq.map { |offset| Area.offset(offset).first },
            admin_publication_attributes: {
              parent_id: (rand(2) == 0 ? nil : AdminPublication.where(publication_type: ::ProjectFolders::Folder.name).ids.sample),
              publication_status: %w[published published published published published draft
                archived][rand(7)]
            }
          })

          project.save!

          project.project_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open)

          if rand(5) == 0
            rand(1..3).times do
              project.project_files.create!(runner.generate_file_attributes)
            end
          end

          configure_random_input_topics_for(project)
          configure_random_timeline_for(project)
          configure_random_events_for(project)

          ([User.find_by(email: 'moderator@govocal.com')] + User.where.not(email: %w[admin@govocal.com user@govocal.com]).shuffle.take(rand(5))).each do |some_moderator|
            some_moderator.add_role 'project_moderator', project_id: project.id
            some_moderator.save!
          end

          if rand(5) == 0
            project.save!
          end
        end
      end

      def configure_random_timeline_for(project)
        start_at = Faker::Date.between(from: Tenant.current.created_at, to: 1.year.from_now)
        rand(8).times do
          start_at += 1.day
          phase = project.phases.new({
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
            description_multiloc: runner.rand_description_multiloc,
            start_at: start_at,
            end_at: (start_at += rand(150).days),
            participation_method: %w[ideation voting poll information ideation ideation][rand(6)]
          })
          if phase.voting?
            phase.assign_attributes(voting_method: 'budgeting', voting_max_total: rand(100..1_000_099).round(-2))
          elsif phase.participation_method == 'ideation'
            phase.assign_attributes({
              submission_enabled: rand(4) != 0,
              reacting_enabled: rand(4) != 0,
              reacting_dislike_enabled: rand(3) != 0,
              commenting_enabled: rand(4) != 0,
              reacting_like_method: %w[unlimited unlimited unlimited limited][rand(4)],
              reacting_like_limited_max: rand(1..15),
              reacting_dislike_method: %w[unlimited unlimited unlimited limited][rand(4)],
              reacting_dislike_limited_max: rand(1..15),
              autoshare_results_enabled: true
            })
          end
          phase.save!
          if rand(5) == 0
            rand(1..3).times do
              phase.phase_files.create!(runner.generate_file_attributes)
            end
          end
          next unless phase.poll?

          questions = Array.new(rand(1..5)) do
            question = Polls::Question.create!(
              title_multiloc: runner.create_for_some_locales { Faker::Lorem.question },
              phase: phase
            )
            rand(1..5).times do
              Polls::Option.create!(
                question: question,
                title_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence }
              )
            end
            question
          end
          User.order('RANDOM()').take(rand(1..5)).each do |some_user|
            response = Polls::Response.create!(user: some_user, phase: phase)
            questions.each do |q|
              response.response_options.create!(option: runner.rand_instance(q.options))
            end
          end
        end
      end

      def configure_random_events_for(project)
        rand(5).times do
          start_at = Faker::Date.between(from: Tenant.current.created_at, to: 1.year.from_now)
          event = project.events.create!({
            title_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence },
            description_multiloc: runner.rand_description_multiloc,
            location_multiloc: runner.create_for_some_locales { Faker::Address.street_address },
            start_at: start_at,
            end_at: start_at + rand(12).hours
          })
          next unless rand(5) == 0

          rand(1..3).times do
            event.event_files.create!(runner.generate_file_attributes)
          end
        end
      end

      def configure_random_input_topics_for(project)
        rand(1..3).times do
          parent = project.input_topics.create!(
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
            description_multiloc: runner.rand_description_multiloc
          )
          rand(0..2).times do
            project.input_topics.create!(
              title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
              description_multiloc: runner.rand_description_multiloc,
              parent: parent
            )
          end
        end
      end
    end
  end
end
