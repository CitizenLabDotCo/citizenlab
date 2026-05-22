module WebApi
  module V1
    class SmsTestController < ApplicationController
      skip_before_action :authenticate_user, only: %i[test_sms]

      def test_sms
        skip_authorization

        phone_number = '+15005550006'
        message = "Test SMS from CitizenLab at #{Time.current}"

        begin
          result = SmsService.new.send_sms(phone_number, message)
          render json: {
            success: true,
            message: 'SMS sent successfully',
            twilio: {
              sid: result.sid,
              status: result.status,
              to: result.to,
              from: result.from,
              body: result.body,
              error_code: result.error_code,
              error_message: result.error_message,
              date_created: result.date_created,
              date_sent: result.date_sent
            }
          }, status: :ok
        rescue StandardError => e
          render json: { error: e.message }, status: :unprocessable_entity
        end
      end
    end
  end
end
