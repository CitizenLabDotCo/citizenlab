class UpdateMemberCountJob < ApplicationJob
  queue_as :default

  def run(group = nil)
    if group
      group.update_memberships_count!
    else
      Group.find_each(&:update_memberships_count!)
    end
  end
end
