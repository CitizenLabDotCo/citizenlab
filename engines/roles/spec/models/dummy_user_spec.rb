require 'rails_helper'
require_relative '../spec_helper.rb'

RSpec.describe DummyUser, type: :model do
  describe 'managing admin role' do
    subject { create(:dummy_user) }

    include_examples 'has_one_role', 'admin'
  end

  describe 'managing admin publication moderator roles' do
    let(:roleable) { create(:dummy_project).publication }

    include_examples 'has_many_associated_roles', 'admin_publication_moderator'
  end

  describe 'managing project moderator roles' do
    let(:roleable) { create(:dummy_project) }

    include_examples 'has_many_polymorphic_associated_through_roles', 'project_moderator'
  end

  describe 'managing project folder moderator roles' do
    let(:roleable) { create(:dummy_project) }

    include_examples 'has_many_polymorphic_associated_through_roles', 'project_folder_moderator'
  end
end
