module UserConfirmation
  module Extensions
    module WebApi
      module V1
        module UserSerializer
          def self.included(base)
            base.class_eval do
              base.attributes :email_confirmed_at
              base.attribute(:requires_confirmation) { |user| user.requires_confirmation? }
            end
          end
        end
      end
    end
  end
end
