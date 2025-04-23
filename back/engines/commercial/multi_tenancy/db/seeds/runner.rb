# frozen_string_literal: true

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).

require_relative 'api_clients'
require_relative 'analytics'
require_relative 'areas'
require_relative 'baskets'
require_relative 'common_passwords'
require_relative 'community_monitor'
require_relative 'custom_fields'
require_relative 'custom_forms'
require_relative 'custom_maps'
require_relative 'email_campaign_examples'
require_relative 'events'
require_relative 'followers'
require_relative 'groups'
require_relative 'ideas'
require_relative 'internal_comments'
require_relative 'invites'
require_relative 'permissions'
require_relative 'project_folders'
require_relative 'projects'
require_relative 'static_pages'
require_relative 'tenants'
require_relative 'topics'
require_relative 'unsubscription_tokens'
require_relative 'users'
require_relative 'volunteering_causes'
require_relative 'volunteers'

module MultiTenancy
  module Seeds
    # Runs the seeding process. Can be configured via ENV vars:
    # SEED_SIZE = [small, medium, large] (number of records)
    # SEED_EMPTY_TENANT = true (creates an empty tenant)
    class Runner
      attr_reader :seed_size

      SEED_LOCALES = %w[en nl-BE fr-BE].freeze

      SEED_SIZES = {
        small: {
          num_users: 5,
          num_projects: 1,
          num_ideas: 4
        },
        medium: {
          num_users: 10,
          num_projects: 5,
          num_ideas: 15
        },
        large: {
          num_users: 50,
          num_projects: 20,
          num_ideas: 100
        }
      }.freeze

      MAP_CENTER = [50.8503, 4.3517].freeze
      MAP_OFFSET = 0.1

      def initialize
        @seed_size = ENV.fetch('SEED_SIZE', 'medium').to_sym
        @create_empty_tenant = ENV['SEED_EMPTY_TENANT'].present?
      end

      def execute
        Rails.application.eager_load!

        if %w[public example_org].include? Apartment::Tenant.current
          # rake db:reset clears all instances before repopulating the db.

          MultiTenancy::Seeds::CommonPasswords.new(runner: self).run
          MultiTenancy::Seeds::Tenants.new(runner: self).run
        end

        seed_empty_localhost_tenant
        seed_localhost_tenant

        return if Apartment::Tenant.current == 'public'

        MultiTenancy::Seeds::UnsubscriptionTokens.new(runner: self).run
        MultiTenancy::Seeds::EmailCampaignExamples.new(runner: self).run
        MultiTenancy::TenantService.new.finalize_creation(Tenant.current)
      end

      # Seeds an empty localhost tenant. It contains only the absolute minimum of records
      def seed_empty_localhost_tenant
        return unless Apartment::Tenant.current == 'empty_localhost'

        MultiTenancy::Templates::ApplyService.new.apply_internal_template('base')
        MultiTenancy::Seeds::Users.new(runner: self).run
      end

      # Seeds a localhost tenant suited for local development.
      def seed_localhost_tenant
        return unless Apartment::Tenant.current == 'localhost'

        MultiTenancy::Templates::ApplyService.new.apply_internal_template('base')

        MultiTenancy::Seeds::Users.new(runner: self).run
        MultiTenancy::Seeds::ApiClients.new(runner: self).run
        MultiTenancy::Seeds::CustomFields.new(runner: self).run
        MultiTenancy::Seeds::Areas.new(runner: self).run
        MultiTenancy::Seeds::Topics.new(runner: self).run
        MultiTenancy::Seeds::ProjectFolders.new(runner: self).run
        MultiTenancy::Seeds::Projects.new(runner: self).run
        MultiTenancy::Seeds::Ideas.new(runner: self).run
        MultiTenancy::Seeds::InternalComments.new(runner: self).run
        MultiTenancy::Seeds::Baskets.new(runner: self).run
        MultiTenancy::Seeds::Groups.new(runner: self).run
        MultiTenancy::Seeds::StaticPages.new(runner: self).run
        MultiTenancy::Seeds::Invites.new(runner: self).run
        MultiTenancy::Seeds::VolunteeringCauses.new(runner: self).run
        MultiTenancy::Seeds::Permissions.new(runner: self).run
        MultiTenancy::Seeds::CustomForms.new(runner: self).run
        MultiTenancy::Seeds::Volunteers.new(runner: self).run
        MultiTenancy::Seeds::CustomMaps.new(runner: self).run
        MultiTenancy::Seeds::Analytics.new(runner: self).run
        MultiTenancy::Seeds::Followers.new(runner: self).run
        MultiTenancy::Seeds::Events.new(runner: self).run
        MultiTenancy::Seeds::CommunityMonitor.new(runner: self).run
      end

      # @return [Array[String]] default seed locales
      def seed_locales
        SEED_LOCALES
      end

      # @return [Integer] Number of users to be seeded
      def num_users
        SEED_SIZES.dig(seed_size, :num_users)
      end

      # @return [Integer] Number of projects to be seeded
      def num_projects
        SEED_SIZES.dig(seed_size, :num_projects)
      end

      # @return [Integer] Number of ideas to be seeded
      def num_ideas
        SEED_SIZES.dig(seed_size, :num_ideas)
      end

      # @return [Float] default map center
      def map_center
        MAP_CENTER
      end

      # @return [Float] default map offset
      def map_offset
        MAP_OFFSET
      end

      # @return[Hash] A multiloc hash with translations
      def create_for_tenant_locales
        translations = {}
        SEED_LOCALES.each { |locale| translations[locale] = yield }
        translations
      end

      # Returns a random record from a relation
      # @param scope [ActiveRecord::Relation] relation of why to pick a random entry from
      # @return [ActiveRecord::Base] the random record
      def rand_instance(scope)
        scope.order(Arel.sql('RANDOM()')).first
      end

      def rand_description_multiloc
        create_for_tenant_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join }
      end

      # Creates nested comments for a given post
      def create_comment_tree(post, parent, depth = 0)
        return if depth > 1

        rand(1..4).times do |_i|
          c = Comment.create!({
            body_multiloc: {
              'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
              'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
            },
            author: rand_instance(User.normal_user),
            idea: post,
            parent: parent,
            created_at: Faker::Date.between(from: (parent ? parent.created_at : post.published_at), to: Time.zone.now)
          })
          User.all.each do |u|
            if rand(5) < 2
              Reaction.create!(reactable: c, user: u, mode: 'up',
                created_at: Faker::Date.between(from: c.created_at, to: Time.zone.now))
            end
          end
          create_comment_tree(post, c, depth + 1)
        end
      end

      # @return [Hash] multiloc hash
      def create_for_some_locales
        translations = {}
        show_en = (rand(6) == 0)
        translations['en'] = yield if show_en
        translations['nl-BE'] = yield if rand(6) == 0 || !show_en
        translations
      end

      def generate_avatar(gender)
        i = rand(2..9)
        unless %w[male female].include? gender
          gender = %w[male female][rand(2)]
        end
        Rails.root.join("spec/fixtures/#{gender}_avatar_#{i}.jpg").open
      end

      # @return [Hash]
      def generate_file_attributes
        {
          file_by_content: {
            name: Faker::File.file_name(ext: 'pdf').split('/').last,
            content: Rails.root.join('spec/fixtures/afvalkalender.pdf').open
          }
        }
      end

      # @return [Boolean] true if an empty tenant should be created
      def create_empty_tenant?
        @create_empty_tenant
      end
    end
  end
end
