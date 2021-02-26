require "rails_helper"

describe MentionService do
  let(:service) { MentionService.new }

  describe "extract_mentions" do

    it "return an empty array when there's no mention" do
      result = service.send(:extract_mentions, "There is no mention in this text")
      expect(result).to eq []
    end

    it "returns an empty array when there's a standalone @ sign" do
      result = service.send(:extract_mentions, "This @ should not trigger anything")
      expect(result).to eq []
    end

    it "returns an empty array when there's a an @ with less than 3 following chars" do
      result = service.send(:extract_mentions, "This @ab should not trigger anything")
      expect(result).to eq []
    end

    it "returns no mention when there's no dash in it" do
      result = service.send(:extract_mentions, "This @koengremmelprez should trigger")
      expect(result).to eq []
    end

    it "returns a mention when it's in most common firstname-lastname form" do
      result = service.send(:extract_mentions, "This @koen-gremmelprez should trigger")
      expect(result).to eq ["koen-gremmelprez"]
    end

    it "returns a mention when it's got more than 2 segments" do
      result = service.send(:extract_mentions, "This @marcus-d-amore should trigger")
      expect(result).to eq ["marcus-d-amore"]
    end

    it "returns multiple valid mentions" do
      result = service.send(:extract_mentions, "This @koen-gremmelprez should trigger and @jan-jansens too")
      expect(result).to eq ["koen-gremmelprez", "jan-jansens"]
    end
  end


  describe "add_span_around" do

    it "Adds a span tag" do
      u = User.create(first_name: "Koen", last_name: "Gremmelprez")
      id = u.id
      result = service.add_span_around(
        "<p>This is a html text with a mention to @koen-gremmelprez</p>", 
        u
      )
      expect(result).to eq "<p>This is a html text with a mention to <span class=\"cl-mention-user\" data-user-id=\"#{id}\" data-user-slug=\"koen-gremmelprez\">@Koen Gremmelprez</span></p>"
    end
  end


  describe "process_mentions" do
    before do
      @u1 = create(:user)
      @u1_mention = service.user_to_mention(@u1)
      @u1_mention_expanded = service.add_span_around @u1_mention, @u1
      @u2 = create(:user)
      @u2_mention = service.user_to_mention(@u2)
      @u2_mention_expanded = service.add_span_around @u2_mention, @u2
    end

    it "returns the same text when there's no mention" do
      message = "There is no mention in here :("
      result = service.process_mentions(message)
      expect(result).to eq [message, []]
    end

    it "processes a single mention as it should" do
      result = service.process_mentions(@u1_mention)
      expect(result).to eq ["<span class=\"cl-mention-user\" data-user-id=\"#{@u1.id}\" data-user-slug=\"#{@u1.slug}\">@#{@u1.full_name}</span>", [@u1.id]]
    end

    it "processes multiple mentions as it should" do
      result = service.process_mentions("#{@u1_mention} and #{@u2_mention} are sitting in a tree")
      expect(result[0]).to eq "#{@u1_mention_expanded} and #{@u2_mention_expanded} are sitting in a tree"
      expect(result[1]).to match_array([@u1.id,@u2.id])
    end

    it "only returns new unexpanded mentions as users" do
      result = service.process_mentions("#{@u1_mention} and #{@u2_mention_expanded}")
      expect(result).to eq ["#{@u1_mention_expanded} and #{@u2_mention_expanded}", [@u1.id]]
    end
  end

  describe "users_from_post" do
    before do
      @u1 = create(:user, first_name: 'jan', last_name: 'hoet')
      @u2 = create(:user, first_name: 'jantje', last_name: 'broek')
      @u3 = create(:user, first_name: 'rudolf', last_name: 'deer')
      @u4 = create(:user, first_name: 'janus', last_name: 'lurker')
      @idea = create(:idea, author: @u1)
      create(:comment, post: @idea, author: @u2)
      create(:comment, post: @idea, author: @u3)
      create(:comment)
    end

    it "return the users from the idea that match the slug" do
      result = service.users_from_post('ja', @idea, 5)
      expect(result.size).to eq 2
      expect(result).to match_array [@u1, @u2]
    end

    it "handles case gracefully" do
      result = service.users_from_post('Ja', @idea, 5)
      expect(result.size).to eq 2
      expect(result).to match_array [@u1, @u2]
    end
  end

  describe "remove_expanded_mentions" do

    it "removes the expanded mentions" do
      user = create(:user, first_name: 'Jos', last_name: 'Joossens')
      expanded_mention = service.add_span_around(service.user_to_mention(user), user)
      result = service.send(:remove_expanded_mentions, "There is one unexpanded mention: @koen-gremmelprez. But also one expanded mention #{expanded_mention}")
      expect(result).to eq "There is one unexpanded mention: @koen-gremmelprez. But also one expanded mention @jos-joossens"
    end
  end

  context "with shallow anonymization enabled" do  # aka abbreviated user names

    before do
      AppConfiguration.instance.turn_on_abbreviated_user_names!
      @jane = create(:user, first_name: "Jane", last_name: "Doe")
    end

    it "adds a span tag" do
      result = service.add_span_around("<p>This is an html text with a mention to @#{@jane.slug}</p>", @jane)
      expect(result).to eq "<p>This is an html text with a mention to <span class=\"cl-mention-user\" data-user-id=\"#{@jane.id}\" data-user-slug=\"#{@jane.slug}\">@Jane D.</span></p>"
    end

    it "extract expanded mentions" do
      text = "<p>This is an html text with a mention to <span class=\"cl-mention-user\" data-user-id=\"#{@jane.id}\" data-user-slug=\"#{@jane.slug}\">@Jane D.</span></p>"
      result = service.extract_expanded_mention_users(text)
      expect(result).to match_array [@jane]
    end

  end
end
