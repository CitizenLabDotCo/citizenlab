require 'csv'
require 'json'
require 'uri'
require 'net/http'

# Read the CSV file all_tenants_back_raw_04-12-23.csv
# and replace settings values with Settings['core']['lifecycle_stage']
# and hit the tenant host URL and record the response
# and write all to new csv file

table = CSV.parse(File.read('all_tenants_back_raw_04-12-23.csv'), headers: true)

File.open('tenants_responses.csv', 'w') do |f|
  f << "ID,Host,Lifecycle Stage,Created At,Response\n"
  table.by_row.each do |row|
    lifecycle = JSON.parse(row[2])['core']['lifecycle_stage']
    uri = URI("https://#{row[1]}/web_api/v1/app_configuration")
    response_error = nil

    begin
      res = Net::HTTP.get_response(uri)
    rescue SocketError => e
      response_error = "SocketError: #{e}"
    rescue Net::OpenTimeout => e
      response_error = "Net::OpenTimeout: #{e}"
    rescue StandardError => e
      response_error = "Error: #{e}"
    end

    response =
      if res.is_a?(Net::HTTPSuccess)
        begin
          if JSON.parse(res.body)['data']['id'] == row[0]
            '1. app_configuration success'
          else
            '2. app_configuration failure'
          end
        rescue StandardError => e
          "Error: #{e}"
        end
      elsif response_error
        response_error
      else
        'not success'
      end

    f << "#{row[0]},#{row[1]},#{lifecycle},#{row[3]},#{row[4]},#{response}\n"
  end
end

# uri = URI('https://meridianoneconsultation.co.uk/api/v1/tenants')
# begin
#   res = Net::HTTP.get_response(uri)
# rescue StandardError => e
#   puts "Error: #{e}"
# end

# begin
#   parsed = JSON.parse(res.body)['data']['id']
# rescue StandardError => e
#   puts "Error: #{e}"
# end
