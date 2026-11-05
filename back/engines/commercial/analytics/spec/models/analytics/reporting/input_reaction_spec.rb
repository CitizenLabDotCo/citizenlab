# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::InputReaction do
  it 'exposes reactions on inputs' do
    reaction = create(:reaction, mode: 'down')
    row = described_class.find(reaction.id)

    expect(row.input_id).to eq reaction.reactable_id
    expect(row.user_id).to eq reaction.user_id
    expect(row.reacted_at).to eq reaction.reload.created_at
    expect(row.mode).to eq 'down'
  end

  it 'excludes reactions on comments' do
    create(:comment_reaction)

    expect(described_class.count).to eq 0
  end
end
