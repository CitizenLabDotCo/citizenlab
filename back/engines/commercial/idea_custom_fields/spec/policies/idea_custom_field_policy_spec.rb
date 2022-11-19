# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFields::IdeaCustomFieldPolicy do
  subject(:policy) { described_class.new(user, idea_custom_field) }

  let(:custom_form) { create(:custom_form) }
  let!(:project) { create(:project, custom_form: custom_form) }
  let!(:idea_custom_field) { create(:custom_field, resource: custom_form) }

  context 'for a normal user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:upsert_by_code) }
    it { is_expected.not_to permit(:update) }
  end

  context "for a moderator of the field's project" do
    let(:user) { create(:project_moderator, projects: [project]) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:upsert_by_code) }
    it { is_expected.to permit(:update) }
  end

  context "for a folder moderator of the field's project" do
    let(:folder) { create(:project_folder, projects: [project]) }
    let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

    before do
      # The after create hook for project_folder changes records, so reload.
      folder.reload
      project.reload
      user.reload
    end

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:upsert_by_code) }
    it { is_expected.to permit(:update) }
  end

  context 'for a moderator of another project' do
    let(:user) { create(:project_moderator) }

    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:upsert_by_code) }
    it { is_expected.not_to permit(:update) }
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:upsert_by_code) }
  end

  context 'permitted_attributes' do
    let(:user) { create :admin }
    let!(:idea_custom_field) { create :custom_field, resource: custom_form, code: code }

    describe 'for title_multiloc field' do
      let(:code) { 'title_multiloc' }

      it 'only allows description changes' do
        expect(policy.permitted_attributes).to match_array [{ description_multiloc: CL2_SUPPORTED_LOCALES }]
      end
    end

    describe 'for body_multiloc field' do
      let(:code) { 'body_multiloc' }

      it 'only allows description changes' do
        expect(policy.permitted_attributes).to match_array [{ description_multiloc: CL2_SUPPORTED_LOCALES }]
      end
    end

    describe 'for proposed_budget field' do
      let(:code) { 'proposed_budget' }

      it 'allows all changes' do
        expect(policy.permitted_attributes).to match_array [
          :required, :enabled,
          { title_multiloc: CL2_SUPPORTED_LOCALES, description_multiloc: CL2_SUPPORTED_LOCALES }
        ]
      end
    end

    describe 'for topic_ids field' do
      let(:code) { 'topic_ids' }

      it 'allows all changes' do
        expect(policy.permitted_attributes).to match_array [
          :required, :enabled,
          { title_multiloc: CL2_SUPPORTED_LOCALES, description_multiloc: CL2_SUPPORTED_LOCALES }
        ]
      end
    end

    describe 'for location_description field' do
      let(:code) { 'location_description' }

      it 'allows all changes' do
        expect(policy.permitted_attributes).to match_array [
          :required, :enabled,
          { title_multiloc: CL2_SUPPORTED_LOCALES, description_multiloc: CL2_SUPPORTED_LOCALES }
        ]
      end
    end

    describe 'for idea_images_attributes field' do
      let(:code) { 'idea_images_attributes' }

      it 'allows all changes' do
        expect(policy.permitted_attributes).to match_array [
          :required, :enabled,
          { title_multiloc: CL2_SUPPORTED_LOCALES, description_multiloc: CL2_SUPPORTED_LOCALES }
        ]
      end
    end

    describe 'for idea_files_attributes field' do
      let(:code) { 'idea_files_attributes' }

      it 'allows all changes' do
        expect(policy.permitted_attributes).to match_array [
          :required, :enabled,
          { title_multiloc: CL2_SUPPORTED_LOCALES, description_multiloc: CL2_SUPPORTED_LOCALES }
        ]
      end
    end

    describe 'for a custom custom field' do
      let(:code) { nil }

      it 'allows all changes' do
        expect(policy.permitted_attributes).to match_array [
          :required, :enabled,
          { title_multiloc: CL2_SUPPORTED_LOCALES, description_multiloc: CL2_SUPPORTED_LOCALES }
        ]
      end
    end

    describe 'for a linear_scale field' do
      let!(:idea_custom_field) { create(:custom_field_linear_scale, resource: custom_form) }

      it 'allows all changes' do
        expect(policy.permitted_attributes).to match_array [
          :required, :enabled, :maximum,
          {
            title_multiloc: CL2_SUPPORTED_LOCALES,
            description_multiloc: CL2_SUPPORTED_LOCALES,
            minimum_label_multiloc: CL2_SUPPORTED_LOCALES,
            maximum_label_multiloc: CL2_SUPPORTED_LOCALES
          }
        ]
      end
    end
  end
end
