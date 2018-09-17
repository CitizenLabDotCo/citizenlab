require 'rails_helper'

RSpec.describe Basket, type: :model do
  context "Default factory" do
    it "is valid" do
      expect(build(:basket)).to be_valid
    end
  end

  context "baskets_ideas" do
  	it "preserve created_at upon update" do
  		basket = create(:basket)
  		t1 = Time.now - 20.minutes
  		i1 = create(:idea)
  		travel_to t1 do
  			basket.update(ideas: [i1])
  		end
  		t2 = Time.now
  		i2 = create(:idea)
  		travel_to t2 do
  			basket.update(ideas: [i1, i2])
  		end
  		expect(basket.baskets_ideas.pluck(:created_at).map(&:to_i)).to match_array [t1,t2].map(&:to_i)
  	end
  end
end
