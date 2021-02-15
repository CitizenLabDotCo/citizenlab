class UpdateMemberCountJob < ApplicationJob
  queue_as :default

  def run group=nil
    if group
      group.update_memberships_count!
    else
      Group.where(membership_type: 'manual').each do |group|
        group.update! memberships_count: Membership.where(group: group).where(user: User.active).count
      end
      Group.where(membership_type: 'rules').each do |group|
        group.update_memberships_count!
      end
    end
  end
end
