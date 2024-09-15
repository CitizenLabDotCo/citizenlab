module ApplicationCable
  class Channel < ActionCable::Channel::Base
    before_subscribe :switch_tenant
    after_unsubscribe :unswitch_tenant

    def switch_tenant
      http_host = connection.env['HTTP_HOST']
      host = http_host.split(':').first
      tenant = Tenant.host_to_schema_name(host)
      Apartment::Tenant.switch!(tenant)
    end

    def unswitch_tenant
      Apartment::Tenant.reset
    end
  end
end
