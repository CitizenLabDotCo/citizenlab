
IntercomInstance = if ENV.fetch("INTERCOM_TOKEN", false)
  Intercom::Client.new(token: ENV.fetch("INTERCOM_TOKEN"))
else
  nil
end
