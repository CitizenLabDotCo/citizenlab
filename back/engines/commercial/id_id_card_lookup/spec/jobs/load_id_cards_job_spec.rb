require 'rails_helper'

RSpec.describe IdIdCardLookup::LoadIdCardsJob, type: :job do
  
  subject(:job) { IdIdCardLookup::LoadIdCardsJob.new }

  describe '#perform' do

    let(:card_ids) {[
      "aaa1",
      "bbb2",
      "ccc3",
      "ddd4",
      "eee5",
      "fff6",
      "ggg7",
      "hhh8",
      "iii9",
    ]}

    it "loads all given card_ids" do
      job.perform(card_ids)
      expect(IdIdCardLookup::IdCard.count).to eq 9
    end
  end
end
