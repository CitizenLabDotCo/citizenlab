# frozen_string_literal: true

class UserExceedsSeatsService
  def initialize(params)
    @seat_type = params['seat_type']
    @user = find_user_by_params(params)
    @core = AppConfiguration.instance.settings('core')
  end

  def execute
    if @seat_type == 'moderator'
      check_moderator_seats
    else
      check_admin_seats
    end
  end

  private

  def check_moderator_seats
    # If user exists and is already admin or moderator, no extra seat is needed
    # If user does not exist, treat as new user needing a seat
    return false if @user && @user.highest_role != :user

    max_moderators = @core['maximum_moderators_number']

    # If max_moderators is nil, unlimited moderators are allowed
    return false if max_moderators.nil?

    additional_moderators = @core['additional_moderators_number'] || 0
    total_max_moderators = max_moderators + additional_moderators
    current_moderators = User.billed_moderators.count

    current_moderators + 1 > total_max_moderators
  end

  def check_admin_seats
    # If user exists and is already admin, no extra seat is needed
    # If user does not exist, treat as new user needing a seat
    return false if @user && (@user.admin? || @user.super_admin?)

    max_admins = @core['maximum_admins_number']

    # If max_admins is nil, unlimited admins are allowed
    return false if max_admins.nil?

    additional_admins = @core['additional_admins_number'] || 0
    total_max_admins = max_admins + additional_admins
    current_admins = User.billed_admins.count

    current_admins + 1 > total_max_admins
  end

  def find_user_by_params(params)
    if params['user_id'].present?
      User.find(params['user_id'])
    elsif params['user_email'].present?
      # Return nil if user doesn't exist (will be treated as new user needing a seat)
      User.find_by(email: params['user_email'])
    else
      raise ActiveRecord::RecordNotFound, 'Must provide either user_id or user_email'
    end
  end
end
