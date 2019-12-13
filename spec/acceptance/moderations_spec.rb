require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Moderations" do
 
  explanation "Moderations are pieces of user-generated content that need to be moderated"

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    @time = Time.now
    @m3 = create(:idea, 
      title_multiloc: {'en' => 'More bicycle repairmen'}, 
      body_multiloc: {'en' => 'They are the true heroes of society'},
      published_at: @time - 1.day,
      moderation_status: 'read'
      )
    @m2 = create(:comment, 
      body_multiloc: {'en' => 'I\'m glad there\'s still heroes around'},
      post: @m3, 
      created_at: @time - 1.hour
      )
    @m4 = create(:idea, 
      title_multiloc: {'en' => 'Fewer bicycle repairmen'}, 
      body_multiloc: {'en' => 'They are pretentious donkeys'},
      published_at: @time - 2.days,
      moderation_status: 'read'
      )
    @m1 = create(:initiative, 
      title_multiloc: {'en' => 'Burn more leaves'}, 
      body_multiloc: {'en' => 'We must return that CO2 to our atmosphere at all cost'},
      published_at: @time - 1.minute
      )
  end

  get "web_api/v1/moderations" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of moderations per page"
    end

    parameter :moderation_status, "Filter by moderation status. One of #{Moderatable::MODERATION_STATUSES.join(", ")}.", required: false

    example_request "List all moderations" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
      expect(json_response[:data].map { |d| d.dig(:id) }).to eq [@m1.id, @m2.id, @m3.id, @m4.id]
      expect(json_response[:data].map { |d| d.dig(:attributes, :moderatable_type) }).to eq ['Initiative', 'Comment', 'Idea', 'Idea']
      expect(json_response[:data].map { |d| d.dig(:attributes, :context_multiloc).stringify_keys['en'] }).to eq ['Burn more leaves', 'More bicycle repairmen', 'More bicycle repairmen', 'Fewer bicycle repairmen']
      expect(json_response[:data].map { |d| d.dig(:attributes, :content_multiloc).stringify_keys['en'] }).to eq ['We must return that CO2 to our atmosphere at all cost', 'I\'m glad there\'s still heroes around', 'They are the true heroes of society', 'They are pretentious donkeys']
      expect(json_response[:data].map { |d| d.dig(:attributes, :moderation_status)}).to eq ['unread', 'unread', 'read', 'read']
      expect(json_response[:data].map { |d| Time.parse(d.dig(:attributes, :created_at)).to_i }).to eq [@time - 1.minute, @time - 1.hour, @time - 1.day, @time - 2.days].map(&:to_i)
    end

    describe "" do
      let(:moderation_status) { 'unread' }

      example_request "List only unread moderations" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:id) }).to eq [@m1.id, @m2.id]
        expect(json_response[:data].map { |d| d.dig(:attributes, :moderation_status)}).to eq ['unread', 'unread']
      end
    end

    describe "" do
      let(:moderation_status) { 'read' }

      example_request "List only read moderations" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:id) }).to eq [@m3.id, @m4.id]
        expect(json_response[:data].map { |d| d.dig(:attributes, :moderation_status)}).to eq ['read', 'read']
      end
    end
  end
end
