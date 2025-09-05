import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Trash2, Save, X } from "lucide-react";
import { Community, CommunitiesService } from "@/services/communities";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CommunityManagementProps {
  community: Community;
  onUpdate: (updated: Community) => void;
  onDelete: () => void;
  isOwner: boolean;
}

export const CommunityManagement: React.FC<CommunityManagementProps> = ({ 
  community, 
  onUpdate, 
  onDelete,
  isOwner 
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    name: community.name,
    description: community.description || "",
    is_public: community.is_public
  });

  if (!isOwner) return null;

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await CommunitiesService.updateCommunity(community.id, form);
      const updated = { ...community, ...form };
      onUpdate(updated);
      setIsEditing(false);
      toast({ title: "Community updated", description: "Changes saved successfully" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update community", 
        variant: "destructive" 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await CommunitiesService.deleteCommunity(community.id);
      onDelete();
      toast({ title: "Community deleted", description: `${community.name} has been deleted` });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete community", 
        variant: "destructive" 
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="mb-6 border-orange-200 dark:border-orange-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <Settings className="h-5 w-5" />
          Community Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              You are the owner of this community. You can edit settings or delete it.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Community</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{community.name}"? This action cannot be undone.
                      All posts and comments will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                      {deleting ? "Deleting..." : "Delete Community"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Community name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
            <div className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">Public Community</div>
                <div className="text-sm text-muted-foreground">Anyone can find and join</div>
              </div>
              <Switch 
                checked={form.is_public} 
                onCheckedChange={(checked) => setForm({ ...form, is_public: checked })} 
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setForm({
                    name: community.name,
                    description: community.description || "",
                    is_public: community.is_public
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={updating || form.name.trim().length < 2}
              >
                <Save className="h-4 w-4 mr-2" />
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};