# frozen_string_literal: true

RSpec.configure do |config|
  config.include EmailCampaigns::MailerHelper

  config.before(:suite) do
    I18n.load_path += Dir[Rails.root.join('engines/*/*/spec/fixtures/locales/mailers.*.yml')]
  end
end
