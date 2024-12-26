# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Comments' do
  explanation 'Comments permit users to have discussions about content (i.e. ideas).'

  before do
    header 'Content-Type', 'application/json'
    @project = create(:single_phase_ideation_project)
    @idea = create(:idea, project: @project)
  end

  get 'web_api/v1/users/:user_id/comments' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of top-level posts per page by which the comments are grouped'
    end

    describe do
      before do
        @i1 = create(:idea, published_at: Time.zone.now)
        @i2 = create(:idea, published_at: 1.day.ago)
        @i3 = create(:idea, published_at: 3.days.ago)
        @user = create(:user)
        @c1 = create(:comment, idea: @i2, author: @user, created_at: 1.hour.ago)
        @c2 = create(:comment, idea: @i1, author: @user)
        @c3 = create(:comment, idea: @i2, author: @user, created_at: Time.zone.now)
        @c4 = create(:comment)
        @c5 = create(:comment, idea: @i3, author: @user)
        @c6 = create(:comment, idea: @i1)
      end

      let(:user_id) { @user.id }
      let(:size) { 2 }

      example_request 'List the comments of a user' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].pluck(:id)).to eq [@c2.id, @c3.id, @c1.id]
        expect(json_response[:included].map { |d| d.dig(:attributes, :slug) }).to eq [@i1.slug, @i2.slug]
      end
    end
  end
end
