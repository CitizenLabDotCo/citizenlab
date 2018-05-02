class UpdateMemberCountJob < ApplicationJob
  queue_as :default

  def perform
    Group.where(membership_type: 'rules').each do |group|
      group.update_memberships_count!
    end
  end

end
