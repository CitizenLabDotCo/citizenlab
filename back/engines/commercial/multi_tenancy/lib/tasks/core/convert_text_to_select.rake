# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Migrate old text field values into new select field'
  task :text_to_select, %i[host old_text_field new_select_field max_distance] => [:environment] do |_t, args|
    include Gem::Text
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      max_distance = args[:max_distance].to_i
      custom_field_id = CustomField.where({ resource_type: User.name, key: args[:new_select_field] }).pick(:id)
      select_field_options = CustomFieldOption.where(custom_field_id: custom_field_id).pluck(:key)
      users = User
        .where('custom_field_values::jsonb ? :key', key: args[:old_text_field])
        .where.not('custom_field_values::jsonb ? :key', key: args[:new_select_field])

      users_updates = []
      value_matches = []

      # find most similar option to each user's old text field
      users.each do |user|
        options = []
        select_field_options.each do |option_text|
          option = { option: option_text }
          text_value = user.custom_field_values[args[:old_text_field]].downcase.gsub(/\s+/, '')
          option[:distance] = levenshtein_distance(text_value, option_text)
          options.push(option)
        end
        best_option = options.min_by { |opt| opt[:distance] }
        users_updates.push([user.id, best_option[:option], best_option[:distance] <= max_distance])
        value_matches.push(["#{user.custom_field_values[args[:old_text_field]]} -> #{best_option[:option]}", best_option[:distance]])
      end

      # provide a summary of the changes and ask for confirmation
      counter = Hash.new(0)
      distances = {}
      value_matches.each do |v, s|
        distances[v] = s
        counter[v] += 1
      end
      distances = distances.sort_by { |_key, distance| distance }
      distances.each do |value_match, distance|
        puts "(ocurrences: #{counter[value_match]} distance: #{distance} updating: #{distance <= max_distance}) #{value_match}"
      end

      puts "\n You are going to update #{users_updates.count { |u| u[2] }} users out of the #{users_updates.length} users who filled the #{args[:old_text_field]} field but did not filled the #{args[:new_select_field]} field."
      puts "\n Continue? [Y/N]"
      answer = $stdin.gets.chomp
      return false unless answer == 'Y'

      puts 'Updating users with the following IDs:'
      puts users_updates.select { |u| u[2] }.pluck(0).join(' ')

      users_updates.each do |user_id, new_option, update|
        next unless update

        user = User.find(user_id)
        user.custom_field_values[args[:new_select_field]] = new_option
        user.save
      end
    end
  end
end
