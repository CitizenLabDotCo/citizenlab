# frozen_string_literal: true

module Verification
  class VerificationService
    def initialize
      @id_method_service = IdMethodService.new
    end

    def find_verification_group(groups)
      groups.select { |group| group.membership_type == 'rules' }.find do |group|
        group.rules.find do |rule|
          rule['ruleType'] == 'verified' && rule['predicate'] == 'is_verified'
        end
      end
    end

    # Methods that can be used to verify user identities. Subset of
    # `configured_methods` that excludes login-only SSO methods.
    # @param [AppConfiguration] app_configuration
    def active_methods(app_configuration)
      @id_method_service.configured_methods(app_configuration).select(&:verification?)
    end

    # @param [AppConfiguration] configuration
    # @return [Boolean]
    def active?(configuration, method_name)
      active_methods(configuration).include? @id_method_service.method_by_name(method_name)
    end

    def method_by_name(method_name)
      active_methods(AppConfiguration.instance).find { |method| method.name == method_name }
    end

    # Not all verification methods are allowed at a permission/action level
    # NOTE: for real platforms, you should never have
    # more than one verification method enabled at a time.
    def first_method_enabled_for_verified_actions
      active_methods(AppConfiguration.instance).find do |method|
        method.respond_to?(:enabled_for_verified_actions?) && method.enabled_for_verified_actions?
      end
    end

    # NOTE: for real platforms, you should never have
    # more than one verification method enabled at a time.
    def first_method_enabled
      active_methods(AppConfiguration.instance).first
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
      method = @id_method_service.method_by_name(method_name)
      response = method.verify_sync(**verification_parameters)
      uid = response[:uid]
      user_attributes = response[:attributes] || {}
      user.update_merging_custom_fields!(
        user_attributes.merge(custom_field_values: response[:custom_field_values] || {})
      )
      make_verification(user:, method:, uid:)
    end

    def verify_omniauth(user:, auth:)
      method = @id_method_service.method_by_name(auth.provider)
      # Login-only SSO methods (e.g. Hoplr, Vienna) cannot verify identities.
      raise NoMatchError unless method.respond_to?(:verification?) && method.verification?

      if method.respond_to?(:entitled?)
        entitled = method.entitled?(auth) # NOTE: Some methods raise more detailed NotEntitledErrors themselves
        raise NotEntitledError if !entitled
      end

      uid = method.profile_to_uid(auth)
      make_verification(user:, method:, uid:)
    end

    def locked_attributes(user)
      method_names = user.verifications.active.pluck(:method_name).uniq || []
      attributes = method_names.flat_map do |method_name|
        ver_method = @id_method_service.method_by_name(method_name)
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
        ver_method = @id_method_service.method_by_name(method_name)
        if ver_method.respond_to? :locked_custom_fields
          ver_method.locked_custom_fields
        else
          []
        end
      end

      # Only return the locked custom fields if they exist
      CustomField.where(key: custom_fields).pluck(:key).map(&:to_sym)
    end

    def verifications_by_uid(uid, method)
      ::Verification::Verification.where(
        active: true,
        hashed_uid: hashed_uid(uid, method.name_for_hashing)
      )
    end

    private

    def make_verification(user:, uid:, method:)
      existing_users = existing_verified_users(user, uid, method)
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
        method_name: method.name_for_hashing,
        hashed_uid: hashed_uid(uid, method.name_for_hashing),
        user: user,
        active: true
      )

      sfxv_service = SideFxVerificationService.new

      sfxv_service.before_create(verification, user)
      ActiveRecord::Base.transaction do
        verification.save!
        sfxv_service.after_create(verification, user)
      end

      verification
    end

    def existing_verified_users(user, uid, method)
      verifications_by_uid(uid, method)
        .where.not(user: user)
        .includes(:user).map(&:user)
    end

    def hashed_uid(uid, method_name_for_hashing)
      Digest::SHA256.hexdigest "#{method_name_for_hashing}-#{uid}"
    end
  end
end
