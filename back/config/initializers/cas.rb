Rails.application.config.middleware.use OmniAuth::Builder do
  provider :cas, url: 'https://casserver.herokuapp.com/cas'
  # provider :cas, host: 'casserver.herokuapp.com'
end
