require "rails_helper"

describe SettingsService do
  let(:ss) { SettingsService.new }
  let(:schema) do
    {
      "properties" => {
        "a" => {},
        "b" => {},
        "c" => {}
      },
      "dependencies" => {
        "b" => ["a"],
        "c" => ["a","b"],
      }
    }
  end

  describe "add_missing_features" do

    it "adds the missing features to empty settings" do
      settings = ss.add_missing_features({}, schema)
      expect(settings).to include("a","b","c")
    end

    it "adds missing features to existing settings" do
      settings = ss.add_missing_features({a: {}}, schema)
      expect(settings).to include("a","b","c")
    end

    it "makes missing features to unallowed and unenabled" do
      settings = ss.add_missing_features({}, schema)
      expect(settings["a"]).to include({
        "allowed" => false,
        "enabled" => false
      });
    end

    it "leaves features not in the schema unchanged" do
      settings_ext = {"d" => {}}
      settings = ss.add_missing_features(settings_ext, schema)
      expect(settings).to include("d")
    end

  end

  describe "missing_dependencies" do
    it "is empty on an empty settings" do
      expect(ss.missing_dependencies({}, schema)).to be_empty
    end

    it "is empty on met dependencies" do
      settings = {
        "a" => {"allowed" => true, "enabled" => true},
        "b" => {"allowed" => true, "enabled" => true}
      }
      expect(ss.missing_dependencies(settings, schema)).to be_empty
    end

    it "contains missing disabled dependency" do
      settings = {
        "a" => {"allowed" => true, "enabled" => false},
        "b" => {"allowed" => true, "enabled" => true}
      }
      expect(ss.missing_dependencies(settings, schema)).to eq ["a"]
    end

    it "contains disallowed dependency" do
      settings = {
        "a" => {"allowed" => false, "enabled" => true},
        "b" => {"allowed" => true, "enabled" => true}
      }
      expect(ss.missing_dependencies(settings, schema)).to eq ["a"]
    end
  end

end
