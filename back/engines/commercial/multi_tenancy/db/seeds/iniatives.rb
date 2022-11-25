# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Iniatives < Base
      def run
        runner.num_initiatives.times do
          created_at = Faker::Date.between(from: Tenant.current.created_at, to: Time.zone.now)
          initiative = Initiative.create!(
            title_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence[0...80] },
            body_multiloc: runner.create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
            author: User.offset(rand(User.count)).first,
            publication_status: 'published',
            published_at: Faker::Date.between(from: created_at, to: Time.zone.now),
            created_at: created_at,
            location_point: rand(3) == 0 ? nil : "POINT(#{runner.map_center[1] + (((rand * 2) - 1) * runner.map_offset)} #{runner.map_center[0] + (((rand * 2) - 1) * runner.map_offset)})",
            location_description: rand(2) == 0 ? nil : Faker::Address.street_address,
            header_bg: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open,
            topics: Array.new(rand(3)) { rand(Topic.count) }.uniq.map { |offset| Topic.offset(offset).first },
            areas: Array.new(rand(3)) { rand(Area.count) }.uniq.map { |offset| Area.offset(offset).first },
            assignee: rand(5) == 0 ? User.admin.sample : nil
          )
          # TODO: make initiative statuses correspond with required votes reached
          InitiativeStatusChange.create!(
            created_at: initiative.published_at,
            initiative: initiative,
            initiative_status: InitiativeStatus.offset(rand(InitiativeStatus.count)).first
          )

          [0, 0, 1, 1, 2][rand(5)].times do |_i|
            initiative.initiative_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
          end
          if rand(5) == 0
            rand(1..3).times do
              initiative.initiative_files.create!(runner.generate_file_attributes)
            end
          end

          User.all.each do |u|
            r = rand(5)
            if r < 2
              Vote.create!(votable: initiative, user: u, mode: 'up',
                created_at: Faker::Date.between(from: initiative.published_at, to: Time.zone.now))
            end
          end

          rand(5).times do
            initiative.official_feedbacks.create!(
              body_multiloc: runner.create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
              author_multiloc: runner.create_for_some_locales { Faker::FunnyName.name },
              user: User.admin.sample
            )
          end

          runner.create_comment_tree(initiative, nil)
        end
      end
    end
  end
end
