class DummyUser < ActiveRecord::Base
  has_one_role :admin
  has_many_roles :publication_moderator, class: 'DummyPublication', foreign_key: :publication_id
  has_many_roles :project_moderator, through: :publication_moderator, class: 'DummyProject', source: :publication
end

class DummyPublication < ActiveRecord::Base
  belongs_to :publicatable, polymorphic: true
end

class DummyProject < ActiveRecord::Base
  has_one :dummy_publication, as: :publicatable
end
