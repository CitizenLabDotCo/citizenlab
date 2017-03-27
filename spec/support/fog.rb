Fog::Mock.delay = 0

RSpec.configure do |config|
  config.before :all do
    Fog.mock!
  end

  config.after :all do
    Fog.unmock!
  end
end
