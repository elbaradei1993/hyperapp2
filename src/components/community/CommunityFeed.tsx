import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { Community, CommunitiesService } from "@/services/communities";
import { CommunityPost, CommunityPostsService } from "@/services/communityPosts";
import { CreatePostForm } from "./CreatePostForm";
import { CommunityPostComponent } from "./CommunityPost";
import { CommunityManagement } from "./CommunityManagement";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CommunityFeedProps {
  community: Community;
  onBack: () => void;
  onCommunityUpdate?: (updated: Community) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ community, onBack, onCommunityUpdate }) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentCommunity, setCurrentCommunity] = useState<Community>(community);

  useEffect(() => {
    loadPosts();
    checkMembership();
    checkOwnership();
  }, [community.id]);

  const checkOwnership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsOwner(currentCommunity.owner_id === user.id);
      }
    } catch (error) {
      setIsOwner(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await CommunityPostsService.getCommunityPosts(community.id);
      setPosts(postsData);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    try {
      const memberships = await CommunitiesService.getMyMemberships();
      setIsMember(memberships.some(m => m.community.id === community.id));
    } catch (error) {
      // If we can't check membership, assume not a member
      setIsMember(false);
    }
  };

  const handleJoin = async () => {
    try {
      setJoining(true);
      await CommunitiesService.joinCommunity(community.id);
      setIsMember(true);
      toast({ title: "Joined", description: `You joined ${community.name}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to join community", variant: "destructive" });
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    try {
      await CommunitiesService.leaveCommunity(community.id);
      setIsMember(false);
      toast({ title: "Left", description: `You left ${community.name}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to leave community", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {currentCommunity.name}
                </CardTitle>
                {currentCommunity.description && (
                  <p className="text-sm text-muted-foreground mt-1">{currentCommunity.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {currentCommunity.is_public && !isMember && (
                <Button onClick={handleJoin} disabled={joining}>
                  {joining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Join Community
                </Button>
              )}
              {isMember && !isOwner && (
                <Button variant="outline" onClick={handleLeave}>
                  Leave Community
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Community Management - only for owners */}
      <CommunityManagement
        community={currentCommunity}
        onUpdate={(updated) => {
          setCurrentCommunity(updated);
          onCommunityUpdate?.(updated);
        }}
        onDelete={onBack}
        isOwner={isOwner}
      />

      {/* Create Post Form - only for members */}
      {isMember && (
        <CreatePostForm communityId={currentCommunity.id} onPostCreated={loadPosts} />
      )}

      {/* Posts Feed */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No posts yet. {isMember ? "Be the first to post!" : "Join the community to see and create posts."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {posts.map((post) => (
            <CommunityPostComponent
              key={post.id}
              post={post}
              onDelete={loadPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
};