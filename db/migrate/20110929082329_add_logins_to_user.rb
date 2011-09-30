class AddLoginsToUser < ActiveRecord::Migration
  def change
    add_column :users, :logins, :integer, :default => 0
  end
end
