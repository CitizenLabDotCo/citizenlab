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
      output = service.all_fields(custom_form)
      expect(output.map(&:code)).to eq [
        'title_multiloc',
        'body_multiloc',
        'author_id',
        'budget',
        'proposed_budget',
        'topic_ids',
        'location_description',
        'location_point_geojson',
        'idea_images_attributes',
        'idea_files_attributes',
      ]
    end
  end
end
