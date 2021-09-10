puts "loading '#{__FILE__}'"

Kaminari.configure do |config|
  config.default_per_page = 250
end