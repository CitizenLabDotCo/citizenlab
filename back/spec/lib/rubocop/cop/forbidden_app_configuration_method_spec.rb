require 'rubocop_spec_helper'

require './lib/rubocop/cop/forbidden_app_configuration_method'

RSpec.describe RuboCop::Cop::ForbiddenAppConfigurationMethod, :config do
  it 'registers an offense when using `.find`' do
    expect_offense(<<~RUBY)
      AppConfiguration.find
      ^^^^^^^^^^^^^^^^^^^^^ `AppConfiguration.instance` should be used to access the app configuration.
    RUBY
  end

  it 'registers an offense even when accessing AppConfiguration from the top level' do
    expect_offense(<<~RUBY)
      ::AppConfiguration.first!
      ^^^^^^^^^^^^^^^^^^^^^^^^^ `AppConfiguration.instance` should be used to access the app configuration.
    RUBY
  end

  it 'does not register an offense when using `.instance`' do
    expect_no_offenses(<<~RUBY)
      AppConfiguration.instance
      ::AppConfiguration.instance
    RUBY
  end
end
