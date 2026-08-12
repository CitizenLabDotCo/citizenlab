# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AnswerableFilter do
  def filter(field)
    described_class.new(field, User)
  end

  context 'with a select field' do
    let!(:field) { create(:custom_field_select, key: 'color') }
    let!(:red) { create(:user, custom_field_values: { 'color' => 'red' }) }
    let!(:blue) { create(:user, custom_field_values: { 'color' => 'blue' }) }
    let!(:unanswered) { create(:user) }

    it 'eq matches users with that answer' do
      expect(filter(field).eq('red')).to contain_exactly(red)
    end

    it 'not_eq matches users with another answer and users without one' do
      expect(filter(field).not_eq('red')).to contain_exactly(blue, unanswered)
    end

    it 'one_of matches users with any of the answers' do
      expect(filter(field).one_of(%w[red green])).to contain_exactly(red)
    end

    it 'not_one_of matches users with other answers and users without one' do
      expect(filter(field).not_one_of(%w[red green])).to contain_exactly(blue, unanswered)
    end

    it 'present and absent split users by having an answer' do
      expect(filter(field).present).to contain_exactly(red, blue)
      expect(filter(field).absent).to contain_exactly(unanswered)
    end
  end

  context 'with a multiselect field' do
    let!(:field) { create(:custom_field_multiselect, key: 'pets') }
    let!(:cat_and_dog) { create(:user, custom_field_values: { 'pets' => %w[cat dog] }) }
    let!(:dog_only) { create(:user, custom_field_values: { 'pets' => ['dog'] }) }
    let!(:none_selected) { create(:user, custom_field_values: { 'pets' => [] }) }
    let!(:unanswered) { create(:user) }

    it 'eq matches users who selected the option, whatever else they selected' do
      expect(filter(field).eq('cat')).to contain_exactly(cat_and_dog)
      expect(filter(field).eq('dog')).to contain_exactly(cat_and_dog, dog_only)
    end

    it 'not_eq matches users who did not select the option, including empty and missing answers' do
      expect(filter(field).not_eq('cat')).to contain_exactly(dog_only, none_selected, unanswered)
    end

    it 'one_of matches users who selected any of the options' do
      expect(filter(field).one_of(%w[cat fish])).to contain_exactly(cat_and_dog)
    end

    it 'present requires a non-empty selection' do
      expect(filter(field).present).to contain_exactly(cat_and_dog, dog_only)
      expect(filter(field).absent).to contain_exactly(none_selected, unanswered)
    end
  end

  context 'with a text field' do
    let!(:field) { create(:custom_field, key: 'motto') }
    let!(:carpe) { create(:user, custom_field_values: { 'motto' => 'carpe diem' }) }
    let!(:yolo) { create(:user, custom_field_values: { 'motto' => 'yolo' }) }
    let!(:unanswered) { create(:user) }

    it 'eq matches the exact text' do
      expect(filter(field).eq('yolo')).to contain_exactly(yolo)
    end

    it 'matching and not_matching filter by pattern, not_matching including users without an answer' do
      expect(filter(field).matching('%diem%')).to contain_exactly(carpe)
      expect(filter(field).not_matching('%diem%')).to contain_exactly(yolo, unanswered)
    end
  end

  context 'with a number field' do
    let!(:field) { create(:custom_field_number, key: 'bikes') }
    let!(:two) { create(:user, custom_field_values: { 'bikes' => 2 }) }
    let!(:five) { create(:user, custom_field_values: { 'bikes' => 5 }) }
    let!(:unanswered) { create(:user) }

    it 'eq compares numerically, so an integer answer matches its float form' do
      expect(filter(field).eq(2)).to contain_exactly(two)
      expect(filter(field).eq(2.0)).to contain_exactly(two)
    end

    it 'compares with gt, gteq, lt and lteq' do
      expect(filter(field).gt(2)).to contain_exactly(five)
      expect(filter(field).gteq(2)).to contain_exactly(two, five)
      expect(filter(field).lt(5)).to contain_exactly(two)
      expect(filter(field).lteq(1)).to be_empty
    end

    it 'one_of accepts a range' do
      expect(filter(field).one_of(1..3)).to contain_exactly(two)
    end

    it 'exposes the minimum and maximum answer' do
      expect(filter(field).min_value).to eq 2
      expect(filter(field).max_value).to eq 5
    end
  end

  context 'with a checkbox field' do
    let!(:field) { create(:custom_field_checkbox, key: 'attends') }
    let!(:yes) { create(:user, custom_field_values: { 'attends' => true }) }
    let!(:no) { create(:user, custom_field_values: { 'attends' => false }) }
    let!(:unanswered) { create(:user) }

    it 'eq distinguishes false answers from missing ones' do
      expect(filter(field).eq(true)).to contain_exactly(yes)
      expect(filter(field).eq(false)).to contain_exactly(no)
      expect(filter(field).absent).to contain_exactly(unanswered)
    end
  end

  context 'with a date field' do
    let!(:field) { create(:custom_field_date, key: 'member_since') }
    let!(:january) { create(:user, custom_field_values: { 'member_since' => '2026-01-15' }) }
    let!(:march) { create(:user, custom_field_values: { 'member_since' => '2026-03-15' }) }

    it 'filters with before, after and on' do
      expect(filter(field).before('2026-02-01')).to contain_exactly(january)
      expect(filter(field).after('2026-02-01')).to contain_exactly(march)
      expect(filter(field).on('2026-03-15')).to contain_exactly(march)
    end
  end

  context 'with an idea scope' do
    let!(:project) { create(:project) }
    let!(:form) { create(:custom_form, participation_context: project) }
    let!(:field) { create(:custom_field_linear_scale, resource: form, key: 'rating') }
    let!(:good) { create(:idea, project: project, custom_field_values: { 'rating' => 4 }) }
    let!(:bad) { create(:idea, project: project, custom_field_values: { 'rating' => 1 }) }

    it 'filters ideas by their answers' do
      expect(described_class.new(field, Idea).eq(4)).to contain_exactly(good)
    end

    it 'does not mix in user answers for the same key' do
      create(:custom_field_number, key: 'rating')
      create(:user, custom_field_values: { 'rating' => 4 })

      expect(described_class.new(field, Idea).eq(4)).to contain_exactly(good)
      expect(described_class.new(field, Idea.where(project: project)).present).to contain_exactly(good, bad)
    end
  end
end
