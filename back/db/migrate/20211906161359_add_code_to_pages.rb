class AddCodeToPages < ActiveRecord::Migration[6.1]
  def change
    add_column :pages, :code, :string
    ActiveRecord::Base.connection.execute "UPDATE pages SET code = 'custom'"
    change_column_null :pages, :code, false
    add_index :pages, :code
  end
end
