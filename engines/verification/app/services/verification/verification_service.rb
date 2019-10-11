module Verification
  class VerificationService

    def all_methods
      [
        Methods::Cow.new
      ]
    end

    def find_verification_group groups
      groups.select{|group| group.membership_type == 'rules'}.find do |group|
        group.rules.find do |rule|
          rule['ruleType'] == 'verified' && rule['predicate'] == 'is_verified'
        end
      end
    end

  end
end