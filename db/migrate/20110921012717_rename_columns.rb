class RenameColumns < ActiveRecord::Migration
  def up
    rename_column :scores, :user, :user_id
    rename_column :scores, :game, :game_id
  end

  def down
    rename_column :scores, :user_id, :user
    rename_column :scores, :game_id, :game
  end
end
