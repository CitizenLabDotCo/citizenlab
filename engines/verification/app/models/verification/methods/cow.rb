module Verification
  module Methods
    class Cow
      include VerificationMethod

      def veritication_method_type
        :manual_sync
      end

      def id
        "7ccd453d-0eaf-412a-94a2-ae703b1b3e3f"
      end

      def name
        "cow"
      end

      def config_parameters
        []
      end

      def verification_parameters
        [:run, :id_serial]
      end

      def verify_sync run:, id_serial:
        raise VerificationService::ParameterInvalidError.new("run") unless run_valid?(run)
        raise VerificationService::ParameterInvalidError.new("id_serial") unless id_serial_valid?(id_serial)

        #TODO real implementation
        if run == '11.111.111-1'
          raise VerificationService::NoMatchError.new
        end

        "#{run}#{id_serial}"
      end

      private

      def run_valid? run
        run.present? && /^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/.match?(run)
      end

      def id_serial_valid? id_serial
        id_serial.present?
      end
    end
  end
end