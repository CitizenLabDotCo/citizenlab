require 'rails_helper'

describe IdeaPolicy do
  subject { described_class.new(user, idea) }

  let(:idea) { create(:idea) }

  describe '#permitted_attributes' do
    context 'when admin' do
      let(:user) { create(:admin) }

      it 'includes the asssignee' do
        expect(subject.permitted_attributes).to include :assignee_id
      end
    end

    context 'when user' do
      let(:user) { create(:user) }
      it 'does not include the asssignee' do
        expect(subject.permitted_attributes).not_to include :assignee_id
      end
    end
  end
end
