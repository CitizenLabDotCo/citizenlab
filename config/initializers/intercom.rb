INTERCOM_CLIENT = ENV["INTERCOM_TOKEN"] ?
                    Intercom::Client.new(token: ENV["INTERCOM_TOKEN"]) : nil

