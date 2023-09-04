# frozen_string_literal: true

module Verification
  class VerificationService
    @all_methods = []

    class << self
      attr_reader :all_methods

      def add_method(verification_method)
        @all_methods.reject! { |m| m.id == verification_method.id }
        @all_methods << verification_method
      end
    end

    def initialize(sfxv_service = SideFxVerificationService.new)
      @sfxv_service = sfxv_service
    end

    def all_methods
      self.class.all_methods
    end

    def method_by_name(name)
      all_methods.find { |m| m.name == name }
    end

    def find_verification_group(groups)
      groups.select { |group| group.membership_type == 'rules' }.find do |group|
        group.rules.find do |rule|
          rule['ruleType'] == 'verified' && rule['predicate'] == 'is_verified'
        end
      end
    end

    # @param [AppConfiguration] app_configuration
    def active_methods(app_configuration)
      return [] unless app_configuration.feature_activated?('verification')

      active_methods = app_configuration.settings['verification']['verification_methods']
      active_method_names = active_methods.pluck('name')
      all_methods.select { |method| active_method_names.include?(method.name) }
    end

    # @param [AppConfiguration] configuration
    # @return [Boolean]
    def active?(configuration, method_name)
      active_methods(configuration).include? method_by_name(method_name)
    end

    class NoMatchError < StandardError; end

    class NotEntitledError < StandardError
      attr_reader :why

      def initialize(why = nil)
        super
        @why = why
      end
    end

    class VerificationTakenError < StandardError; end

    class ParameterInvalidError < StandardError; end

    def verify_sync(user:, method_name:, verification_parameters:)
      method = method_by_name(method_name)
      response = method.verify_sync verification_parameters
      uid = response[:uid]
      user_attributes = response[:attributes] || {}
      user.update_merging_custom_fields!(
        user_attributes.merge(custom_field_values: response[:custom_field_values] || {})
      )
      make_verification(user: user, method_name: method_name, uid: uid)
    end

    def verify_omniauth(user:, auth:)
      method = method_by_name(auth.provider)
      raise NotEntitledError if method.respond_to?(:entitled?) && !method.entitled?(auth)

      uid = if method.respond_to?(:profile_to_uid)
        method.profile_to_uid(auth)
      else
        auth['uid']
      end
      make_verification(user: user, method_name: method.name, uid: uid)
    end

    def locked_attributes(user)
      method_names = user.verifications.active.pluck(:method_name).uniq || []
      attributes = method_names.flat_map do |method_name|
        ver_method = method_by_name(method_name)
        if ver_method.respond_to? :locked_attributes
          ver_method.locked_attributes
        else
          []
        end
      end
      attributes.uniq
    end

    def locked_custom_fields(user)
      method_names = user.verifications.active.pluck(:method_name).uniq || []
      custom_fields = method_names.flat_map do |method_name|
        ver_method = method_by_name(method_name)
        if ver_method.respond_to? :locked_custom_fields
          ver_method.locked_custom_fields
        else
          []
        end
      end
      custom_fields.uniq
    end

    private

    def make_verification(user:, method_name:, uid:)
      existing_users = existing_verified_users(user, uid, method_name)
      taken = existing_users.present?

      if taken
        # it means sth went wrong and user wasn't fully created (e.g., they didn't enter email)
        if existing_users.all?(&:blank_and_can_be_deleted?)
          existing_users.each { |u| DeleteUserJob.perform_now(u) }
        else
          raise VerificationTakenError
        end
      end

      verification = ::Verification::Verification.new(
        method_name: method_name,
        hashed_uid: hashed_uid(uid, method_name),
        user: user,
        active: true
      )

      @sfxv_service.before_create(verification, user)
      ActiveRecord::Base.transaction do
        verification.save!
        @sfxv_service.after_create(verification, user)
      end

      verification
    end

    def existing_verified_users(user, uid, method_name)
      ::Verification::Verification.where(
        active: true,
        hashed_uid: hashed_uid(uid, method_name)
      )
        .where.not(user: user)
        .includes(:user).map(&:user)
    end

    def hashed_uid(uid, method_name)
      Digest::SHA256.hexdigest "#{method_name}-#{uid}"
    end
  end
end
