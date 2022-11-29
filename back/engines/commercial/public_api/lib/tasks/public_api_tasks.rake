# frozen_string_literal: true

desc 'Public API'
namespace :public_api do
  # https://www.notion.so/citizenlab/Receive-public-API-credentials-72b6a21ca8e6445f856f26a18757d1c8
  task :create_client, [:tenant_host] => :environment do |_t, args|
    tenant = Tenant.find_by(host: args[:tenant_host])

    client = PublicApi::ApiClient.create(tenant: tenant)
    data = { client_id: client.id, client_secret: client.secret }
    puts 'API client is created. This data should be used for API requests:'
    puts data.to_json
    puts
    puts 'Run this command on your local machine to generate an encrypted zip file:'
    puts "echo '#{data.to_json}' > credentials.json && zip --encrypt credentials.zip credentials.json; rm credentials.json; unset HISTFILE"
    puts
    puts 'You can use this randomly generated password for encryption:'
    puts SecureRandom.urlsafe_base64.first(12)
  end
end
