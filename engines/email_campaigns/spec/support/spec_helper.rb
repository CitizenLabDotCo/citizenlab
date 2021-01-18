# frozen_string_literal: true

RSpec.configure do |config|
  config.before(:each, type: :mailer) do
    I18n.load_path += Dir[Rails.root.join('engines/email_campaigns/spec/fixtures/locales/mailers.*.yml')]
  end
end
