RSpec.configure do |config|
  config.before(:suite, type: :mailer) do
    I18n.load_path += Dir[Rails.root.join('engines/*/*/spec/fixtures/locales/mailers.*.yml')]
  end
end
