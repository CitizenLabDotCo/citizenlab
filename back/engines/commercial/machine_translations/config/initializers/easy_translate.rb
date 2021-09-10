puts "loading '#{__FILE__}'"

EasyTranslate.api_key = ENV.fetch('GOOGLE_API_KEY', nil)