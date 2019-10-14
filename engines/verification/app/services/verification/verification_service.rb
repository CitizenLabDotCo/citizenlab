module Verification
  class VerificationService

    ALL_METHODS = [
      Methods::Cow.new
    ]

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

    def active_methods_for_tenant tenant
      if tenant.has_feature? 'verification'
        active_method_names = tenant.settings['verification']['verification_methods'].map do |vm|
          vm['name']
        end
        all_methods.select do |method|
          active_method_names.include? method.name
        end
      else
        []
      end
    end

    class VerificationNotFoundError < StandardError; end
    class VerificationTakenError < StandardError; end
    class VerificationNotAuthorizedError < StandardError; end


    def verify_now user:, method:, parameters:
      uid = method.verify_now parameters

      if ::Verification::Verification.where(
          active: true,
          hashed_uid: hashed_uid(uid, method.name)
        )
        .where.not(user: user)
        .exists?
        raise VerificationTakenError.new
      end

      verification = ::Verification::Verification.new(
        method_name: method.name,
        hashed_uid: hashed_uid(uid, method.name),
        user: user,
        active: true
      )

      ActiveRecord::Base.transaction do
        verification.save!
        user.update!(verified: true)
        verification
      end
    end

    def hashed_uid(uid, method_name)
      Digest::SHA256.hexdigest "#{method_name}-#{uid}"
    end

  end
end