require "rails_helper"

describe UserCustomFieldService do
  let(:service) { UserCustomFieldService.new }

  describe "delete_custom_field_values" do

    it "deletes the custom field values from all users" do
      cf1 = create(:custom_field)
      cf2 = create(:custom_field)
      users_with_cf = create_list(:user, 5, custom_field_values: {cf1.key => 'some_value', cf2.key => 'other_value'})
      users_without_cf = create_list(:user, 5)
      service.delete_custom_field_values(cf1)
      expect(User.all.map{|u| u.custom_field_values.keys}.flatten).to include(cf2.key)
      expect(User.all.map{|u| u.custom_field_values.keys}.flatten).not_to include(cf1.key)
    end
  end

  describe "delete_custom_field_option_values" do

    it "deletes the custom field option values from all users for a multiselect" do
      cf1 = create(:custom_field_multiselect)
      cfo1 = create(:custom_field_option, custom_field: cf1)
      cfo2 = create(:custom_field_option, custom_field: cf1)
      cf2 = create(:custom_field_select)
      cfo3 = create(:custom_field_option, custom_field: cf2)
      v1 = {cf1.key => [cfo1.key], cf2.key => cfo3.key}
      u1 = create(:user, custom_field_values: v1)
      v2 = {cf1.key => [cfo1.key, cfo2.key]}
      u2 = create(:user, custom_field_values: v2)
      v3 = {cf1.key => [cfo2.key]}
      u3 = create(:user, custom_field_values: v3)

      service.delete_custom_field_option_values(cfo1.key, cfo1.custom_field)

      expect(u1.reload.custom_field_values).to eq({cf2.key => cfo3.key})
      expect(u2.reload.custom_field_values).to eq({cf1.key => [cfo2.key]})
      expect(u3.reload.custom_field_values).to eq v3
    end

    it "deletes the custom field option values from all users for a single select" do
      cf1 = create(:custom_field_select)
      cfo1 = create(:custom_field_option, custom_field: cf1)
      cfo2 = create(:custom_field_option, custom_field: cf1)
      v1 = {cf1.key => cfo1.key}
      u1 = create(:user, custom_field_values: v1)
      v2 = {cf1.key => cfo2.key}
      u2 = create(:user, custom_field_values: v2)

      service.delete_custom_field_option_values(cfo1.key, cfo1.custom_field)

      expect(u1.reload.custom_field_values).to eq({})
      expect(u2.reload.custom_field_values).to eq v2
    end
  end
end