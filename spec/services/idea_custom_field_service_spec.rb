require "rails_helper"

describe IdeaCustomFieldService do
  let(:service) { IdeaCustomFieldService.new }

  describe "merge_built_in_fields" do

    it "overrides built in custom fields with database custom fields by code" do
      custom_form = create(:custom_form)
      cf1 = create(:custom_field, resource: custom_form, code: 'title')
      cf2 = create(:custom_field, resource: custom_form, code: nil)
      output = service.merge_built_in_fields(CustomField.all)
      expect(output).to include cf1
      expect(output).to include cf2
      expect(output.map(&:code)).to match_array ['title','topic_ids', nil]
    end

  end

end