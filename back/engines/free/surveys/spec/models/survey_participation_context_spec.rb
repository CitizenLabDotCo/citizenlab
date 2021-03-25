require "rails_helper"

describe Surveys::SurveyParticipationContext do

  describe "validate survey_embed_url for typeform" do

    it "validates a survey_embed_url" do
      pc = build(:continuous_survey_project, survey_embed_url: "https://citizenlabco.typeform.com/to/HKGaPV?source=xxxxx")
      expect(pc).to be_valid
    end

    it "invalidates a survey_embed_url with a sole email parameter" do
      pc = build(:continuous_survey_project, survey_embed_url: "https://citizenlabco.typeform.com/to/HKGaPV?email=xxxxx")
      expect(pc).to be_invalid
    end

    it "invalidates a survey_embed_url with email as one of the parameters" do
      pc = build(:continuous_survey_project, survey_embed_url: "https://citizenlabco.typeform.com/to/HKGaPV?email=xxxxx&source=yyyyyy")
      expect(pc).to be_invalid
    end
  end
end