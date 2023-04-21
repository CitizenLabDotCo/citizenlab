# frozen_string_literal: true

class AdditionalSeatsIncrementer
  class << self
    def increment_if_necessary(updated_user, current_user)
      role = (updated_user.roles - updated_user.roles_previously_was).first
      return if role.nil?
      return unless increment?(role['type'])

      increment!(role['type'])
      LogActivityJob.perform_later(updated_user, 'additional_seats_number_incremented',
        current_user, Time.now.to_i,
        payload: { role: role })
    end

    private

    def increment!(seat_type)
      field =
        case seat_type
        when 'admin' then 'additional_admins_number'
        when 'project_moderator', 'project_folder_moderator' then 'additional_moderators_number'
        else
          raise ArgumentError
        end

      ActiveRecord::Base.uncached do # to make it less likely that we'll use stale data for increment
        config = AppConfiguration.first!
        config.settings['core'][field] ||= 0
        config.settings['core'][field] += 1
        config.save!
      end
    end

    def increment?(seat_type)
      max_field, add_field, used_seats =
        case seat_type
        when 'admin'
          ['maximum_admins_number', 'additional_admins_number', User.billed_admins.count]
        when 'project_moderator', 'project_folder_moderator'
          ['maximum_moderators_number', 'additional_moderators_number', User.billed_moderators.count]
        else
          raise ArgumentError
        end

      core = AppConfiguration.instance.settings['core']
      return false if core[max_field].nil?

      used_seats > core[max_field] + (core[add_field] || 0)
    end
  end
end
