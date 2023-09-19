# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Projects < Base
      def run
        runner.num_projects.times do
          project = Project.new({
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
            description_multiloc: runner.create_for_tenant_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
            description_preview_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
            header_bg: rand(25) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open,
            visible_to: %w[admins groups public public public][rand(5)],
            presentation_mode: %w[card card card map map][rand(5)],
            process_type: %w[timeline timeline timeline timeline continuous][rand(5)],
            areas: Array.new(rand(3)) { rand(Area.count) }.uniq.map { |offset| Area.offset(offset).first },
            allowed_input_topics: Topic.all.shuffle.take(rand(Topic.count) + 1),
            admin_publication_attributes: {
              parent_id: (rand(2) == 0 ? nil : AdminPublication.where(publication_type: ::ProjectFolders::Folder.name).ids.sample),
              publication_status: %w[published published published published published draft
                archived][rand(7)]
            }
          })

          if project.continuous?
            project.update({
              posting_enabled: rand(4) != 0,
              reacting_enabled: rand(4) != 0,
              reacting_dislike_enabled: rand(3) != 0,
              commenting_enabled: rand(4) != 0,
              reacting_like_method: %w[unlimited unlimited unlimited limited][rand(4)],
              reacting_like_limited_max: rand(1..15),
              reacting_dislike_method: %w[unlimited unlimited unlimited limited][rand(4)],
              reacting_dislike_limited_max: rand(1..15)
            })
          end

          project.save!

          project.project_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)

          if project.continuous? && rand(5) == 0
            rand(1..3).times do
              project.project_files.create!(runner.generate_file_attributes)
            end
          end

          configure_timeline_for(project)
          configure_events_for(project)

          ([User.find_by(email: 'moderator@citizenlab.co')] + User.where.not(email: %w[admin@citizenlab.co
            user@citizenlab.co]).shuffle.take(rand(5))).each do |some_moderator|
            some_moderator.add_role 'project_moderator', project_id: project.id
            some_moderator.save!
          end

          if rand(5) == 0
            project.save!
          end
        end
      end

      private

      def configure_timeline_for(project)
        return unless project.timeline?

        start_at = Faker::Date.between(from: Tenant.current.created_at, to: 1.year.from_now)
        rand(8).times do
          start_at += 1.day
          phase = project.phases.new({
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
            description_multiloc: runner.create_for_tenant_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
            start_at: start_at,
            end_at: (start_at += rand(150).days),
            participation_method: %w[ideation voting poll information ideation ideation][rand(6)],
            campaigns_settings: { project_phase_started: true }
          })
          if phase.voting?
            phase.assign_attributes(voting_method: 'budgeting', voting_max_total: rand(100..1_000_099).round(-2))
          elsif phase.ideation?
            phase.assign_attributes({
              posting_enabled: rand(4) != 0,
              reacting_enabled: rand(4) != 0,
              reacting_dislike_enabled: rand(3) != 0,
              commenting_enabled: rand(4) != 0,
              reacting_like_method: %w[unlimited unlimited unlimited limited][rand(4)],
              reacting_like_limited_max: rand(1..15),
              reacting_dislike_method: %w[unlimited unlimited unlimited limited][rand(4)],
              reacting_dislike_limited_max: rand(1..15)
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
              participation_context: phase
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
            response = Polls::Response.create!(user: some_user, participation_context: phase)
            questions.each do |q|
              response.response_options.create!(option: runner.rand_instance(q.options))
            end
          end
        end
      end

      def configure_events_for(project)
        rand(5).times do
          start_at = Faker::Date.between(from: Tenant.current.created_at, to: 1.year.from_now)
          event = project.events.create!({
            title_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence },
            description_multiloc: runner.create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
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
    end
  end
end
