require "rails_helper"

describe ImportIdeasService do
  let(:service) { ImportIdeasService.new }
  let(:project_with_phases) { create(:project_with_phases) }
  let(:project_without_phases) { create(:project) }

  before do
    create(:idea_status_proposed)
    create(:topic_nature)
    create(:topic_waste)
    create(:topic_sustainability)
    create(:topic_mobility)
    create(:topic_technology)
    create(:topic_economy)
    create_list(:user, 5)
  end

  describe "ideas importation", slow_test: true do

    it "creates all ideas if correctly formatted" do
      n = 10
      idea_data = generate_idea_data(n)
      service.import_ideas(idea_data)
      expect(Idea.count).to eq(n)
    end

    it "aborts successfully" do
      idea_data = generate_idea_data(6)
      idea_data[3][:user_email] = 'nonexistinguser@citizenlab.co'
      expect { service.import_ideas(idea_data) }.to raise_error(RuntimeError)
      expect(Idea.count).to eq(0)
    end

  end

  def generate_idea_data n
    n.times.map do |_|
      { title_multiloc: {'en' => "Idea #{rand(100000)}"},
        body_multiloc: {'en' => Faker::Lorem.sentence},
        topic_titles: Array.new(rand(5).times.map{rand(Topic.count)}.uniq.map{|offset| Topic.offset(offset).first.title_multiloc.values.first }),
        project_title: [project_with_phases, project_without_phases][rand(2)]&.title_multiloc&.values&.first,
        user_email: User.offset(rand(User.count)).first.email,
        image_url: nil # [nil, Faker::Avatar.image("my-own-slug", "50x50")][rand(2)]
      }
    end
  end

end
