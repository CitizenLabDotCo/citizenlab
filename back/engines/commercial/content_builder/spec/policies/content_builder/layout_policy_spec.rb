# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::LayoutPolicy do
  subject(:policy) { described_class.new(user, layout) }

  let(:layout) { create(:layout) }
  let(:user_role_service) { policy.send(:user_role_service) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:upsert) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for an inactive user' do
    let(:user) { instance_double User, active?: false }

    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:upsert) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for an active user' do
    let(:user) { instance_double User, active?: true }

    before do
      allow(user_role_service)
        .to receive(:can_moderate?)
        .with(layout.content_buildable, user)
        .and_return can_moderate
    end

    context 'for non-moderators' do
      let(:can_moderate) { false }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:upsert) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
    end

    context 'for moderators' do
      let(:can_moderate) { true }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:upsert) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:destroy) }

      context 'when craftjs_json references files' do
        let(:file) { create(:file) }
        let(:layout) do
          create(:layout, craftjs_json: {
            'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => ['node1'] },
            'node1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => file.id } }
          })
        end

        context 'when user is authorized to use the file' do
          before do
            allow_any_instance_of(Files::FilePolicy).to receive(:update?).and_return(true)
          end

          it { is_expected.to permit(:upsert) }
          it { is_expected.to permit(:update) }
        end

        context 'when user is not authorized to use the file' do
          before do
            allow_any_instance_of(Files::FilePolicy).to receive(:update?).and_return(false)
          end

          it { is_expected.not_to permit(:upsert) }
          it { is_expected.not_to permit(:update) }
        end

        context 'when file does not exist' do
          let(:layout) do
            create(:layout, craftjs_json: {
              'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => ['node1'] },
              'node1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'non-existent-id' } }
            })
          end

          it 'permits update (allows saving to fix layout)' do
            expect(user_role_service).to receive(:can_moderate?)
            expect(policy).to permit(:update)
          end
        end
      end
    end
  end
end
