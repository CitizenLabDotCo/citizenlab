# frozen_string_literal: true

module MultiTenancy
  module Patches
    module PublishActivityToRabbitJob
      def event_from(activity)
        event = super
        event.merge!(TrackingTenantService.new.environment_properties)
      end
    end
  end
end

PublishActivityToRabbitJob.prepend(MultiTenancy::Patches::PublishActivityToRabbitJob)
