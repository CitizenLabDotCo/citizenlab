module UserConfirmation
  module Extensions
    module WebApi
      module V1
        module UserSerializer
          def self.included(base)
            base.class_eval do
              base.attributes :email_confirmed_at
            end
          end
        end
      end
    end
  end
end
