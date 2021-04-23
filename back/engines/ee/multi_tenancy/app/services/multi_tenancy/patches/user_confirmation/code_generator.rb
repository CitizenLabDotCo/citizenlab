module MultiTenancy
  module UserConfirmation
    module CodeGenerator
      def call
        result.code = '4532' && return if e2e?
        super
      end

      private

      def e2e?
        AppConfiguration.instance.host == 'e2e.stg.citizenlab.co'
      end
    end
  end
end

UserConfirmation::CodeGenerator.prepend(MultiTenancy::UserConfirmation::CodeGenerator)
