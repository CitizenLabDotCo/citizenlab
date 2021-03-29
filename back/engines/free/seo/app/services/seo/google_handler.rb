require 'googleauth'
require 'google/apis/webmasters_v3'
require 'google/apis/site_verification_v1'
require 'aws-sdk-route53'

module Seo
  class GoogleHandler
    attr_reader :r53

    def initialize
      @r53 = Aws::Route53::Client.new
    end

    def verify_domain(domain)
      return if api_keys_missing?

      result = resquest_token_for_domain(domain)

      Rails.logger.info "Got verification token request result #{result.to_h}"
      cname_subdomain, cname_value = result.token.split

      Rails.logger.info "Placing CNAME google verification record in #{domain}"
      add_token_record domain, "#{cname_subdomain}.#{domain}", cname_value

      Rails.logger.info 'Waiting 4 minutes for DNS propagation before asking Google to verify'
      sleep 4 * 60

      verify_and_insert_resource(domain, service)
    end

    def submit_to_search_console(url)
      return if api_keys_missing?

      authenticated_webmasters_api.add_site(url)
    end

    def submit_sitemap(url)
      return if api_keys_missing?

      authenticated_webmasters_api.submit_sitemap(url, "#{url}/sitemap.xml")
    end

    private

    def api_keys_missing?
      ENV.values_at('GOOGLE_SEARCH_CONSOLE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY').any?(&:blank?)
    end

    def hosted_zones
      r53.list_hosted_zones.hosted_zones
    end

    def find_hosted_zone_for(host)
      hosted_zones.find do |zone|
        zone.name =~ /#{host}/
      end
    end

    def add_token_record(host, name, value)
      host = host[4..-1] if host.start_with? 'www.'

      zone = find_hosted_zone_for(host)

      unless zone
        raise "Tried to add CNAME token record to verify host #{host}, but the zone does not exist in Route 53"
      end

      r53_change_resource_record_sets(zone, name, value)
    end

    def authenticated_webmasters_api
      Google::Apis::WebmastersV3::WebmastersService.new.tap do |webmasters|
        webmasters.authorization = authenticate
      end
    end

    def authenticated_site_verification_api
      Google::Apis::SiteVerificationV1::SiteVerificationService.new.tap do |verification_service|
        verification_service.authorization = authenticate
      end
    end

    def authenticate
      # Hack to work around non-support of newlines in .env files in docker
      # See https://github.com/moby/moby/issues/12997
      ENV['GOOGLE_PRIVATE_KEY'] = ENV.fetch('GOOGLE_PRIVATE_KEY').gsub('\n', "\n")
      cred_scope = 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/siteverification'

      authorization = Google::Auth::ServiceAccountCredentials.make_creds(scope: cred_scope)
      authorization.dup.tap do |auth_client|
        auth_client.sub = ENV.fetch('GOOGLE_SEARCH_CONSOLE_ACCOUNT_EMAIL')
      end
    end

    def resquest_token_for_domain(domain)
      service = authenticated_site_verification_api
      token_request = Google::Apis::SiteVerificationV1::GetWebResourceTokenRequest.new(
        site: Google::Apis::SiteVerificationV1::GetWebResourceTokenRequest::Site.new(
          identifier: domain,
          type: 'INET_DOMAIN'
        ),
        verification_method: 'DNS_CNAME'
      )
      service.get_web_resource_token(token_request)
    end

    def verify_and_insert_resource(domain, service)
      verify_request = Google::Apis::SiteVerificationV1::SiteVerificationWebResourceResource.new(
        site: Google::Apis::SiteVerificationV1::SiteVerificationWebResourceResource::Site.new(
          identifier: domain,
          type: 'INET_DOMAIN'
        )
      )
      service.insert_web_resource('DNS_CNAME', verify_request)
    end

    # rubocop:disable Metrics/MethodLength
    def r53_change_resource_record_sets(zone, name, value)
      r53.change_resource_record_sets(
        hosted_zone_id: zone.id,
        change_batch: {
          changes: [
            {
              action: 'CREATE',
              resource_record_set: {
                name: name,
                resource_records: [{ value: value }],
                type: 'CNAME',
                ttl: 300
              }
            }
          ]
        }
      )
    end
    # rubocop:enable Metrics/MethodLength
  end
end
