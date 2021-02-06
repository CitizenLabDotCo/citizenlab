module Seo
  class ApplicationSubscriber
    def self.listen
      conn = Bunny.new(ENV.fetch('RABBITMQ_URI'))
      conn.start

      ch = conn.create_channel
      x = ch.topic('cl2back')

      listen_ideas ch, x
      listen_tenants ch, x
    end

    def self.listen_ideas(ch, x)
      ch.queue('cl2seo.idea_publishing', auto_delete: true)
        .bind(x, routing_key: 'idea.published')
        .subscribe do |delivery_info, _properties, payload_json|
          payload = JSON.parse(payload_json)
          puts "*** #{delivery_info[:routing_key]} received for #{payload['item_type']} #{payload['item_id']}"
          idea_url = payload.dig('item_content', 'idea', 'url')
          tenant_id = payload.dig('tenantId')
          scrape_facebook(tenant_id, idea_url)
        end

      ch.queue('cl2seo.idea_changing', auto_delete: true)
        .bind(x, routing_key: 'idea.changed')
        .subscribe do |delivery_info, _properties, payload_json|
          payload = JSON.parse(payload_json)
          puts "*** #{delivery_info[:routing_key]} received for #{payload['item_type']} #{payload['item_id']}"
          idea_url = payload.dig('item_content', 'idea', 'url')
          tenant_id = payload.dig('tenantId')
          scrape_facebook(tenant_id, idea_url)
        end
    end

    def self.listen_tenants(ch, x)
      ch.queue('cl2seo.lifecycle_stage_changing', auto_delete: true)
        .bind(x, routing_key: 'tenant.changed_lifecycle_stage')
        .subscribe do |delivery_info, _properties, payload_json|
          payload = JSON.parse(payload_json)
          puts "*** #{delivery_info[:routing_key]} received for #{payload['item_type']} #{payload['item_id']}"
          previous_lifecycle_stage, new_lifecycle_stage = payload.dig('payload', 'changes')
          if new_lifecycle_stage == 'active'
            host = payload.dig('item_content', 'tenant', 'host')
            submit_to_google host
          else
            puts 'Lifecycle stage not changing from demo to active, doing nothing'
          end
        end

      ch.queue('cl2seo.host_changing', auto_delete: true)
        .bind(x, routing_key: 'tenant.changed_host')
        .subscribe do |delivery_info, _properties, payload_json|
          payload = JSON.parse(payload_json)
          puts "*** #{delivery_info[:routing_key]} received for #{payload['item_type']} #{payload['item_id']}"
          lifecycle_stage = payload.dig('item_content', 'tenant', 'settings', 'core', 'lifecycle_stage')

          if lifecycle_stage == 'active'
            host = payload.dig('item_content', 'tenant', 'host')
            submit_to_google host
          else
            'Lifecycle stage is not active, doing nothing'
          end
        end

      ch.queue('cl2seo.tenant_creating', auto_delete: true)
        .bind(x, routing_key: 'tenant.created')
        .subscribe do |delivery_info, _properties, payload_json|
          payload = JSON.parse(payload_json)
          puts "*** #{delivery_info[:routing_key]} received for #{payload['item_type']} #{payload['item_id']}"
          lifecycle_stage = payload.dig('item_content', 'tenant', 'settings', 'core', 'lifecycle_stage')

          if lifecycle_stage == 'active'
            host = payload.dig('item_content', 'tenant', 'host')
            submit_to_google host
          else
            puts 'Lifecycle is stage not active, doing nothing'
          end
        end
    end

    def self.submit_to_google(host)
      if RACK_ENV == 'production'
        url = "https://#{host}"
        google_handler = GoogleHandler.new

        google_handler.verify_domain host unless url.end_with? 'citizenlab.co'

        google_handler.submit_to_search_console url
        puts 'Submitted site to google search console'
        google_handler.submit_sitemap url
        puts 'Submitted sitemap to google'
      end
    end

    def self.scrape_facebook(tenant_id, url)
      if RACK_ENV == 'production'
        facebook_settings = AdminAPI::Client.query(
          AdminAPI::TenantFacebookSettings,
          variables: { id: tenant_id }
        )

        app_id = facebook_settings.data.tenant.settings.facebook_login_app_id
        app_secret = facebook_settings.data.tenant.settings.facebook_login_app_secret

        facebook_handler = FacebookHandler.new app_id, app_secret

        puts "Making facebook scrape #{url}:"
        puts facebook_handler.scrape url
      end
    end
  end
end
