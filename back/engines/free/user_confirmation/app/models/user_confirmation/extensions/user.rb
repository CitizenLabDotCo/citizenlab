module UserConfirmation
  module Extensions
    module User
      def self.included(base)
        base.class_eval do
          after_validation :reset_account_verification_code, if: :will_save_change_to_email?
          after_create :send_account_verification_code, if: :saved_change_to_account_verification_code?
        end
      end

      private

      def send_account_verification_code
        SendConfirmationCode.call(user: self)
      end

      def reset_account_verification_code
        self.account_verification_code = ConfirmationCodeGenerator.call
      end
    end
  end
end
