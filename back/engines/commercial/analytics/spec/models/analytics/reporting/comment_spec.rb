# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Comment do
  it 'exposes a published comment with its input, author, body and counts' do
    comment = create(:comment, likes_count: 3)
    row = described_class.find(comment.id)

    expect(row.input_id).to eq comment.idea_id
    expect(row.parent_id).to be_nil
    expect(row.user_id).to eq comment.author_id
    expect(row.body).to eq '<p>I think this is a very good idea!</p>'
    expect(row.likes_count).to eq 3
    expect(row.created_at).to be_within(1.second).of(comment.created_at)
  end

  it 'falls back to another locale when the primary locale is missing' do
    comment = create(:comment, body_multiloc: { 'nl-BE' => '<p>Geweldig idee!</p>' })

    expect(described_class.find(comment.id).body).to eq '<p>Geweldig idee!</p>'
  end

  it 'links a reply to the comment it answers' do
    parent = create(:comment)
    reply = create(:comment, idea: parent.idea, parent: parent)

    expect(described_class.find(reply.id).parent_id).to eq parent.id
  end

  it 'replaces mentions with a plain @mention, leaving no name or user id' do
    mentioned = create(:user, first_name: 'Jane', last_name: 'Doe')
    comment = create(:comment_with_mentions, mentioned_users: [mentioned])
    body = described_class.find(comment.id).body

    expect(comment.reload.body_multiloc['en']).to include('Jane')
    expect(body).to eq '@mention are sitting in a tree'
    expect(body).not_to include(mentioned.id)
  end

  it 'replaces mentions whose name the sanitizer turned into a link' do
    linked = create(:user, first_name: 'Jane', last_name: 'www.janedoe.com')
    plain = create(:user, first_name: 'John', last_name: 'Doe')
    comment = create(:comment_with_mentions, mentioned_users: [linked, plain])
    body = described_class.find(comment.id).body

    expect(comment.reload.body_multiloc['en']).to include('<a ')
    expect(body).to eq '@mention, @mention are sitting in a tree'
  end

  it 'has no author for anonymous comments' do
    comment = create(:comment, anonymous: true)

    expect(described_class.find(comment.id).user_id).to be_nil
  end

  it 'excludes deleted comments' do
    comment = create(:comment, publication_status: 'deleted')

    expect(described_class.where(id: comment.id)).to be_empty
  end

  it 'excludes comments on draft inputs' do
    comment = create(:comment, idea: create(:idea, publication_status: 'draft'))

    expect(described_class.where(id: comment.id)).to be_empty
  end
end
