# frozen_string_literal: true

require 'rails_helper'

describe CustomFieldAnswerPolicy do
  subject(:policy) { described_class.new(user, answer) }

  let_it_be(:registration_field) { create(:custom_field_gender) }

  context 'for an answer of an idea' do
    let_it_be(:project) { create(:project_with_active_ideation_phase) }
    let_it_be(:form) { create(:custom_form, participation_context: project) }
    let_it_be(:public_field) { create(:custom_field, resource: form, answers_visible_to: 'public') }
    let_it_be(:private_field) { create(:custom_field, resource: form, answers_visible_to: 'moderators') }
    let_it_be(:author) { create(:user) }
    let_it_be(:idea) { create(:idea, project: project, author: author) }

    let(:answers) do
      {
        public: build(:custom_field_answer, answerable: idea, custom_field: public_field, key: public_field.key),
        private: build(:custom_field_answer, answerable: idea, custom_field: private_field, key: private_field.key),
        other_option: build(:custom_field_answer, answerable: idea, custom_field: private_field, key: "#{private_field.key}_other"),
        registration: build(:custom_field_answer, answerable: idea, custom_field: registration_field, key: 'u_gender'),
        unlinked: build(:custom_field_answer, answerable: idea, custom_field: nil, key: 'no_such_field')
      }
    end

    shared_examples 'sees only public answers' do
      { public: true, private: false, other_option: false, registration: false, unlinked: false }.each do |name, permitted|
        context "for the #{name} answer" do
          let(:answer) { answers[name] }

          it { expect(policy.show?).to be permitted }
        end
      end
    end

    shared_examples 'sees all linked answers' do
      { public: true, private: true, other_option: true, registration: true, unlinked: false }.each do |name, permitted|
        context "for the #{name} answer" do
          let(:answer) { answers[name] }

          it { expect(policy.show?).to be permitted }
        end
      end
    end

    context 'for a visitor' do
      let(:user) { nil }

      include_examples 'sees only public answers'
    end

    context 'for another user' do
      let_it_be(:user) { create(:user) }

      include_examples 'sees only public answers'
    end

    context 'for a moderator of another project' do
      let_it_be(:user) { create(:project_moderator) }

      include_examples 'sees only public answers'
    end

    context 'for the author' do
      let(:user) { author }

      include_examples 'sees all linked answers'
    end

    context "for a moderator of the idea's project" do
      let_it_be(:user) { create(:project_moderator, projects: [project]) }

      include_examples 'sees all linked answers'
    end

    context 'for an admin' do
      let_it_be(:user) { create(:admin) }

      include_examples 'sees all linked answers'
    end

    context 'for an answer to a disabled question' do
      let_it_be(:disabled_public_field) { create(:custom_field, resource: form, enabled: false, answers_visible_to: 'public') }
      let_it_be(:disabled_private_field) { create(:custom_field, resource: form, enabled: false, answers_visible_to: 'moderators') }

      context 'for a visitor' do
        let(:user) { nil }
        let(:answer) { build(:custom_field_answer, answerable: idea, custom_field: disabled_public_field, key: disabled_public_field.key) }

        it { is_expected.to permit(:show) }
      end

      context "for a moderator of the idea's project" do
        let_it_be(:user) { create(:project_moderator, projects: [project]) }
        let(:answer) { build(:custom_field_answer, answerable: idea, custom_field: disabled_private_field, key: disabled_private_field.key) }

        it { is_expected.to permit(:show) }
      end
    end

    # Such questions are registration fields that are disabled at platform level and
    # attached to the phase's permission, so the form asks them while the field stays disabled.
    context 'for the copy of an answer to a demographic question asked only in this project' do
      let_it_be(:disabled_registration_field) { create(:custom_field, :for_registration, enabled: false) }
      let(:answer) do
        build(:custom_field_answer, answerable: idea, custom_field: disabled_registration_field, key: "u_#{disabled_registration_field.key}")
      end

      context 'for the author' do
        let(:user) { author }

        it { is_expected.to permit(:show) }
      end

      context "for a moderator of the idea's project" do
        let_it_be(:user) { create(:project_moderator, projects: [project]) }

        it { is_expected.to permit(:show) }
      end

      context 'for a visitor' do
        let(:user) { nil }

        it { is_expected.not_to permit(:show) }
      end
    end
  end

  context 'for an answer of a user' do
    let_it_be(:hidden_field) { create(:custom_field, :for_registration, hidden: true) }
    let_it_be(:owner) { create(:user) }

    let(:answers) do
      {
        visible: build(:custom_field_answer, answerable: owner, custom_field: registration_field, key: 'gender'),
        hidden: build(:custom_field_answer, answerable: owner, custom_field: hidden_field, key: hidden_field.key),
        unlinked: build(:custom_field_answer, answerable: owner, custom_field: nil, key: 'no_such_field')
      }
    end

    shared_examples 'sees no answers' do
      %i[visible hidden unlinked].each do |name|
        context "for the #{name} answer" do
          let(:answer) { answers[name] }

          it { is_expected.not_to permit(:show) }
        end
      end
    end

    shared_examples 'sees the answers to visible fields' do
      { visible: true, hidden: false, unlinked: false }.each do |name, permitted|
        context "for the #{name} answer" do
          let(:answer) { answers[name] }

          it { expect(policy.show?).to be permitted }
        end
      end
    end

    context 'for a visitor' do
      let(:user) { nil }

      include_examples 'sees no answers'
    end

    context 'for another user' do
      let_it_be(:user) { create(:user) }

      include_examples 'sees no answers'
    end

    context 'for a project moderator' do
      let_it_be(:user) { create(:project_moderator) }

      include_examples 'sees no answers'
    end

    context 'for the user themself' do
      let(:user) { owner }

      include_examples 'sees the answers to visible fields'
    end

    context 'for an admin' do
      let_it_be(:user) { create(:admin) }

      include_examples 'sees the answers to visible fields'
    end

    context 'for a visitor when the user is a pending invitee' do
      let_it_be(:invitee) { create(:invited_user) }
      let(:user) { nil }
      let(:answer) { build(:custom_field_answer, answerable: invitee, custom_field: registration_field, key: 'gender') }

      it { is_expected.to permit(:show) }
    end
  end
end
