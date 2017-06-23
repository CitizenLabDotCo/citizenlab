require "rails_helper"

describe MentionService do
  let(:service) { MentionService.new }

  describe "extract_mentions" do

    it "return an empty array when there's no mention" do
      result = service.extract_mentions("There is no mention in this text")
      expect(result).to eq []
    end

    it "returns an empty array when there's a standalone @ sign" do
      result = service.extract_mentions("This @ should not trigger anything")
      expect(result).to eq []
    end

    it "returns an empty array when there's a an @ with less than 3 following chars" do
      result = service.extract_mentions("This @ab should not trigger anything")
      expect(result).to eq []
    end

    it "returns no mention when there's no dash in it" do
      result = service.extract_mentions("This @koengremmelprez should trigger")
      expect(result).to eq []
    end

    it "returns a mention when it's in expected firstname-lastname form" do
      result = service.extract_mentions("This @koen-gremmelprez should trigger")
      expect(result).to eq ["koen-gremmelprez"]
    end

    it "returns multiple valid mentions" do
      result = service.extract_mentions("This @koen-gremmelprez should trigger and @jan-jansens too")
      expect(result).to eq ["koen-gremmelprez", "jan-jansens"]
    end
  end


  describe "add_span_around" do

    it "Adds a span tag" do
      result = service.add_span_around(
        "<p>This is a html text with a mention to @koen-gremmelprez</p>", 
        "@koen-gremmelprez", 
        "3e089a81-5000-4ce5-8cd4-75b5754213b0"
      )
      expect(result).to eq "<p>This is a html text with a mention to <span class=\"cl-mention-user\" data-user-id=\"3e089a81-5000-4ce5-8cd4-75b5754213b0\">@koen-gremmelprez</span></p>"
    end
  end


  describe "process_mentions" do
    before do
      @u1 = create(:user)
      @u1_mention = service.user_to_mention(@u1)
      @u1_mention_expanded = service.add_span_around @u1_mention, @u1_mention, @u1.id
      @u2 = create(:user)
      @u2_mention = service.user_to_mention(@u2)
      @u2_mention_expanded = service.add_span_around @u2_mention, @u2_mention, @u2.id

    end

    it "return the same text when there's no mention" do
      message = "There is no mention in here :("
      result = service.process_mentions(message)
      expect(result).to eq message
    end

    it "processes a single mention as it should" do
      result = service.process_mentions(@u1_mention)
      expect(result).to eq "<span class=\"cl-mention-user\" data-user-id=\"#{@u1.id}\">#{@u1_mention}</span>"
    end

    it "processes multiple mentions as it should" do
      result = service.process_mentions("#{@u1_mention} and #{@u2_mention} are sitting in a tree")
      expect(result).to eq "#{@u1_mention_expanded} and #{@u2_mention_expanded} are sitting in a tree"
    end
  end

  describe "users_from_idea" do
    before do
      @u1 = create(:user, first_name: 'jan', last_name: 'hoet')
      @u2 = create(:user, first_name: 'jantje', last_name: 'broek')
      @u3 = create(:user, first_name: 'rudolf', last_name: 'deer')
      @idea = create(:idea, author: @u1)
      create(:comment, idea: @idea, author: @u2)
      create(:comment, idea: @idea, author: @u3)
      create(:comment)
    end

    it "return the users from the idea that match the slug" do
      result = service.users_from_idea('ja', @idea, 5)
      expect(result).to match([@u1, @u2])
    end
  end



end
