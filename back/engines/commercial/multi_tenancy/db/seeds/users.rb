# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Users < Base
      attr_reader :anonymizer

      ADMIN_1_ATTRS = {
        id: '386d255e-2ff1-4192-8e50-b3022576be50',
        email: 'admin@citizenlab.co',
        password: 'democracy2.0',
        roles: [{ type: 'admin' }],
        locale: 'en'
      }.freeze

      ADMIN_2_ATTRS = {
        roles: [{ type: 'admin' }],
        locale: 'en'
      }.freeze

      MODERATOR_ATTRS = {
        id: '61caabce-f7e5-4804-b9df-36d7d7d73e4d',
        email: 'moderator@citizenlab.co',
        password: 'democracy2.0',
        roles: []
      }.freeze

      USER_ATTRS = {
        id: '546335a3-33b9-471c-a18a-d5b58ebf173a',
        email: 'user@citizenlab.co',
        password: 'democracy2.0',
        roles: []
      }.freeze

      def initialize(runner:)
        @anonymizer = AnonymizeUserService.new
        super
      end

      def run
        case Apartment::Tenant.current
        when 'empty_localhost'
          run_for_empty_localhost
        when 'localhost'
          run_for_localhost
        end
      end

      private

      def run_for_empty_localhost
        User.create!(attrs.merge({ **ADMIN_1_ATTRS, id: 'e0d698fc-5969-439f-9fe6-e74fe82b567a' }))
      end

      def run_for_localhost
        User.new(attrs.merge(ADMIN_1_ATTRS)).tap(&:confirm).save!
        User.new(attrs.merge(ADMIN_2_ATTRS)).tap(&:confirm).save!
        User.new(attrs.merge(MODERATOR_ATTRS)).tap(&:confirm).save!
        User.new(attrs.merge(USER_ATTRS)).tap(&:confirm).save!

        runner.num_users.times do
          User.new(attrs.merge({ password: 'democracy2.0' })).tap(&:confirm).save!
        end
      end

      def attrs
        locales = AppConfiguration.instance.settings('core', 'locales')
        anonymizer.anonymized_attributes(locales)
      end
    end
  end
end
