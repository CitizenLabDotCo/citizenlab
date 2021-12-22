# frozen_string_literal: true

require 'rails_helper'

describe FlagInappropriateContent::WebApi::V1::Notifications::InappropriateContentFlaggedSerializer do
  it 'includes a path to the respective Idea' do
    idea = create(:idea, slug: 'my-idea')
    comment = create(:comment, idea: idea)
    flag = create(:inappropriate_content_flag, flaggable: comment)
    flagged = create(:inappropriate_content_flagged, inappropriate_content_flag: flag)
    hash = described_class.new(flagged).serializable_hash

    expect(hash[:data][:attributes][:flaggable_path]).to eq("/ideas/my-idea")
  end
end
