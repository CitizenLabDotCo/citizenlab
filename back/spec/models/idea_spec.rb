# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Idea, type: :model do
  context 'associations' do
    it { is_expected.to have_many(:votes) }
  end

  context 'Default factory' do
    it 'is valid' do
      expect(build(:idea)).to be_valid
    end

    it 'can create an idea without author' do
      expect(build(:idea, author: nil).valid?(:create)).to be true
    end

    it 'cannot create an idea without author on publication' do
      expect(build(:idea, author: nil).valid?(:publication)).to be false
    end

    context 'without custom form' do
      it 'can publish an idea without custom fields' do
        project = create :project
        CustomForm.where(project: project).first&.destroy!
        idea = build :idea, project: project, custom_field_values: nil
        expect(idea.save(context: :publication)).to be true
      end
    end
  end

  context 'with custom fields', skip: !CitizenLab.ee? do
    let(:project) { create :project }
    let(:form) { create :custom_form, project: project }
    let!(:required_field) { create :custom_field, :for_custom_form, resource: form, required: true, input_type: 'number' }
    let!(:optional_field) { create :custom_field_select, :with_options, :for_custom_form, resource: form, required: false }
    let!(:disabled_field) { create :custom_field, :for_custom_form, resource: form, enabled: false, required: false, input_type: 'text' }

    context 'when creating ideas' do
      let(:idea) { build :idea, project: project }

      context 'on create' do
        it 'can persist an idea' do
          idea.custom_field_values = { required_field.key => 63, optional_field.key => 'option1' }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea without optional fields' do
          idea.custom_field_values = { required_field.key => 7 }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea with a non-existing field' do
          idea.custom_field_values = { required_field.key => 15, 'nonexisting_field' => 22 }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea with an invalid field value' do
          long_title = 'My long idea title. ' * 100
          idea.custom_field_values = { required_field.key => 80, 'title_multiloc' => { 'en' => long_title } }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea without required field values' do
          idea.custom_field_values = { optional_field.key => 'option1' }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea with non-existing field options' do
          idea.custom_field_values = { required_field.key => 15, optional_field.key => 'non-existing-option' }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea with disabled field values' do
          idea.custom_field_values = { required_field.key => 15, disabled_field.key => 'my value' }
          expect(idea.valid?(:create)).to be true
        end
      end

      context 'on publication' do
        it 'can persist an idea' do
          idea.custom_field_values = { required_field.key => 63, optional_field.key => 'option1' }
          expect(idea.valid?(:publication)).to be true
        end

        it 'can persist an idea without optional fields' do
          idea.custom_field_values = { required_field.key => 7 }
          expect(idea.valid?(:publication)).to be true
        end

        it 'cannot persist an idea with a non-existing field' do
          idea.custom_field_values = { required_field.key => 15, 'nonexisting_field' => 22 }
          expect(idea.valid?(:publication)).to be false
        end

        it 'cannot persist an idea with an invalid field value' do
          long_title = 'My long idea title. ' * 100
          idea.custom_field_values = { required_field.key => 80, 'title_multiloc' => { 'en' => long_title } }
          expect(idea.valid?(:publication)).to be false
        end

        it 'cannot persist an idea without required field values' do
          idea.custom_field_values = { optional_field.key => 'option1' }
          expect(idea.valid?(:publication)).to be false
        end

        it 'cannot persist an idea with non-existing field options' do
          idea.custom_field_values = { required_field.key => 15, optional_field.key => 'non-existing-option' }
          expect(idea.valid?(:publication)).to be false
        end

        it 'cannot persist an idea with disabled field values' do
          idea.custom_field_values = { required_field.key => 15, disabled_field.key => 'my value' }
          expect(idea.valid?(:publication)).to be false
        end
      end

      it 'can persist a draft idea without required field values' do
        idea.publication_status = 'draft'
        expect(idea.save).to be true
      end

      it 'does not persist an idea with disabled field values' do
        disabled_field_options = { resource: form, required: false, enabled: false, input_type: 'text' }
        disabled_field = create :custom_field, :for_custom_form, disabled_field_options
        idea.custom_field_values = { required_field.key => 194, disabled_field.key => 'my text' }
        idea.location_description = 'Brussels'
        expect(idea.save).to be true
        idea.reload
        expect(idea.location_description).to eq 'Brussels'
        expect(idea.custom_field_values).to eq({ required_field.key => 194 })
      end
    end

    context 'when updating ideas' do
      let(:idea) { create :idea, project: project, custom_field_values: { required_field.key => 1 } }

      %i[update publication].each do |validation_context|
        context "on #{validation_context}" do
          it 'can persist an idea' do
            idea.custom_field_values = { required_field.key => 63, optional_field.key => 'option1' }
            expect(idea.valid?(validation_context)).to be true
          end

          it 'can persist an idea without optional fields' do
            idea.custom_field_values = { required_field.key => 7 }
            expect(idea.valid?(validation_context)).to be true
          end

          it 'cannot persist an idea with a non-existing field' do
            idea.custom_field_values = { required_field.key => 15, 'nonexisting_field' => 22 }
            expect(idea.valid?(validation_context)).to be false
          end

          it 'cannot persist an idea with an invalid field value' do
            long_title = 'My long idea title. ' * 100
            idea.custom_field_values = { required_field.key => 80, 'title_multiloc' => { 'en' => long_title } }
            expect(idea.valid?(validation_context)).to be false
          end

          it 'cannot persist an idea without required field values' do
            idea.custom_field_values = { optional_field.key => 'option1' }
            expect(idea.valid?(validation_context)).to be false
          end

          it 'cannot persist an idea with non-existing field options' do
            idea.custom_field_values = { required_field.key => 15, optional_field.key => 'non-existing-option' }
            expect(idea.valid?(validation_context)).to be false
          end

          it 'cannot persist an idea with disabled field values' do
            idea.custom_field_values = { required_field.key => 15, disabled_field.key => 'my value' }
            expect(idea.valid?(validation_context)).to be false
          end
        end
      end

      it 'can persist other attributes of an idea with unchanged invalid custom field values' do
        idea.update!(custom_field_values: { required_field.key => 7 })
        optional_field.update! required: true
        idea.reload
        expect(idea.update(author: create(:user))).to be true
        # Make a valid change to the field values to trigger the custom field values validation,
        # because the validation is only performed if `custom_field_values` changes.
        idea.custom_field_values['optional_field.key'] = 'option1'
        expect(idea.valid?).to be false
      end

      it 'cannot persist other attributes of an idea with unchanged invalid custom field values when publishing' do
        idea.update!(custom_field_values: { required_field.key => 7 })
        optional_field.update! required: true
        idea.title_multiloc = { 'en' => 'Updated idea title' }
        idea.reload
        expect(idea.save(context: :publication)).to be false
      end

      it 'can persist an idea without disabled required field values' do
        disabled_field.update! required: true
        idea.custom_field_values = { required_field.key => 39 }
        expect(idea.save).to be true
      end
    end
  end

  context 'hooks' do
    it 'should set the author name on creation' do
      u = create(:user)
      idea = create(:idea, author: u)
      expect(idea.author_name).to eq u.full_name
    end

    it 'should generate a slug on creation' do
      idea = create(:idea, slug: nil)
      expect(idea.slug).to be_present
    end
  end

  context 'feedback_needed' do
    it 'should select ideas with no official feedback or no idea status change' do
      ideas = [
        create(:idea, idea_status: create(:idea_status_proposed)),
        create(:idea, idea_status: create(:idea_status_accepted)),
        create(:idea, idea_status: create(:idea_status_proposed)),
        create(:idea, idea_status: create(:idea_status_viewed))
      ]
      create(:official_feedback, post: ideas[0])

      expect(Idea.feedback_needed.ids).to match_array [ideas[2].id]
    end
  end

  context 'published at' do
    it 'gets set immediately when creating a published idea' do
      t = Time.now
      travel_to t do
        idea = create(:idea, publication_status: 'published')
        expect(idea.published_at.to_i).to eq t.to_i
      end
    end

    it 'stays empty when creating a draft' do
      idea = create(:idea, publication_status: 'draft')
      expect(idea.published_at).to be_nil
    end

    it 'gets filled in when publishing a draft' do
      idea = create(:idea, publication_status: 'draft')
      t = Time.now + 1.week
      travel_to t do
        idea.update(publication_status: 'published')
        expect(idea.published_at.to_i).to eq t.to_i
      end
    end

    it "doesn't change again when already published once" do
      t = Time.now
      travel_to t
      idea = create(:idea, publication_status: 'published')
      travel_to t + 1.week
      idea.update(publication_status: 'closed')
      travel_to t + 1.week
      idea.update(publication_status: 'published')
      expect(idea.published_at.to_i).to eq t.to_i
      travel_back
    end
  end

  context 'idea_status' do
    it 'gets set to proposed on creation when not set' do
      create(:idea_status, code: 'proposed')
      idea = create(:idea, idea_status: nil)
      expect(idea.idea_status_id).to eq IdeaStatus.find_by(code: 'proposed').id
    end
  end

  describe 'order_new' do
    before do
      5.times do |i|
        travel_to Time.now + i.week do
          create(:idea)
        end
      end
    end

    it 'sorts from new to old by default' do
      time_serie = Idea.order_new.pluck(:published_at)
      expect(time_serie).to eq time_serie.sort.reverse
    end

    it 'sorts from new to old when asking desc' do
      time_serie = Idea.order_new(:desc).pluck(:published_at)
      expect(time_serie).to eq time_serie.sort.reverse
    end

    it 'sorts from old to new when asking asc' do
      time_serie = Idea.order_new(:asc).pluck(:published_at)
      expect(time_serie).to eq time_serie.sort
    end
  end

  describe 'order_popular' do
    before do
      5.times do |_i|
        idea = create(:idea)
        rand(20).times { create(:vote, votable: idea, mode: %w[up down][rand(2)]) }
      end
    end

    it 'sorts from popular to unpopular by default' do
      score_serie = Idea.order_popular.map(&:score)
      expect(score_serie).to eq score_serie.sort.reverse
    end

    it 'sorts from popular to unpopular when asking desc' do
      score_serie = Idea.order_popular(:desc).map(&:score)
      expect(score_serie).to eq score_serie.sort.reverse
    end

    it 'sorts from unpopular to popular when asking asc' do
      score_serie = Idea.order_popular(:asc).map(&:score)
      expect(score_serie).to eq score_serie.sort
    end
  end

  describe 'order_status' do
    it 'sorts from high status to low status when asked desc' do
      status_sorted = Idea.order_status(:desc).map(&:id)
      expect(status_sorted).to eq Idea.all.sort_by { |idea| idea.idea_status.ordering }.map(&:id).reverse
    end
  end

  describe 'idea search' do
    it 'should return results with exact prefixes' do
      create(:idea, title_multiloc: { 'nl-BE' => 'Bomen in het park' })
      srx_results = Idea.all.search_by_all 'Bomen'
      expect(srx_results.size).to be > 0
    end
  end

  describe 'body sanitizer' do
    it 'sanitizes script tags in the body' do
      idea = create(:idea, body_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(idea.body_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!' })
    end

    it "allows embedded youtube video's in the body" do
      idea = create(:idea, body_multiloc: {
        'en' => '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/Bu2wNKlVRzE?showinfo=0" height="242.5" width="485" data-blot-formatter-unclickable-bound="true"></iframe>'
      })
      expect(idea.body_multiloc).to eq({ 'en' => '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/Bu2wNKlVRzE?showinfo=0" height="242.5" width="485" data-blot-formatter-unclickable-bound="true"></iframe>' })
    end
  end

  describe 'title' do
    it 'is stripped from spaces at beginning and ending' do
      idea = create(:idea, title_multiloc: { 'en' => ' my fantastic idea  ' })
      expect(idea.title_multiloc['en']).to eq 'my fantastic idea'
    end
  end

  describe 'body' do
    let(:idea) { build(:idea) }

    it 'is invalid if it has no true content' do
      idea.body_multiloc = { 'en' => '<p> </p>' }
      expect(idea).to be_invalid
    end
  end
end
