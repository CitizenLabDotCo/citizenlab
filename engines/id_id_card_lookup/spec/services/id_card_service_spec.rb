require "rails_helper"

describe IdIdCardLookup::IdCardService do

  describe "normalize" do
    it "removes all whitespace" do
      expect(subject.normalize('123 abc5 ')).to eq '123abc5'
    end

    it "removes all special chars" do
      expect(subject.normalize('j4-ab%c&8')).to eq 'j4abc8'
    end

    it "downcases all chars" do
      expect(subject.normalize('aaAa4CC')).to eq 'aaaa4cc'
    end
  end

  describe "encode" do
    it "normalizes and hashes" do
      expect(subject.encode(' aA-.4 1')).to eq '$2a$10$Cu8AnxXnDwWAH0OkCBrbd.XQRzMDcXb46dMlEezTzL6nUz00JiHKK'
    end
  end

end
