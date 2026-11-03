# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateDemoComments do
  let(:current_user) { create(:super_admin) }
  let(:idea) { create(:idea, created_at: 10.days.ago) }

  def create_comments(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  def comment_input(body, idea_id: idea.id, **attributes)
    { idea_id:, body_multiloc: { 'en' => body }, **attributes }
  end

  before { change_lifecycle_stage('demo') }

  it 'creates comments with fake demo authors, backdated after the input' do
    response = create_comments(comments: [comment_input('Great idea!'), comment_input('I disagree.')])

    expect(response).not_to be_error
    comments = idea.reload.comments
    expect(response.structured_content[:comment_ids]).to match_array(comments.map(&:id))
    expect(idea.comments_count).to eq(2)

    comments.each do |comment|
      expect(comment.author.email).to end_with("@#{McpServer::DemoData::EMAIL_DOMAIN}")
      expect(comment.created_at).to be_between(idea.created_at, Time.zone.now)
    end
  end

  it 'creates threaded replies after the parent comment' do
    parent = create(:comment, idea: idea, created_at: 5.days.ago)

    response = create_comments(comments: [comment_input('Well said.', parent_id: parent.id)])

    expect(response).not_to be_error
    reply = Comment.find(response.structured_content[:comment_ids].sole)
    expect(reply.parent).to eq(parent)
    expect(reply.created_at).to be_between(parent.created_at, Time.zone.now)
  end

  it 'refuses a parent comment from another input' do
    parent = create(:comment, created_at: 5.days.ago)

    response = create_comments(comments: [comment_input('Well said.', parent_id: parent.id)])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Parent comment on the same input not found')
    expect(Comment.count).to eq(1)
  end

  it 'returns not found for an unknown idea' do
    response = create_comments(comments: [comment_input('Great!', idea_id: 'unknown')])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Idea not found')
  end

  it 'refuses on platforms that are not demo or trial' do
    change_lifecycle_stage('active')

    response = create_comments(comments: [comment_input('Great!')])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('demo and trial platforms')
    expect(Comment.count).to eq(0)
  end

  it 'refuses when the demo user ceiling is reached' do
    stub_const('McpServer::DemoData::MAX_USERS_PER_TENANT', 1)

    response = create_comments(comments: [comment_input('One'), comment_input('Two')])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Demo user ceiling reached')
    expect(Comment.count).to eq(0)
  end

  it 'returns validation errors per comment index and creates nothing' do
    response = create_comments(comments: [comment_input('Fine.'), comment_input('')])

    expect(response).to be_error
    errors = response.structured_content[:errors]
    expect(errors.sole[:index]).to eq(1)
    expect(Comment.count).to eq(0)
    expect(McpServer::DemoData.demo_users.count).to eq(0)
  end

  it 'refuses non-admin users' do
    response = run_mcp_tool(
      described_class,
      params: { comments: [comment_input('Great!')] },
      current_user: create(:user)
    )

    expect(response).to be_error
    expect(Comment.count).to eq(0)
  end
end
