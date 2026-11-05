# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Participant do
  it 'aggregates all contributions of a user into one participant' do
    user = create(:user)
    create(:idea, author: user, submitted_at: Time.zone.now)
    create(:comment, author: user)
    row = described_class.find(user.id)

    expect(row.user_id).to eq user.id
    expect(row.anonymous).to be false
    expect(row.created_at)
      .to eq Analytics::Reporting::Contribution.where(user_id: user.id).minimum(:contributed_at)
  end

  it 'exposes an anonymous participant per stable author hash' do
    idea = create(:idea, anonymous: true, submitted_at: Time.zone.now)
    row = described_class.find(idea.reload.author_hash)

    expect(row.user_id).to be_nil
    expect(row.anonymous).to be true
  end
end
