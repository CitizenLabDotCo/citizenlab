# frozen_string_literal: true

class UserExceedsSeatsService
  def initialize(params)
    @seat_type = params[:seat_type]
    @user = find_user_by_params(params)
    @core = AppConfiguration.instance.settings('core')
  end

  def execute
    if @seat_type == 'moderator'
      # If user is already admin or moderator, no extra
      # seat is needed
      return false unless @user.highest_role == :user

      max_moderators = @core['maximum_moderators_number']

      # If max_moderators is nil, unlimited moderators are allowed
      return false if max_moderators.nil?

      additional_moderators = @core['additional_moderators_number'] || 0
      total_max_moderators = max_moderators + additional_moderators
      current_moderators = User.billed_moderators.count

      return current_moderators + 1 > total_max_moderators
    else
      # If user is already admin, no extra seat is needed
      # (should not be possible but checking anyway)
      return false if @user.admin? || @user.super_admin?

      max_admins = @core['maximum_admins_number']

      # If max_admins is nil, unlimited admins are allowed
      return false if max_admins.nil?

      additional_admins = @core['additional_admins_number'] || 0
      total_max_admins = max_admins + additional_admins
      current_admins = User.billed_admins.count

      return current_admins + 1 > total_max_admins
    end
  end

  private

  def find_user_by_params(params)
    if params[:user_id].present?
      User.find(params[:user_id])
    elsif params[:user_email].present?
      User.find_by!(email: params[:user_email])
    else
      raise ActiveRecord::RecordNotFound, 'Must provide either user_id or user_email'
    end
  end
end
