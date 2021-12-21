# frozen_string_literal: true

require 'rails_helper'

describe FlagInappropriateContent::WebApi::V1::Notifications::InappropriateContentFlaggedSerializer do
  it 'includes a relative path to the respective Idea' do
    flagged = create(:inappropriate_content_flagged)
    hash = described_class.new(flagged).serializable_hash
    slug = Idea.find(flagged.inappropriate_content_flag.flaggable.post_id).slug

    # puts hash.inspect
    # puts flagged.inappropriate_content_flag.flaggable.inspect

    expect(hash[:data][:attributes][:flaggable_url]).to eq("ideas/#{slug}")
  end  
end
