module Verification
  class VerificationService

    def all_methods
      [
        Methods::Cow.new
      ]
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

  end
end