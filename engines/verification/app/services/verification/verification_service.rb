module Verification
  class VerificationService

    ALL_METHODS = [
      Methods::Cow.new,
      Methods::Bogus.new,
      OmniauthMethods::BosaFas.new,
      OmniauthMethods::FranceConnect.new,
      Methods::IdCardLookup.new,
    ]

    def initialize sfxv_service=SideFxVerificationService.new
      @sfxv_service = sfxv_service
    end

    def all_methods
      ALL_METHODS
    end

    def method_by_name name
      all_methods.find{|m| m.name == name}
    end

    def find_verification_group groups
      groups.select{|group| group.membership_type == 'rules'}.find do |group|
        group.rules.find do |rule|
          rule['ruleType'] == 'verified' && rule['predicate'] == 'is_verified'
        end
      end
    end


    # @param [AppConfiguration] app_configuration
    def active_methods(app_configuration)
      return [] unless app_configuration.has_feature?('verification')

      active_methods = app_configuration.settings['verification']['verification_methods']
      active_method_names = active_methods.map { |vm| vm['name'] }
      all_methods.select { |method| active_method_names.include?(method.name) }
    end

    # @param [AppConfiguration] configuration
    # @return [Boolean]
    def is_active?(configuration, method_name)
      active_methods(configuration).include? method_by_name(method_name)
    end

    class NoMatchError < StandardError; end
    class NotEntitledError < StandardError; end
    class VerificationTakenError < StandardError; end
    class ParameterInvalidError < StandardError; end

    def verify_sync user:, method_name:, verification_parameters:
      method = method_by_name(method_name)
      response = method.verify_sync verification_parameters
      uid = response[:uid]
      user_attributes = response[:attributes] || {}
      custom_field_values = response[:custom_field_values]&.stringify_keys || {}
      user.update!(
        **user_attributes,
        custom_field_values: user.custom_field_values.merge(custom_field_values)
      )
      make_verification(user: user, method_name: method_name, uid: uid)
    end

    def verify_omniauth user:, auth:
      method = method_by_name(auth.provider)
      if method.respond_to?(:entitled?) && !method.entitled?(auth)
        raise NotEntitledError.new
      end
      uid = if method.respond_to?(:profile_to_uid)
        method.profile_to_uid(auth)
      else
        auth['uid']
      end
      make_verification(user: user, method_name: method.name, uid: uid)
    end

    def locked_attributes user
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

    def locked_custom_fields user
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

    def make_verification user:, method_name:, uid:
      if taken?(user, uid, method_name)
        raise VerificationTakenError.new
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

    def taken?(user, uid, method_name)
      ::Verification::Verification.where(
        active: true,
        hashed_uid: hashed_uid(uid, method_name)
      )
      .where.not(user: user)
      .exists?
    end

    def hashed_uid(uid, method_name)
      Digest::SHA256.hexdigest "#{method_name}-#{uid}"
    end

  end
end
