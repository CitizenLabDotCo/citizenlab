# frozen_string_literal: true

require 'rails_helper'

describe MentionService do
  let(:service) { described_class.new }

  describe 'extract_mention_ids' do
    it "return an empty array when there's no mention" do
      result = service.send(:extract_mention_ids, 'There is no mention in this text')
      expect(result).to eq []
    end

    it "returns an empty array when there's a standalone @ sign" do
      result = service.send(:extract_mention_ids, 'This @ should not trigger anything')
      expect(result).to eq []
    end

    it 'returns an empty array when the mention is not a uuid' do
      result = service.send(:extract_mention_ids, 'This @koengremmelprez should not trigger')
      expect(result).to eq []
    end

    it 'returns a mention when it is a uuid' do
      result = service.send(:extract_mention_ids, 'This @9e0380e4-26cf-4661-8f54-9fdfca78e3cf should trigger')
      expect(result).to eq ['9e0380e4-26cf-4661-8f54-9fdfca78e3cf']
    end

    it 'returns multiple valid mentions' do
      result = service.send(:extract_mention_ids, 'This @9e0380e4-26cf-4621-8f54-9fdfca78e4cf should trigger and @04db8880-25ee-4f9c-8518-171ba265432a too')
      expect(result).to eq %w[9e0380e4-26cf-4621-8f54-9fdfca78e4cf 04db8880-25ee-4f9c-8518-171ba265432a]
    end
  end

  describe 'add_span_around' do
    it 'Adds a span tag' do
      u = User.create(first_name: 'Koen', last_name: 'Gremmelprez')
      result = service.add_span_around(
        "<p>This is a html text with a mention to @#{u.id}</p>",
        u
      )
      expect(result).to eq "<p>This is a html text with a mention to <span class=\"cl-mention-user\" data-user-id=\"#{u.id}\" data-link-profile=\"false\">@Koen Gremmelprez</span></p>"
    end
  end

  describe 'process_mentions' do
    before do
      @u1 = create(:user)
      @u1_mention = service.user_to_mention(@u1)
      @u1_mention_expanded = service.add_span_around @u1_mention, @u1
      @u2 = create(:user)
      @u2_mention = service.user_to_mention(@u2)
      @u2_mention_expanded = service.add_span_around @u2_mention, @u2
    end

    it "returns the same text when there's no mention" do
      message = 'There is no mention in here :('
      result = service.process_mentions(message)
      expect(result).to eq [message, []]
    end

    it 'processes a single mention as it should' do
      result = service.process_mentions(@u1_mention)
      expect(result).to eq ["<span class=\"cl-mention-user\" data-user-id=\"#{@u1.id}\" data-link-profile=\"false\">@#{@u1.full_name}</span>", [@u1.id]]
    end

    it 'processes a single mention of a user with a public profile' do
      create(:idea, author: @u1) # Profile is public if the user has authored an idea or comment
      result = service.process_mentions(@u1_mention)
      expect(result).to eq ["<span class=\"cl-mention-user\" data-user-id=\"#{@u1.id}\" data-link-profile=\"true\">@#{@u1.full_name}</span>", [@u1.id]]
    end

    it 'processes multiple mentions as it should' do
      result = service.process_mentions("#{@u1_mention} and #{@u2_mention} are sitting in a tree")
      expect(result[0]).to eq "#{@u1_mention_expanded} and #{@u2_mention_expanded} are sitting in a tree"
      expect(result[1]).to contain_exactly(@u1.id, @u2.id)
    end

    it 'only returns new unexpanded mentions as users' do
      result = service.process_mentions("#{@u1_mention} and #{@u2_mention_expanded}")
      expect(result).to eq ["#{@u1_mention_expanded} and #{@u2_mention_expanded}", [@u1.id]]
    end
  end

  describe 'remove_expanded_mentions' do
    it 'removes the expanded mentions' do
      user = create(:user, first_name: 'Jos', last_name: 'Joossens')
      expanded_mention = service.add_span_around(service.user_to_mention(user), user)
      result = service.send(:remove_expanded_mentions, "There is one unexpanded mention: @9e0380e4-26cf-4621-8f54-9fdfca78e4cf. But also one expanded mention #{expanded_mention}")
      expect(result).to eq "There is one unexpanded mention: @9e0380e4-26cf-4621-8f54-9fdfca78e4cf. But also one expanded mention @#{user.id}"
    end
  end

  context 'with shallow anonymization enabled' do # aka abbreviated user names
    before do
      SettingsService.new.activate_feature! 'abbreviated_user_names'
      @jane = create(:user, first_name: 'Jane', last_name: 'Doe')
    end

    it 'adds a span tag' do
      result = service.add_span_around("<p>This is an html text with a mention to @#{@jane.id}</p>", @jane)
      expect(result).to eq "<p>This is an html text with a mention to <span class=\"cl-mention-user\" data-user-id=\"#{@jane.id}\" data-link-profile=\"false\">@Jane D.</span></p>"
    end

    it 'extract expanded mentions' do
      text = "<p>This is an html text with a mention to <span class=\"cl-mention-user\" data-user-id=\"#{@jane.id}\" data-link-profile=\"false\">@Jane D.</span></p>"
      result = service.extract_expanded_mention_users(text)
      expect(result).to contain_exactly(@jane)
    end
  end
end
