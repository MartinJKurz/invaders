class RemoveLastLoginFromUser < ActiveRecord::Migration
  def up
    remove_column :users, :last_login
  end

  def down
    add_column :users, :last_login, :datetime
  end
end
