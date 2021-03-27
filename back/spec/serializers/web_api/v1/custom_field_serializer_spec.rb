require 'rails_helper'

describe WebApi::V1::CustomFieldSerializer do

  context "User custom fields" do
    it "should contain the attribute 'hidden'" do
      user_custom_field = create(:custom_field, resource_type: 'User')
      serialized_field = WebApi::V1::CustomFieldSerializer.new(user_custom_field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).to include(:hidden)
    end
  end

  context "Idea custom fields" do
    it "should not contain the attribute 'hidden'" do
      idea_custom_field = create(:custom_field, resource_type: 'CustomForm')
      serialized_field = WebApi::V1::CustomFieldSerializer.new(idea_custom_field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).not_to include(:hidden)
    end
  end

end