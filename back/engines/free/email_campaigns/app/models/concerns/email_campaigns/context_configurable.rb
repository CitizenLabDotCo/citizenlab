# frozen_string_literal: true

module EmailCampaigns
  module ContextConfigurable
    extend ActiveSupport::Concern

    included do
      validates :context_type, inclusion: { in: proc { |record| record.class.supported_context.name }, allow_blank: true }
    end

    class_methods do
      def supports_context?(context)
        context.is_a?(supported_context)
      end

      def supported_context
        raise NotImplementedError, "#{name} must implement the supported_context class method"
      end
    end

    def conflicting_contexts
      return [] if context

      # rubocop:disable Style/InverseMethods
      conflicting_campaigns = self.class.where(type: self.class.name).where.not(context: nil).select do |campaign|
        enabled != campaign.enabled
      end
      # rubocop:enable Style/InverseMethods
      conflicting_campaigns.map(&:context)
    end
  end
end
