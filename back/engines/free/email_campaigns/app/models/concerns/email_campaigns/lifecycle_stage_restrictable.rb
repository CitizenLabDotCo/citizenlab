# frozen_string_literal: true

module EmailCampaigns
  module LifecycleStageRestrictable
    extend ActiveSupport::Concern

    module ClassMethods
      attr_reader :allowed_lifecycle_stages

      private

      def allow_lifecycle_stages(except: nil, only: nil)
        all = %w[trial expired_trial demo active churned not_applicable]
        only ||= all
        except ||= []

        @allowed_lifecycle_stages = (all & only) - except
      end
    end

    included do
      filter :allowed_lifecycle_stage?
    end

    def allowed_lifecycle_stage?(_options = {})
      self.class.allowed_lifecycle_stages.include?(AppConfiguration.instance.settings('core', 'lifecycle_stage'))
    end
  end
end
