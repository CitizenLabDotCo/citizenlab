# frozen_string_literal: true

require_relative '../mailers/shared_examples_for_campaign_delivery_tracking'

RSpec.configure do |config|
  config.include EmailCampaigns::MailerHelper

  config.before(:suite) do
    I18n.load_path += Dir[Rails.root.join('engines/*/*/spec/fixtures/locales/mailers.*.yml')]
  end
end
