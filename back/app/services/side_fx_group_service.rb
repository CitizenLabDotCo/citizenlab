# frozen_string_literal: true

class SideFxGroupService
  include SideFxHelper

  def before_create(group, user); end

  def after_create(group, user)
    LogActivityJob.perform_later(group, 'created', user, group.created_at.to_i)
    UpdateMemberCountJob.perform_now(group)
  end

  def before_update(group, user); end

  def after_update(group, user)
    LogActivityJob.perform_later(
      group,
      'changed',
      user,
      group.updated_at.to_i,
      payload: { changes: group.previous_changes }
    )
    UpdateMemberCountJob.perform_now(group)
  end

  def before_destroy(group, user); end

  def after_destroy(frozen_group, user)
    serialized_group = clean_time_attributes(frozen_group.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_group), 'deleted', user, Time.now.to_i,
      payload: { group: serialized_group })
  end
end
