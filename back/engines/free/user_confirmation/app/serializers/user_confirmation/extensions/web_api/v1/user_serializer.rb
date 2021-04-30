module UserConfirmation
  module Extensions
    module WebApi
      module V1
        module UserSerializer
          def self.included(base)
            base.class_eval do
              base.attribute(:confirmation_required) { |user| user.confirmation_required? }
            end
          end
        end
      end
    end
  end
end
