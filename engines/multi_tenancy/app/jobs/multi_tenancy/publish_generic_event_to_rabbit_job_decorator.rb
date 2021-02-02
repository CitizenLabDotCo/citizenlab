module MultiTenancy
  module PublishGenericEventToRabbitJobDecorator

    def add_extra_properties(event)
      super
      add_tenant_properties(event)
    end

    def add_tenant_properties(event)
      tenant_properties = TrackingService.new.tenant_properties(Tenant.current)
      event.merge!(tenant_properties)
    rescue ActiveRecord::RecordNotFound
      # Tenant can't be found, so we don't add anything
    end

  end
end

::PublishGenericEventToRabbitJob.prepend(MultiTenancy::PublishGenericEventToRabbitJobDecorator)