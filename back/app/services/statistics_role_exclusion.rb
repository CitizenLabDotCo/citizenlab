# frozen_string_literal: true

# Single source of truth for whether admins and moderators should be left out
# of statistics, driven by the `exclude_admins_and_moderators_from_statistics`
# core setting.
module StatisticsRoleExclusion
  def self.exclude_admins_and_moderators?
    AppConfiguration.instance.settings('core', 'exclude_admins_and_moderators_from_statistics') == true
  end
end
