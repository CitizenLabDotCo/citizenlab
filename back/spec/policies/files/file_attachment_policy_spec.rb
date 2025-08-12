# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::FileAttachmentPolicy do
  describe 'policy' do
    subject(:policy) { described_class.new(user, file_attachment) }

    let(:user) { create(:user) }
    let(:file_attachment) { create(:file_attachment) }
    let(:attachable_policy) { instance_double(ApplicationPolicy) }

    before do
      allow(policy) # rubocop:disable RSpec/SubjectStub
        .to receive(:policy_for)
        .with(file_attachment.attachable)
        .and_return(attachable_policy)
    end

    shared_examples 'delegates to attachable policy' do |method, delegated_method|
      describe "##{method}?" do
        it "permits when the attachable policy allows #{delegated_method}" do
          expect(attachable_policy).to receive(:"#{delegated_method}?").and_return(true)
          expect(policy).to permit(method)
        end

        it "forbids when the attachable policy denies #{delegated_method}" do
          expect(attachable_policy).to receive(:"#{delegated_method}?").and_return(false)
          expect(policy).not_to permit(method)
        end
      end
    end

    it_behaves_like 'delegates to attachable policy', :show, :show
    it_behaves_like 'delegates to attachable policy', :create, :update
    it_behaves_like 'delegates to attachable policy', :update, :update
    it_behaves_like 'delegates to attachable policy', :destroy, :update
  end

  describe 'scope' do
    subject(:resolved_scope) { described_class::Scope.new(user, Files::FileAttachment).resolve }

    before_all do
      phase = create(:phase, :ongoing)
      @project = phase.project
      idea = create(:idea, project: @project)
      event = create(:event, project: @project)

      @in_project_attachments = [
        create(:file_attachment, attachable: phase),
        create(:file_attachment, attachable: @project),
        create(:file_attachment, attachable: idea),
        create(:file_attachment, attachable: event)
      ]
    end

    let_it_be(:static_page_attachment) { create(:file_attachment, attachable: create(:static_page)) }
    let_it_be(:project, reload: true) { @project }
    let_it_be(:all_attachments) { [*@in_project_attachments, static_page_attachment] }

    context 'for visitor' do
      let(:user) { nil }

      context 'when the project is published' do
        it { is_expected.to match_array(all_attachments) }
      end

      context 'when the project is not published' do
        before { project.admin_publication.update!(publication_status: 'draft') }

        it { is_expected.to contain_exactly(static_page_attachment) }
      end
    end

    context 'for user' do
      let(:user) { create(:user) }

      context 'when the project is published' do
        it { is_expected.to match_array(all_attachments) }
      end

      context 'when the project is not published' do
        before { project.admin_publication.update!(publication_status: 'draft') }

        it { is_expected.to contain_exactly(static_page_attachment) }
      end
    end

    context 'for admin' do
      let(:user) { create(:admin) }

      context 'when the project is published' do
        it { is_expected.to match_array(all_attachments) }
      end

      context 'when the project is not published' do
        before { project.admin_publication.update!(publication_status: 'draft') }

        it { is_expected.to match_array(all_attachments) }
      end
    end
  end
end
