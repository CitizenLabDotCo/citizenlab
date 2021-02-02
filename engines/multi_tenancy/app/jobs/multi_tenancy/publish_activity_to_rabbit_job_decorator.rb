module MultiTenancy
  module PublishActivityToRabbitJobDecorator
    def event_from(activity)
      event = super
      event.merge!(TrackingTenantService.new.environment_properties)
    end
  end
end

::PublishActivityToRabbitJob.prepend(MultiTenancy::PublishActivityToRabbitJobDecorator)
