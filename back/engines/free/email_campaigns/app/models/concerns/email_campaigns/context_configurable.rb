module EmailCampaigns
  module ContextConfigurable
    extend ActiveSupport::Concern

    included do
      validates :context_type, inclusion: { in: ->(record) { [record.class.supported_context_class.to_s] }, allow_blank: true }
    end

    class_methods do
      def supports_context?(context)
        context.is_a?(supported_context_class)
      end

      def supports_phase_participation_method?(phase)
        phase.is_a?(Phase) && phase.pmethod.supported_email_campaigns.include?(campaign_name)
      end

      def supported_context_class
        raise NotImplementedError, "You must define `supported_context_class` in #{name}"
      end
    end
  end
end
