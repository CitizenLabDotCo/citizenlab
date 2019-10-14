module Verification
  module Methods
    class Cow

      def id
        "7ccd453d-0eaf-412a-94a2-ae703b1b3e3f"
      end

      def name
        "cow"
      end

      def config_parameters
        []
      end

      def verify_now run:, id_serial:
        #TODO real implementation
        "#{run}#{id_serial}"
      end

    end
  end
end