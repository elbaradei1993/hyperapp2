import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { CommunityPostsService } from "@/services/communityPosts";
import { useToast } from "@/hooks/use-toast";

interface CreatePostFormProps {
  communityId: string;
  onPostCreated: () => void;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({ communityId, onPostCreated }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: "Error", description: "Please fill in both title and content", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      await CommunityPostsService.createPost(communityId, title, content);
      setTitle("");
      setContent("");
      setIsExpanded(false);
      toast({ title: "Post created", description: "Your post has been published" });
      onPostCreated();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create post", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Button
            onClick={() => setIsExpanded(true)}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create a new post
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            disabled={loading}
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsExpanded(false);
                setTitle("");
                setContent("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
              {loading ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};