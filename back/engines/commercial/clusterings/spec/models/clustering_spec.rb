require 'rails_helper'

RSpec.describe Clusterings::Clustering, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:clustering)).to be_valid
    end
  end

  describe "clustering JSON schema" do

    it "is a valid JSON schema" do
      metaschema = JSON::Validator.validator_for_name("draft4").metaschema
      expect(JSON::Validator.validate!(metaschema, Clusterings::Clustering::STRUCTURE_JSON_SCHEMA)).to be true
    end
  end
end
