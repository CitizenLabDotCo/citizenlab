# frozen_string_literal: true

class Invites::SeatsCounter
  def count_new_seats(&_block)
    new_admins_number = nil
    new_project_moderators_number = nil
    User.transaction do
      yield
      new_admins_number = User.billed_admins.count
      new_project_moderators_number = User.billed_moderators.count
      # https://api.rubyonrails.org/classes/ActiveRecord/Rollback.html
      raise ActiveRecord::Rollback
    end

    {
      newly_added_admins_number: new_admins_number - User.billed_admins.count,
      newly_added_project_moderators_number: new_project_moderators_number - User.billed_moderators.count
    }
  end
end
