require 'rails_helper'

RSpec.describe Maps::MapConfig, type: :model do

  describe "Default factory" do
    it "is valid" do
      expect(build(:map_config)).to be_valid
    end
  end

end
