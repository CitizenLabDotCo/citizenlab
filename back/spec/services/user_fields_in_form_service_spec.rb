# frozen_string_literal: true

require 'rails_helper'

describe UserFieldsInFormService do
  describe '#should_merge_user_fields_into_idea?' do
    context 'native survey' do
      before do
        @user = create(:user, custom_field_answers: [build(:custom_field_answer, key: 'age', value: 30)])
        @project = create(:single_phase_native_survey_project, phase_attrs: {
          with_permissions: true
        })
        @phase = @project.phases.first

        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @permission.update!(custom_fields_behavior: 'custom', user_fields_in_form: false, user_data_collection: 'all_data')
        create(:permissions_custom_field, permission: @permission, custom_field: create(:custom_field, key: 'age'))

        @idea = create(:idea, author: @user)
      end

      it 'returns true when all conditions are met' do
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be true
      end

      it 'returns false if user is not the author of the idea' do
        idea = create(:idea, author: create(:user))
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, idea)).to be false
      end

      it 'returns false if user fields are in form' do
        @permission.update!(user_fields_in_form: true)
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be false
      end

      it 'returns false if user_data_collection is set to anonymous' do
        @permission.update!(user_data_collection: 'anonymous')
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be false
      end
    end

    context 'community monitor' do
      before do
        @user = create(:user, custom_field_answers: [build(:custom_field_answer, key: 'age', value: 30)])
        @phase = create(:community_monitor_survey_phase, with_permissions: true)

        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @permission.update!(custom_fields_behavior: 'custom', user_fields_in_form: false, user_data_collection: 'all_data')
        create(:permissions_custom_field, permission: @permission, custom_field: create(:custom_field, key: 'age'))

        @idea = create(:idea, author: @user)
      end

      it 'returns true when all conditions are met' do
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be true
      end

      it 'returns true if user_data_collection is set to demographics_only' do
        @permission.update!(user_data_collection: 'demographics_only')
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be true
      end

      it 'returns false if user_data_collection is set to anonymous' do
        @permission.update!(user_data_collection: 'anonymous')
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be false
      end
    end

    context 'ideation' do
      before do
        @user = create(:user, custom_field_answers: [build(:custom_field_answer, key: 'age', value: 30)])
        @project = create(:single_phase_ideation_project, phase_attrs: {
          with_permissions: true
        })
        @phase = @project.phases.first

        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @permission.update!(custom_fields_behavior: 'custom', user_fields_in_form: false, user_data_collection: 'all_data')
        create(:permissions_custom_field, permission: @permission, custom_field: create(:custom_field, key: 'age'))

        @idea = create(:idea, author: @user)
      end

      it 'returns true when all conditions are met' do
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be true
      end

      it 'returns false if user is not the author of the idea' do
        idea = create(:idea, author: create(:user))
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, idea)).to be false
      end

      it 'returns true if user_data_collection is set to anonymous (attribute should be ignored)' do
        # This attribute is only used in surveys and should always be `all_data` in ideation.
        # However, since we support changing participation methods, it might be that someone
        # switched from a survey with user_data_collection: 'anonymous' or whatever.
        # So just adding this check to be sure it really gets ignored.
        @permission.update!(user_data_collection: 'anonymous')
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be true
      end

      it 'returns false if user is anonymous' do
        @idea.update!(anonymous: true)
        expect(described_class.should_merge_user_fields_into_idea?(@user, @phase, @idea)).to be false
      end
    end
  end

  describe '#merge_user_fields_into_idea' do
    before do
      @phase = create(:native_survey_phase, with_permissions: true)
      permission = @phase.permissions.find_by(action: 'posting_idea')
      permission.update!(custom_fields_behavior: 'custom')
      create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field, key: 'age'))
      create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field, key: 'city'))
      create(:custom_field, key: 'favorite_color', enabled: true)
    end

    it 'merges user custom fields into idea custom fields with prefixed keys' do
      user = build(:user, custom_field_answers: [
        build(:custom_field_answer, key: 'age', value: 30),
        build(:custom_field_answer, key: 'city', value: 'New York')
      ])

      merged_values = described_class.merge_user_fields_into_idea(
        user,
        @phase,
        { 'satisfaction' => 'high' }
      )

      expect(merged_values).to eq({
        'u_age' => 30,
        'u_city' => 'New York',
        'satisfaction' => 'high'
      })
    end

    it 'does not include user fields that are not explicitly asked in permissions_custom_fields' do
      user = build(:user, custom_field_answers: [
        build(:custom_field_answer, key: 'age', value: 30),
        build(:custom_field_answer, key: 'city', value: 'New York'),
        build(:custom_field_answer, key: 'gender', value: 'female'),
        build(:custom_field_answer, key: 'favorite_color', value: 'green')
      ])

      merged_values = described_class.merge_user_fields_into_idea(
        user,
        @phase,
        { 'satisfaction' => 'high' }
      )

      expect(merged_values).to eq({
        'u_age' => 30,
        'u_city' => 'New York',
        'satisfaction' => 'high'
      })
    end

    it 'pre-populates user fields when custom_fields_behavior is the default' do
      user = build(:user, custom_field_answers: [
        build(:custom_field_answer, key: 'age', value: 30),
        build(:custom_field_answer, key: 'city', value: 'New York')
      ])

      phase = create(:native_survey_phase, with_permissions: true)

      merged_values = described_class.merge_user_fields_into_idea(
        user,
        phase,
        {}
      )

      # Should include user fields even though permissions_custom_fields are not persisted to database
      expect(merged_values).to eq({
        'u_age' => 30,
        'u_city' => 'New York'
      })
    end
  end

  describe '#should_merge_user_fields_from_idea_into_user?' do
    context 'native survey' do
      before do
        @user = create(:user, custom_field_answers: [build(:custom_field_answer, key: 'age', value: 30)])
        @project = create(:single_phase_native_survey_project, phase_attrs: {
          with_permissions: true
        })
        @phase = @project.phases.first

        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @permission.update!(custom_fields_behavior: 'custom', user_fields_in_form: true, user_data_collection: 'all_data')
        create(:permissions_custom_field, permission: @permission, custom_field: create(:custom_field, key: 'age'))

        @idea = create(
          :idea,
          author: @user,
          project: @project,
          creation_phase: @phase
        )
      end

      it 'returns true when all conditions are met' do
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be true
      end

      it 'returns false if user is not the author of the idea' do
        idea = create(
          :idea,
          author: create(:user),
          project: @project,
          creation_phase: @phase
        )
        expect(described_class.should_merge_user_fields_from_idea_into_user?(idea, @user, @phase)).to be false
      end

      it 'returns false if user fields are in not form' do
        @permission.update!(user_fields_in_form: false)
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be false
      end

      it 'returns false if user_data_collection is set to anonymous' do
        @permission.update!(user_data_collection: 'anonymous')
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be false
      end

      it 'returns true if user_data_collection is set to demographics_only' do
        @permission.update!(user_data_collection: 'demographics_only')
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be true
      end
    end

    context 'community monitor' do
      before do
        @user = create(:user, custom_field_answers: [build(:custom_field_answer, key: 'age', value: 30)])
        @phase = create(:community_monitor_survey_phase, with_permissions: true)
        @project = @phase.project

        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @permission.update!(custom_fields_behavior: 'custom', user_fields_in_form: true, user_data_collection: 'all_data')
        create(:permissions_custom_field, permission: @permission, custom_field: create(:custom_field, key: 'age'))

        @idea = create(
          :idea,
          author: @user,
          project: @project,
          creation_phase: @phase
        )
      end

      it 'returns true when all conditions are met' do
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be true
      end

      it 'returns true if user_data_collection is set to demographics_only' do
        @permission.update!(user_data_collection: 'demographics_only')
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be true
      end

      it 'returns false if user_data_collection is set to anonymous' do
        @permission.update!(user_data_collection: 'anonymous')
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be false
      end
    end

    context 'ideation' do
      before do
        @user = create(:user, custom_field_answers: [build(:custom_field_answer, key: 'age', value: 30)])
        @project = create(:single_phase_ideation_project, phase_attrs: {
          with_permissions: true
        })
        @phase = @project.phases.first

        @permission = @phase.permissions.find_by(action: 'posting_idea')
        @permission.update!(custom_fields_behavior: 'custom', user_fields_in_form: true, user_data_collection: 'all_data')
        create(:permissions_custom_field, permission: @permission, custom_field: create(:custom_field, key: 'age'))

        @idea = create(
          :idea,
          author: @user,
          project: @project
        )
      end

      it 'returns true when all conditions are met' do
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be true
      end

      it 'returns false if user is not the author of the idea' do
        idea = create(
          :idea,
          author: create(:user),
          project: @project
        )
        expect(described_class.should_merge_user_fields_from_idea_into_user?(idea, @user, @phase)).to be false
      end

      it 'returns false if user fields are in not form' do
        @permission.update!(user_fields_in_form: false)
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be false
      end

      it 'returns true if user_data_collection is set to anonymous (attribute should be ignored)' do
        # This attribute is only used in surveys and should always be `all_data` in ideation.
        # However, since we support changing participation methods, it might be that someone
        # switched from a survey with user_data_collection: 'anonymous' or whatever.
        # So just adding this check to be sure it really gets ignored.
        @permission.update!(user_data_collection: 'anonymous')
        expect(described_class.should_merge_user_fields_from_idea_into_user?(@idea, @user, @phase)).to be true
      end
    end
  end

  describe '#merge_user_fields_from_idea_into_user!' do
    it 'merges user fields from idea into user' do
      user = build(:user, custom_field_answers: [build(:custom_field_answer, key: 'city', value: 'New York')])
      idea = build(:idea, custom_field_answers: [
        build(:custom_field_answer, key: 'satisfaction', value: 'high'),
        build(:custom_field_answer, key: 'u_age', value: 30)
      ])

      described_class.merge_user_fields_from_idea_into_user!(idea, user)
      expect(user.custom_field_answers.to_h { [it.key, it.value] }).to include('city' => 'New York', 'age' => 30)
    end

    it 'overwrites user fields if they already exist' do
      user = build(:user, custom_field_answers: [build(:custom_field_answer, key: 'age', value: 25)])
      idea = build(:idea, custom_field_answers: [
        build(:custom_field_answer, key: 'satisfaction', value: 'high'),
        build(:custom_field_answer, key: 'u_age', value: 30)
      ])

      described_class.merge_user_fields_from_idea_into_user!(idea, user)
      expect(user.custom_field_answers.to_h { [it.key, it.value] }).to include('age' => 30)
    end

    it 'merges other text values from idea into user' do
      user = build(:user)
      idea = build(:idea, custom_field_answers: [
        build(:custom_field_answer, key: 'u_pet', value: 'other'),
        build(:custom_field_answer, key: 'u_pet_other', value: 'A ferret')
      ])

      described_class.merge_user_fields_from_idea_into_user!(idea, user)

      expect(user.custom_field_answers.to_h { [it.key, it.value] }).to eq({ 'pet' => 'other', 'pet_other' => 'A ferret' })
    end
  end

  describe '#add_user_fields_to_form' do
    it 'adds user custom fields to the form with prefixed keys' do
      project = create(:single_phase_native_survey_project, phase_attrs: {
        with_permissions: true
      })
      phase = project.phases.first

      # Create permission with user custom field
      permission = phase.permissions.find_by(action: 'posting_idea')
      permission.update!(custom_fields_behavior: 'custom', user_fields_in_form: true)
      create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field, key: 'age'))

      # Create survey form
      custom_form = create(:custom_form, :with_default_fields, participation_context: phase)
      create(:custom_field_page, resource: custom_form)
      select_field = create(:custom_field_select, resource: custom_form)
      create(:custom_field_option, custom_field: select_field)
      create(:custom_field_page, resource: custom_form)
      create(:custom_field_text, resource: custom_form)
      create(:custom_field_matrix_linear_scale, resource: custom_form)
      create(:custom_field_form_end_page, resource: custom_form)

      fields = custom_form.custom_fields
      participation_method = phase.pmethod

      updated_fields = described_class.add_user_fields_to_form(
        fields,
        participation_method,
        custom_form
      )

      keys = updated_fields.pluck(:key)
      last_three_field_keys = keys.slice(keys.length - 3, keys.length)
      expect(last_three_field_keys).to eq(%w[
        user_page
        u_age
        form_end
      ])
    end

    context 'with survey logic' do
      let(:phase) { create(:native_survey_phase, with_permissions: true) }
      let(:permission) { phase.permissions.find_by(action: 'posting_idea') }
      let(:custom_form) { create(:custom_form, participation_context: phase) }
      let!(:page1) { create(:custom_field_page, resource: custom_form) }
      let!(:select_field) { create(:custom_field_select, :with_options, resource: custom_form) }
      let!(:page2) { create(:custom_field_page, resource: custom_form) }
      let!(:form_end) { create(:custom_field_form_end_page, resource: custom_form) }

      before do
        select_field.update!(logic: { 'rules' => [
          { 'if' => select_field.options.first.id, 'goto_page_id' => form_end.id },
          { 'if' => 'any_other_answer', 'goto_page_id' => page2.id }
        ] })
        page1.update!(logic: { 'next_page_id' => form_end.id })
        page2.update!(logic: { 'next_page_id' => form_end.id })
      end

      def add_user_fields
        described_class.add_user_fields_to_form(custom_form.custom_fields.order(:ordering).to_a, phase.pmethod, custom_form)
      end

      context 'when user fields are asked in the form' do
        before do
          permission.update!(custom_fields_behavior: 'custom', user_fields_in_form: true)
          create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field, key: 'age'))
        end

        it 'points the end page targets to the user page in memory only' do
          fields = add_user_fields
          user_page = fields.find { |field| field.key == 'user_page' }

          expect(fields.find { |field| field.id == select_field.id }.logic['rules'].pluck('goto_page_id')).to eq [user_page.id, page2.id]
          expect(fields.find { |field| field.id == page1.id }.logic).to eq('next_page_id' => user_page.id)
          expect(fields.find { |field| field.id == page2.id }.logic).to eq('next_page_id' => user_page.id)
          expect(select_field.reload.logic['rules'].first['goto_page_id']).to eq form_end.id
          expect(page1.reload.logic).to eq('next_page_id' => form_end.id)
        end

        it 'gives the user page a new id every time (currently existing bug, B12)' do
          first_id = add_user_fields.find { |field| field.key == 'user_page' }.id
          second_id = add_user_fields.find { |field| field.key == 'user_page' }.id

          expect(first_id).not_to eq second_id
        end

        it 'raises for a form without an end page, whether or not it has logic (currently existing bug, B12)' do
          fields = custom_form.custom_fields.order(:ordering).to_a.reject(&:form_end_page?)
          fields_without_logic = custom_form.custom_fields.order(:ordering).to_a.reject(&:form_end_page?).each { |field| field.logic = {} }
          nil_id_error = [NoMethodError, /undefined method ['`]id' for nil/]

          expect { described_class.add_user_fields_to_form(fields, phase.pmethod, custom_form) }.to raise_error(*nil_id_error)
          expect { described_class.add_user_fields_to_form(fields_without_logic, phase.pmethod, custom_form) }.to raise_error(*nil_id_error)
        end
      end

      context 'when user fields are not asked in the form' do
        it 'leaves the logic alone' do
          fields = add_user_fields

          expect(fields.pluck(:key)).not_to include('user_page')
          expect(fields.find { |field| field.id == page1.id }.logic).to eq('next_page_id' => form_end.id)
        end
      end
    end
  end
end
