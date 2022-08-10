# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Migrate old text field values into new select field'
  task :text_to_select, %i[host old_text_field new_select_field] => [:environment] do |_t, args|
    include Gem::Text
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      custom_field_id = CustomField.where({ resource_type: User.name, key: args[:new_select_field] }).pick(:id)
      select_field_options = CustomFieldOption.where(custom_field_id: custom_field_id).pluck(:key)
      users = User
        .where('custom_field_values::jsonb ? :key', key: args[:old_text_field])
        .where.not('custom_field_values::jsonb ? :key', key: args[:new_select_field])
      users_ids = users.pluck(:id)

      users_updates = []
      value_matches = []

      # find most similar option to the user custom text field
      users.each do |user|
        scored_options = []
        select_field_options.each do |option|
          scored_option = { option: option }
          scored_option[:score] = levenshtein_distance(user.custom_field_values[args[:old_text_field]], option)
          scored_options.push(scored_option)
        end
        best_option = scored_options.min_by { |opt| opt[:score] }[:option]
        users_updates.push([user.id, best_option])
        value_matches.push("#{user.custom_field_values[args[:old_text_field]]} -> #{best_option}")
      end

      counter = Hash.new(0)
      value_matches.each do |v|
        counter[v] += 1
      end
      counter = counter.sort_by { |_key, value| value }
      counter.each do |value_match, count|
        puts "(#{count} ocurrences) #{value_match}"
      end

      puts "\n Do you want to persist this change? [Y/N]"
      answer = $stdin.gets.chomp
      return false unless answer == 'Y'

      users_updates.each do |user_id, new_option|
        user = User.find(user_id)
        user.custom_field_values[args[:new_select_field]] = new_option
        user.save
      end
      puts '=' * 50, "Users affected: #{users.length}", '-' * 50, users_ids, '=' * 50
    end
  end
end
