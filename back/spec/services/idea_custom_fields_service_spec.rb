require "rails_helper"

describe IdeaCustomFieldsService do
  let(:service) { IdeaCustomFieldsService.new }

  describe "all_fields" do

    it "outputs valid custom fields" do
      custom_form = create(:custom_form)
      expect(service.all_fields(custom_form)).to all(be_valid)
    end

    it "takes the order of the built-in fields" do
      custom_form = create(:custom_form)
      cf1 = create(:custom_field, resource: custom_form, code: 'location')
      output = service.all_fields(custom_form)
      expect(output).to include cf1
      expect(output.map(&:code)).to eq [
        'title',
        'body',
        'proposed_budget',
        'topic_ids',
        'location',
        'images',
        'attachments',
      ]
    end
  end
end
