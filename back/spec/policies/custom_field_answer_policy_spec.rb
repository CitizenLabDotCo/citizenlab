# frozen_string_literal: true

require 'rails_helper'

describe CustomFieldAnswerPolicy do
  subject(:policy) { described_class.new(user, answer) }

  let(:registration_field) { create(:custom_field_gender) }

  context 'for an answer of an idea' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:form) { create(:custom_form, participation_context: project) }
    let(:field) { create(:custom_field, resource: form) }
    let(:author) { create(:user) }
    let(:idea) { create(:idea, project: project, author: author) }

    let(:answers) do
      {
        question: build(:custom_field_answer, answerable: idea, custom_field: field, key: field.key),
        other_option: build(:custom_field_answer, answerable: idea, custom_field: field, key: "#{field.key}_other"),
        registration: build(:custom_field_answer, answerable: idea, custom_field: registration_field, key: 'u_gender'),
        unlinked: build(:custom_field_answer, answerable: idea, custom_field: nil, key: 'no_such_field')
      }
    end

    shared_examples 'sees no answers' do
      %i[question other_option registration unlinked].each do |name|
        context "for the #{name} answer" do
          let(:answer) { answers[name] }

          it { is_expected.not_to permit(:show) }
        end
      end
    end

    shared_examples 'sees all linked answers' do
      { question: true, other_option: true, registration: true, unlinked: false }.each do |name, permitted|
        context "for the #{name} answer" do
          let(:answer) { answers[name] }

          it { is_expected.send(permitted ? :to : :not_to, permit(:show)) }
        end
      end
    end

    context 'for a visitor' do
      let(:user) { nil }

      include_examples 'sees no answers'
    end

    context 'for another user' do
      let(:user) { create(:user) }

      include_examples 'sees no answers'
    end

    context 'for a moderator of another project' do
      let(:user) { create(:project_moderator) }

      include_examples 'sees no answers'
    end

    context 'for the author' do
      let(:user) { author }

      include_examples 'sees all linked answers'
    end

    context "for a moderator of the idea's project" do
      let(:user) { create(:project_moderator, projects: [project]) }

      include_examples 'sees all linked answers'
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      include_examples 'sees all linked answers'
    end
  end

  context 'for an answer of a user' do
    let(:hidden_field) { create(:custom_field, :for_registration, hidden: true) }
    let(:owner) { create(:user) }

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

          it { is_expected.send(permitted ? :to : :not_to, permit(:show)) }
        end
      end
    end

    context 'for a visitor' do
      let(:user) { nil }

      include_examples 'sees no answers'
    end

    context 'for another user' do
      let(:user) { create(:user) }

      include_examples 'sees no answers'
    end

    context 'for a project moderator' do
      let(:user) { create(:project_moderator) }

      include_examples 'sees no answers'
    end

    context 'for the user themself' do
      let(:user) { owner }

      include_examples 'sees the answers to visible fields'
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      include_examples 'sees the answers to visible fields'
    end

    context 'when the user is a pending invitee' do
      let(:owner) { create(:invited_user) }
      let(:user) { nil }

      include_examples 'sees the answers to visible fields'
    end
  end
end
