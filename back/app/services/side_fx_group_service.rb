class SideFxGroupService
  include SideFxHelper

  def before_create(group, user); end

  def after_create(group, user)
    LogActivityService.new.run(group, 'created', user, group.created_at.to_i)
    UpdateMemberCountJob.perform_now(group)
  end

  def before_update(group, user); end

  def after_update(group, user)
    LogActivityService.new.run(group, 'changed', user, group.updated_at.to_i)
    UpdateMemberCountJob.perform_now(group)
  end

  def before_destroy(group, user); end

  def after_destroy(frozen_group, user)
    serialized_group = clean_time_attributes(frozen_group.attributes)
    LogActivityService.new.run(encode_frozen_resource(frozen_group), 'deleted', user, Time.now.to_i,
                                 payload: { group: serialized_group })
  end
end
