class SideFxUserService

  include SideFxHelper

  def before_create user, current_user
    if User.admin.empty?
      user.add_role 'admin'
    end
    if (CustomField.where(enabled: true).count == 0) && (user.invite_status != 'pending')
      user.registration_completed_at ||= Time.now
    end
  end

  def after_create user, current_user
    IdentifyToSegmentJob.perform_later(user)
    GenerateUserAvatarJob.perform_later(user)
    LogActivityJob.set(wait: 10.seconds).perform_later(user, 'created', user, user.created_at.to_i)
    if user.registration_completed_at
      LogActivityJob.perform_later(user, 'completed_registration', user, user.created_at.to_i)
    end
    if user.admin? # or User.admin.count == 1
      LogActivityJob.set(wait: 5.seconds).perform_later(user, 'admin_rights_given', current_user, user.created_at.to_i)
    end
  end

  def after_update user, current_user
    IdentifyToSegmentJob.perform_later(user)
    LogActivityJob.perform_later(user, 'changed', current_user, user.updated_at.to_i)
    if user.registration_completed_at_previously_changed?
      LogActivityJob.perform_later(user, 'completed_registration', current_user, user.updated_at.to_i)
    end
    if changed_to_admin? user
      LogActivityJob.set(wait: 5.seconds).perform_later(user, 'admin_rights_given', current_user, user.updated_at.to_i)
      current_user_serializer = "WebApi::V1::External::UserSerializer".constantize
      serialized_current_user = ActiveModelSerializers::SerializableResource.new(current_user, {
        serializer: current_user_serializer,
        adapter: :json
       }).serializable_hash
      LogActivityJob.set(wait: 5.seconds).perform_later(
        user, 'admin_rights_received', 
        user, user.updated_at.to_i, 
        payload: {initiator: serialized_current_user}
        ) 
    end
  end

  def after_destroy frozen_user, current_user
    serialized_user = clean_time_attributes(frozen_user.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_user), 'deleted', current_user, Time.now.to_i, payload: {user: serialized_user})
  end


  private

  def changed_to_admin? user
    if user.roles_previously_changed?
      user.admin? && !user.roles_previous_change.first.find{|r| r == {"type"=>"admin"}}
    else
      false
    end
  end

end