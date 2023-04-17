# frozen_string_literal: true

require 'csv'
require 'open-uri'

# This is very similar to reformat_and_insert_user_custom_field_key_value_pairs.rake, with the differences that here we
# we don't reformat the values, and we read a specific key-value pair from the CSV custom_field_values hashes provided.
#
# This is designed to meet a very specific need. It is not meant to be a general purpose tool.
#
# This is to be used when, for example, we know that many users have 'lost' a specific key-value pair from their
# User.custom_field_values hash, and we want to re-insert that key-value pair into the hash.
# This might be facilitated by downloading a db dump from a production server, from before the data was 'lost',
# saving the user ids and custom_field_values hashes from that dump to a CSV file, and then running this rake task.
#
# Here's an example SQL query to get the CSV data from a production db dump:
#   SELECT id, custom_field_values FROM cqc_citizenlab_co.users
#   WHERE (custom_field_values ? 'who_you_are')
#   ORDER BY id ASC
#
# Example:
# Given a CSV file with the following headers: "id","custom_field_values":
#   "id","custom_field_values"
#   "6c43614c-025d-4d4b-8288-e8060be6b59f","{""gender_1"": ""male"", ""who_you_are"": [""7"", ""17""]}"
#   "6c43614c-025d-4d4b-8288-e8060be6b59f","{""who_you_are"": [""9""]}"
#
# $ rake cl2_back:insert_user_custom_field_key_value_pairs['/cf_values.csv','cqc.citizenlab.co','who_you_are']
#
# Note: the specified key must be present in the custom_field_values hash for each row of data in the CSV.

namespace :cl2_back do
  desc 'Insert key-value pairs to user custom_field_values hashes.'
  task :insert_user_custom_field_key_value_pairs, %i[url host key] => [:environment] do |_t, args|
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    count = 0
    key = args[:key]

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      errors = []

      data.each do |d|
        user = User.find_by id: d['id']
        if user
          cfv = user.custom_field_values
          next if cfv[key].present?

          cfv[key] = JSON.parse(d['custom_field_values'])[key]
          user.update!(custom_field_values: cfv)
          count += 1
          puts "#{count}: custom_field_value inserted for user.id #{user.id}."
        else
          errors += ["Couldn't find user #{d['id']}"]
          puts "ERROR: Couldn't find user #{d['id']}"
        end
      end

      if errors.empty?
        puts "Success! #{count} user #{key} custom_field_values inserted."
      else
        puts 'Some errors occured!'
        errors.each { |l| puts l }
      end
    end
  end
end
