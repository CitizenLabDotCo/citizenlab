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
      publication = CitizenLab.ee? ? create(:project_folder) : create(:project, :that_can_have_children)
      create(:admin_publication, publication_status: status, publication: publication)
    end
    @empty_parents = AdminPublication.where(id: records.map(&:id))
  end

  def create_admin_only_parents
    records = statuses.map do |status|
      publication = CitizenLab.ee? ? create(:project_folder) : create(:project, :that_can_have_children, visible_to: 'groups')
      create(:admin_publication, publication_status: status, publication: publication)
    end
    @admin_only_parents = AdminPublication.where(id: records.map(&:id))
  end

  def create_public_parents
    records = statuses.map do |status|
      publication = CitizenLab.ee? ? create(:project_folder) : create(:project, :that_can_have_children)
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
    publication = CitizenLab.ee? ? create(:project_folder) : create(:project, :that_can_have_children)
    @published_parent_with_draft_children = create(:admin_publication,
                                                   publication_status: 'published',
                                                   publication: publication)
    children = create_list(:admin_publication, 3, :with_parent,
                           publication_status: 'draft',
                           parent: published_parent_with_draft_children)
    @draft_children_of_published_parent = AdminPublication.where(id: children.map(&:id))
  end
end
