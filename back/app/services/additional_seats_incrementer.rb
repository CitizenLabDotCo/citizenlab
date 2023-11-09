# frozen_string_literal: true

# Our current approach with AdditionalSeatsIncrementer called as a side effect works,
# but it requires an insane amount of tests to cover all the edge cases.

# Another approach of incrementing additional seats could be sending the new number (or the delta) from the FE.
# So, the FE just sends { new_additional_moderators: X, new_additional_admins: Y } and the BE applies this change.
# It would make the logic of update much simpler. Disadvantage: this way we couldn't log an activity with
# the specific user that caused the update (we could log an activity with HTTP request or some other info though).
#
# History: https://citizenlabco.slack.com/archives/C04SPA1LN74/p1682353783786709
#
class AdditionalSeatsIncrementer
  class << self
    def increment_if_necessary(updated_user, current_user)
      return unless AppConfiguration.instance.feature_activated?('seat_based_billing')

      roles = updated_user.roles - updated_user.roles_previously_was
      return if roles.blank?

      return if updated_user.highest_role_after_initialize == updated_user.highest_role

      role = highest_role(roles)
      return unless increment?(role['type'])

      increment!(role['type'])
      LogActivityJob.perform_later(updated_user, action_by_role_type(role['type']),
        current_user, Time.now.to_i,
        payload: { role: role })
    end

    private

    def highest_role(roles)
      roles.find { |role| role['type'] == 'admin' } || roles.first
    end

    def increment!(role_type)
      field =
        case role_type
        when 'admin' then 'additional_admins_number'
        when 'project_moderator', 'project_folder_moderator' then 'additional_moderators_number'
        else
          raise ArgumentError
        end

      ActiveRecord::Base.uncached do # to make it less likely that we'll use stale data for increment
        config = AppConfiguration.instance.reload
        config.settings['core'][field] ||= 0
        config.settings['core'][field] += 1
        config.save!
      end
    end

    def increment?(role_type)
      max_field, add_field, used_seats =
        case role_type
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

    def action_by_role_type(role_type)
      case role_type
      when 'admin' then 'additional_admins_number_incremented'
      when 'project_moderator', 'project_folder_moderator' then 'additional_moderators_number_incremented'
      else
        raise ArgumentError
      end
    end
  end
end
