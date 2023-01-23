# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Users < Base
      attr_reader :anonymizer

      ADMIN_ATTRS = {
        id: '386d255e-2ff1-4192-8e50-b3022576be50',
        email: 'admin@citizenlab.co',
        password: 'democracy2.0',
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
        random_user = anonymizer.anonymized_attributes(AppConfiguration.instance.settings('core', 'locales'))
        User.create!(random_user.merge({ **admin_attrs, id: 'e0d698fc-5969-439f-9fe6-e74fe82b567a' }))
      end

      def run_for_localhost
        locales = AppConfiguration.instance.settings('core', 'locales')
        User.create! anonymizer.anonymized_attributes(locales).merge(admin_attrs)
        User.create! anonymizer.anonymized_attributes(locales).merge(moderator_attrs)
        User.create! anonymizer.anonymized_attributes(locales).merge(user_attrs)

        runner.num_users.times do
          User.create! anonymizer.anonymized_attributes(locales).merge({ password: 'democracy2.0' })
        end
      end

      def admin_attrs
        ADMIN_ATTRS
      end

      def moderator_attrs
        MODERATOR_ATTRS
      end

      def user_attrs
        USER_ATTRS
      end
    end
  end
end
