class ScoresController < ApplicationController

  helper_method :sort_column, :sort_direction

  def index
    @title = "All Scores"
    
    # we need a joined table, using user.name as a column
    @scores = Score.select("score, scores.created_at, name, game_id, scores.id").
                  joins("join users on users.id = scores.user_id").
                  order(sort_column + ' ' + sort_direction, "score desc").
                  page(params[:page]).
                  per(15)
  end

  def destroy
    if user_is_admin
      score = Score.find(params[:id])
      score.destroy
      redirect_to '/scores/index', :notice => 'score deleted'
    else
      redirect_to '/', :notice => 'cannot delete score'
    end
  end

  def destroy_low_scores
    if user_is_admin
      limit = APP_CONFIG['low_score']

      if !limit
        limit = 1000
      end

      scores = Score.where("score < '#{limit}'")
      ret = scores.length.to_s + " scores destroyed"

      Score.delete_all("score < '#{limit}'")

      redirect_to '/scores/index', :notice => ret
    else
      redirect_to '/', :notice => 'must be admin to delete scores'
    end
  end

  def destroy_old_scores
    if user_is_admin
      limit = APP_CONFIG['old_score']

      if !limit
        limit = 100
      end
      
      scores = Score.where("created_at < '#{Time.now - limit.days}'")
      ret = scores.length.to_s + " scores destroyed"

      Score.delete_all("created_at < '#{Time.now - limit.days}'")

      redirect_to '/scores/index', :notice => ret
    else
      redirect_to '/', :notice => 'must be admin to delete scores'
    end
  end

  private
  
  def sort_column
    ['name', 'score', 'scores.created_at', 'scores.id', 'game_id'].include?(params[:sort]) ? params[:sort] : "score"
  end

  def sort_direction
    %w[asc desc].include?(params[:direction]) ? params[:direction] : "desc"
  end

end

