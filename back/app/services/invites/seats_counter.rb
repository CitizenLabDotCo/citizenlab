# frozen_string_literal: true

class Invites::SeatsCounter
  def count_in_transaction(&)
    new_admins_number = nil
    new_moderators_number = nil
    User.transaction do
      yield
      new_admins_number = User.billed_admins.count
      new_moderators_number = User.billed_moderators.count
      # https://api.rubyonrails.org/classes/ActiveRecord/Rollback.html
      raise ActiveRecord::Rollback
    end

    {
      newly_added_admins_number: new_admins_number - User.billed_admins.count,
      newly_added_moderators_number: new_moderators_number - User.billed_moderators.count
    }
  end
end
