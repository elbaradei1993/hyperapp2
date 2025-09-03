import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Trash2, User } from "lucide-react";
import { CommunityPost, CommunityComment, CommunityPostsService } from "@/services/communityPosts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CommunityPostProps {
  post: CommunityPost;
  onDelete?: () => void;
}

export const CommunityPostComponent: React.FC<CommunityPostProps> = ({ post, onDelete }) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    getUser();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const commentsData = await CommunityPostsService.getPostComments(post.id);
      setComments(commentsData);
      setShowComments(true);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load comments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = await CommunityPostsService.createComment(post.id, newComment);
      setComments([...comments, comment]);
      setNewComment("");
      toast({ title: "Comment added", description: "Your comment has been posted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add comment", variant: "destructive" });
    }
  };

  const handleDeletePost = async () => {
    try {
      await CommunityPostsService.deletePost(post.id);
      toast({ title: "Post deleted", description: "Your post has been removed" });
      onDelete?.();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await CommunityPostsService.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast({ title: "Comment deleted", description: "Comment has been removed" });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <User className="h-4 w-4" />
              <span>Anonymous</span>
              <span>•</span>
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
          {currentUser === post.author_id && (
            <Button variant="ghost" size="sm" onClick={handleDeletePost}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={showComments ? () => setShowComments(false) : loadComments}
            disabled={loading}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            {showComments ? 'Hide Comments' : `Comments (${comments.length})`}
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 border-t pt-4">
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Anonymous</span>
                      <span>•</span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                    {currentUser === comment.author_id && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="flex-1"
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};