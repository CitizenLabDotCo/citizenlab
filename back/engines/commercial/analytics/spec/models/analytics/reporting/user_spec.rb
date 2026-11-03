# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::User do
  it 'exposes active registered users with their highest role' do
    user = create(:user)
    admin = create(:admin)
    moderator = create(:project_moderator)

    expect(described_class.find(user.id).highest_role).to eq 'user'
    expect(described_class.find(admin.id).highest_role).to eq 'admin'
    expect(described_class.find(moderator.id).highest_role).to eq 'project_moderator'
    expect(described_class.find(user.id).registered_at).to eq user.reload.registration_completed_at
  end

  it 'excludes pending invites, incomplete registrations and blocked users' do
    create(:user, invite_status: 'pending', registration_completed_at: nil)
    # a callback completes registration on save, so unset it directly
    create(:user).update_column(:registration_completed_at, nil)
    create(:user, block_end_at: 1.month.from_now)

    expect(described_class.count).to eq 0
  end

  it 'includes users whose block has expired' do
    unblocked = create(:user, block_end_at: 1.day.ago)

    expect(described_class.ids).to eq [unblocked.id]
  end
end
