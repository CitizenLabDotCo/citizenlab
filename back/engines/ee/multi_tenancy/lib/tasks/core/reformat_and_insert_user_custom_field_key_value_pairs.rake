require 'csv'
require 'open-uri'

# Reformats the provided values: strips spaces and downcases all characters.
# Inserts the provided (reformatted) values into the user_custom_field_values table, as values for the provided key.
# Requires a two column csv file with the following 2 headers: "id","value".

# Example:
#
# Inserting postcode values for key: "postcode"
#
# postcodes.csv:
#   "id","value"
#   "6c43614c-025d-4d4b-8288-e8060be6b59f","1234  AB"
#   "0e39623a-a021-465c-8a42-aa94fbe46dac","1234ab"
#   "4614cbc2-548d-4d64-94da-0b4564be9a1d","1234 a  B"
#   ...
#
# $ rake cl2_back:reformat_and_insert_user_custom_field_key_value_pairs['/postcodes.csv','samen.schagen.nl','postcode']
#
# => Success! 385 user postcode custom_field_values inserted.
#
# Example insertions:
#   {} => {"postcode": "1234ab"}
#   {"gender": "unspecified","birthyear": 1976} => {"gender": "unspecified","postcode": "1234ab","birthyear": 1976}

# Note: This task will only succeed if all reformatted values match current options for the custom_field values.
# Also, it may be necessary to (temporarily) set custom registration fields to 'not required'
# to succesfully run this task.
# Remember to set them back to 'required' (especially on an active platform) after running this task.

namespace :cl2_back do
  desc "Reformat and insert key-value pairs to user custom_field_values hashes."
  task :reformat_and_insert_user_custom_field_key_value_pairs, [:url, :host, :key] => [:environment] do |t, args|
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    count = 0

    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      errors = []
      data.each do |d|
        user = User.find_by id: d['id']
        if user
          cfv = user.custom_field_values
          cfv[args[:key]] = d['value'].gsub(' ', '').downcase
          user.update!(custom_field_values: cfv)
          count += 1
        else
          errors += ["Couldn't find user #{d['id']}"]
        end
      end

      if errors.present?
        puts "Some errors occured!"
        errors.each{|l| puts l}
      else
        puts "Success! #{count} user #{args[:key]} custom_field_values inserted."
      end
    end
  end
end
