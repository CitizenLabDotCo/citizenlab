# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Sluggable do
  describe do
    let(:sluggable_factories) do
      # It's challenging to define custom models for this spec, as
      # they need to be part of the schema to test well. Instead we
      # reuse existing models for this spec, while still trying to
      # to keep this spec as generic as possible.
      {
        no_slug: :follower,
        slug_from_first_title: :group,
        slug_unless_invitation_pending: :user
      }
    end

    describe 'generate_slug' do
      # These disabled RuboCop rules are necessary to permit the successful creation and removal of a dynamic class,
      # the leakage of which is what the rubocop rules are trying to prevent.
      before(:context) do # rubocop:disable RSpec/BeforeAfterAll
        unless Object.const_defined?(:TempSluggableTestModel)
          Object.const_set(:TempSluggableTestModel, Class.new(ApplicationRecord) do
            include Sluggable
            connection.create_table(:test_models, temporary: true) do |t|
              t.jsonb :title_multiloc
              t.string :slug
            end
            self.table_name = 'test_models'
            slug from: proc { |it| it.title_multiloc }
          end)
        end
      end
      # RuboCop:enable RSpec/BeforeAfterAll

      let(:test_model) { TempSluggableTestModel }

      after(:all) do # rubocop:disable RSpec/BeforeAfterAll
        if ActiveRecord::Base.connection.table_exists?(:test_models)
          ActiveRecord::Base.connection.drop_table(:test_models)
        end
        if Object.const_defined?(:TempSluggableTestModel)
          # rubocop:disable RSpec/RemoveConst
          Object.send(:remove_const, :TempSluggableTestModel)
          # rubocop:enable RSpec/RemoveConst
        end
      end
      # RuboCop:enable RSpec/BeforeAfterAll

      it 'does not set a slug when `slug` is not included in the class' do
        sluggable = create(sluggable_factories[:no_slug])
        expect(sluggable[:slug]).to be_blank
      end

      it 'does not overwrite existing slug' do
        sluggable = create(sluggable_factories[:slug_from_first_title], slug: 'my-slug')
        sluggable.save!

        sluggable.update!(title_multiloc: { en: 'New title' })
        expect(sluggable.slug).to eq 'my-slug'
      end

      it 'does not generate duplicate slugs' do
        title_multiloc = { en: 'Sluggable title' }
        sluggable1 = create(sluggable_factories[:slug_from_first_title], title_multiloc: title_multiloc)
        sluggable2 = create(sluggable_factories[:slug_from_first_title], title_multiloc: title_multiloc)

        expect(sluggable1.slug).not_to eq sluggable2.slug
      end

      it 'does not set a slug when the if-condition is false' do
        sluggable = create(sluggable_factories[:slug_unless_invitation_pending], invite_status: 'pending')
        expect(sluggable.slug).to be_blank
      end

      it 'sets a slug when the if-condition is true' do
        sluggable = create(sluggable_factories[:slug_unless_invitation_pending], invite_status: 'accepted')
        expect(sluggable.slug).to be_present
      end

      it 'generates valid slugs for various user names' do
        titles = ['将太', 'константин', '-']
        titles.each do |title|
          sluggable = build(sluggable_factories[:slug_from_first_title], title_multiloc: { en: title })
          expect(sluggable).to be_valid
        end
      end

      it 'generates a fallback slug when the from_value is nil' do
        sluggable = test_model.new(title_multiloc: nil)
        sluggable.save!
        expect(sluggable.slug).to be_present
        expect(sluggable.slug).to match(Sluggable::SLUG_REGEX)
      end

      it 'generates a fallback slug when the from_value is empty' do
        sluggable = test_model.new(title_multiloc: {})
        sluggable.save!
        expect(sluggable.slug).to be_present
        expect(sluggable.slug).to match(Sluggable::SLUG_REGEX)
      end
    end

    describe 'validate' do
      let(:sluggable) { build(sluggable_factories[:slug_from_first_title]) }

      it 'accepts a valid slug' do
        sluggable.slug = 'vALiD-slug-24'
        expect(sluggable).to be_valid
      end

      it 'does not accept a slug with spaces' do
        sluggable.slug = 'invalid-slug '
        expect(sluggable).to be_invalid
        expect(sluggable.errors.details).to eq({ slug: [{ error: :invalid, value: 'invalid-slug ' }] })
      end

      it 'does not accept a slug with double quotes' do
        sluggable.slug = 'invalid"slug'
        expect(sluggable).to be_invalid
        expect(sluggable.errors.details).to eq({ slug: [{ error: :invalid, value: 'invalid"slug' }] })
      end
    end
  end
end
