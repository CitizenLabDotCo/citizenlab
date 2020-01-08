require 'rails_helper'

describe 'RequiredSettingsAttribute' do

  let(:schema1) { {
    "$schema" => TenantSchema::ExtendedSchema::SCHEMA_URL,
    "type": "object",
    "properties" => {
      "feature1" => {
        "type" => "object",
        "required-settings" => ["setting1"],
        "properties" => {
          "allowed" => { "type" => "boolean" },
          "enabled" => { "type" => "boolean"},
          "setting1" => { "type" => "string" },
          "setting2" => { "type" => "string" }
        }
      },
      "feature2" => {
        "type" => "string"
      }
    }
  } }

  let(:data) { {
    "feature1" => {
      "allowed" => true,
      "enabled" => true,
      "setting1" => "foo",
      "setting2" => "bar",
    }
  } }

  it "validates an object that has the required setting" do
    expect(JSON::Validator.validate(schema1,data)).to be true
  end

  it "invalidates an object that misses the required setting" do
    data["feature1"].delete "setting1"
    expect(JSON::Validator.validate(schema1,data)).to be false
  end

  it "validates an object that misses the required setting but is not enabled" do
    data["feature1"]["enabled"] = false
    data["feature1"].delete "setting1"
    expect(JSON::Validator.validate(schema1,data)).to be true
  end

  it "validates an object that misses the required setting but is not allowed" do
    data["feature1"]["allowed"] = false
    data["feature1"].delete "setting1"
    expect(JSON::Validator.validate(schema1,data)).to be true
  end

  it "validates an object that has the required setting but is not enabled" do
    data["feature1"]["enabled"] = false
    expect(JSON::Validator.validate(schema1,data)).to be true
  end

  it "validates an object that has the required setting but is not allowed" do
    data["feature1"]["allowed"] = false
    expect(JSON::Validator.validate(schema1,data)).to be true
  end
  
end