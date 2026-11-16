# frozen_string_literal: true

module ReportBuilder
  module Composition
    # What the model is told about the platform the report is for: who runs it, which
    # languages it speaks, what its colours are.
    #
    # Last in the system prompt, so everything before it is the same bytes for every
    # tenant and the provider's cache can carry across them.
    class TenantContext
      def initialize(locale:, configuration: AppConfiguration.instance)
        @locale = locale
        @configuration = configuration
      end

      def to_prompt_text
        <<~TEXT
          Organisation: #{organization_name}
          Platform locales: #{locales.join(', ')}. This report is written in "#{@locale}".
          Brand colours: primary #{setting('color_main')}, secondary #{setting('color_secondary')},
          text #{setting('color_text')}. In a block these are theme.colors.tenantPrimary,
          tenantSecondary and tenantText — never the hex values themselves.
        TEXT
      end

      private

      def organization_name
        multiloc = setting('organization_name') || {}
        multiloc[@locale].presence || multiloc.values.find(&:present?) || @configuration.name
      end

      def locales
        Array(setting('locales')).presence || [@locale]
      end

      def setting(key)
        @configuration.settings('core', key)
      end
    end
  end
end
