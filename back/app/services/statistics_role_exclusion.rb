# frozen_string_literal: true

# Single source of truth for whether admins and moderators should be left out
# of statistics, driven by the `exclude_admins_and_moderators_from_statistics`
# core setting, and for how to leave them out.
module StatisticsRoleExclusion
  def self.exclude_admins_and_moderators?
    AppConfiguration.instance.settings('core', 'exclude_admins_and_moderators_from_statistics') == true
  end

  # Leaves out the records whose `user_column` points to a user with an admin or
  # moderator role. Records without a known user (e.g. anonymous ones) are kept,
  # since we cannot tell whether they were made by an admin or moderator.
  def self.exclude_admin_and_moderator_records(records, user_column)
    records
      .where(user_column => nil)
      .or(records.where.not(user_column => User.not_normal_user.select(:id)))
  end
end
