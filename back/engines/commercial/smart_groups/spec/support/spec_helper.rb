RSpec.configure do |config|
  config.before(:suite) do
    I18n.load_path += Dir[Rails.root.join('engines/commercial/smart_groups/spec/fixtures/locales/*.yml')]
  end
end
