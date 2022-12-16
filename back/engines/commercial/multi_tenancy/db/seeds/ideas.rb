# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Ideas < Base
      def run
        runner.num_ideas.times do
          created_at = Faker::Date.between(from: Tenant.current.created_at, to: Time.zone.now)
          project = runner.rand_instance Project.all
          phases = []
          if project&.timeline?
            phases = project.phases.sample(rand(project.phases.size)).select(&:can_contain_ideas?)
          end
          offsets = Array.new(rand(3)) do
            rand(project.allowed_input_topics.count)
          end
          topics = offsets.uniq.map { |offset| project.allowed_input_topics.offset(offset).first }
          idea = Idea.create!({
            title_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence[0...80] },
            body_multiloc: runner.create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
            idea_status: runner.rand_instance(IdeaStatus.all),
            topics: topics,
            author: runner.rand_instance(User.all),
            project: project,
            phases: phases,
            publication_status: 'published',
            published_at: Faker::Date.between(from: created_at, to: Time.zone.now),
            created_at: created_at,
            location_point: rand(3) == 0 ? nil : "POINT(#{runner.map_center[1] + (((rand * 2) - 1) * runner.map_offset)} #{runner.map_center[0] + (((rand * 2) - 1) * runner.map_offset)})",
            location_description: rand(2) == 0 ? nil : Faker::Address.street_address,
            budget: rand(3) == 0 ? nil : (rand(10**rand(2..4)) + 50).round(-1),
            proposed_budget: rand(3) == 0 ? nil : (rand(10**rand(2..4)) + 50).round(-1)
          })

          [0, 0, 1, 1, 2][rand(5)].times do |_i|
            idea.idea_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
          end
          if rand(5) == 0
            rand(1..3).times do
              idea.idea_files.create!(runner.generate_file_attributes)
            end
          end

          User.all.each do |u|
            r = rand(5)
            if r == 0
              Vote.create!(votable: idea, user: u, mode: 'down',
                created_at: Faker::Date.between(from: idea.published_at, to: Time.zone.now))
            elsif r > 0 && r < 3
              Vote.create!(votable: idea, user: u, mode: 'up',
                created_at: Faker::Date.between(from: idea.published_at, to: Time.zone.now))
            end
          end

          rand(5).times do
            idea.official_feedbacks.create!(
              body_multiloc: runner.create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
              author_multiloc: runner.create_for_some_locales { Faker::FunnyName.name },
              user: runner.rand_instance(User.admin)
            )
          end

          runner.create_comment_tree(idea, nil)
        end
      end
    end
  end
end
