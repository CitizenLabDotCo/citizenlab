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

  describe 'Scope' do
    subject(:resolved_scope) { described_class::Scope.new(user, ContentBuilder::Layout).resolve }

    context 'when a content_buildable_type raises NotAuthorizedError' do
      let(:user) { create(:user) }
      let!(:project) { create(:project) }
      let!(:accessible_layout) { create(:layout, content_buildable: project) }
      let!(:homepage_layout) { create(:layout, content_buildable: nil) }

      before do
        # Create a layout with a content_buildable_type that will raise NotAuthorizedError
        # We need to stub scope_for to raise the exception for a specific type
        allow_any_instance_of(described_class::Scope).to receive(:scope_for) do |_instance, klass|
          if klass == Project
            raise Pundit::NotAuthorizedError, 'not allowed'
          end

          klass.none
        end
      end

      it 'filters out layouts that raise NotAuthorizedError and returns accessible layouts' do
        # The accessible_layout should be filtered out (because scope_for raises exception)
        # But the homepage_layout (with nil content_buildable_type) should still be included
        expect(resolved_scope).to contain_exactly(homepage_layout)
      end

      it 'does not raise an exception' do
        expect { resolved_scope }.not_to raise_error
      end
    end
  end
end
