require 'rails_helper'

RSpec.describe IdeasInputTopic do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:ideas_input_topic)).to be_valid
    end
  end

  describe '#enfore_clean_topic_hierarchy callback' do
    let(:project) { create(:project) }
    let(:idea) { create(:idea, project: project) }
    let(:parent_topic) { create(:input_topic, project: project) }
    let(:child_topic) { create(:input_topic, project: project, parent: parent_topic) }

    describe 'remove_parent_if_child_added' do
      it 'removes the parent topic assignment when a child topic is assigned' do
        create(:ideas_input_topic, idea: idea, input_topic: parent_topic)
        expect(idea.input_topics).to contain_exactly(parent_topic)

        create(:ideas_input_topic, idea: idea, input_topic: child_topic)

        expect(idea.input_topics.reload).to contain_exactly(child_topic)
      end

      it 'does not affect assignments when the topic has no parent' do
        other_topic = create(:input_topic, project: project)
        create(:ideas_input_topic, idea: idea, input_topic: other_topic)
        create(:ideas_input_topic, idea: idea, input_topic: parent_topic)

        expect(idea.input_topics.reload).to contain_exactly(other_topic, parent_topic)
      end
    end

    describe 'remove_self_if_parent_of_existing_child_added' do
      it 'removes the parent assignment when the idea already has a child topic assigned' do
        create(:ideas_input_topic, idea: idea, input_topic: child_topic)
        expect(idea.input_topics).to contain_exactly(child_topic)

        create(:ideas_input_topic, idea: idea, input_topic: parent_topic)

        expect(idea.input_topics.reload).to contain_exactly(child_topic)
      end

      it 'does not remove the assignment when the topic has no children assigned to the idea' do
        other_parent = create(:input_topic, project: project)
        create(:ideas_input_topic, idea: idea, input_topic: child_topic)

        create(:ideas_input_topic, idea: idea, input_topic: other_parent)

        expect(idea.input_topics.reload).to contain_exactly(child_topic, other_parent)
      end
    end
  end
end
