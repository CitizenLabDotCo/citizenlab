# frozen_string_literal: true

class MockAdminPublicationsTree
  attr_reader :empty_parents, :admin_only_parents,
    :public_parents, :admin_only_children, :public_children, :other,
    :draft_children_of_published_parent, :published_parent_with_draft_children

  def self.call
    new.tap(&:call)
  end

  def initialize
    @statuses = %w[draft archived published]
  end

  def call
    create_empty_parents
    create_admin_only_parents
    create_public_parents
    create_admin_only_children
    create_public_children
    create_other
    create_published_parent_with_draft_children
  end

  private

  attr_reader :statuses

  delegate :create, :create_list, to: FactoryBot

  def create_empty_parents
    records = statuses.map do |status|
      publication = create(:project_folder)
      create(:admin_publication, publication_status: status, publication: publication)
    end
    @empty_parents = AdminPublication.where(id: records.map(&:id))
  end

  def create_admin_only_parents
    records = statuses.map do |status|
      publication = create(:project_folder)
      create(:admin_publication, publication_status: status, publication: publication)
    end
    @admin_only_parents = AdminPublication.where(id: records.map(&:id))
  end

  def create_public_parents
    records = statuses.map do |status|
      publication = create(:project_folder)
      create(:admin_publication, publication_status: status, publication: publication)
    end
    @public_parents = AdminPublication.where(id: records.map(&:id))
  end

  def create_admin_only_children
    admin_only_parents.each do |parent|
      statuses.each do |status|
        publication = create(:project, visible_to: 'groups')
        create(:admin_publication, :with_parent, publication_status: status, publication: publication, parent: parent)
      end
    end
    @admin_only_children = AdminPublication.where(parent: admin_only_parents)
  end

  def create_public_children
    public_parents.each do |parent|
      statuses.each do |status|
        publication = create(:project, visible_to: 'groups')
        create(:admin_publication, :with_parent, publication_status: status, publication: publication, parent: parent)
      end
    end
    @public_children = AdminPublication.where(parent: public_parents)
  end

  def create_other
    # 5. create some other top level publications
    records = statuses.map do |status|
      publication = create(:project, visible_to: 'public')
      create(:admin_publication, publication_status: status, publication: publication)
    end
    @other = AdminPublication.where(id: records.map(&:id))
  end

  def create_published_parent_with_draft_children
    folder_admin_publication = create(:admin_publication,
      :with_children,
      publication_status: 'published',
      publication: create(:project_folder),
      children: %w[draft draft draft].map do |status|
        create(:admin_publication, publication_status: status, publication: create(:project))
      end
    )
    @published_parent_with_draft_children = AdminPublication.find(folder_admin_publication.id)
  end
end
