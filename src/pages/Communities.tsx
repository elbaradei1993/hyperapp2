import React, { useEffect, useMemo, useState } from "react";
import { UberNavbar } from "@/components/layout/UberNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CommunitiesService, Community } from "@/services/communities";
import { Loader2, Users } from "lucide-react";

const Communities = () => {
  const { toast } = useToast();
  const [my, setMy] = useState<Community[]>([]);
  const [discover, setDiscover] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", isPublic: true });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [mine, pub] = await Promise.all([
          CommunitiesService.getMyCommunities(),
          CommunitiesService.getPublicCommunities(50)
        ]);
        setMy(mine);
        // Filter out communities already joined
        const joinedIds = new Set(mine.map(m => m.id));
        setDiscover(pub.filter(p => !joinedIds.has(p.id)));
      } catch (e) {
        console.error(e);
        toast({ title: "Error", description: "Could not load communities", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const create = async () => {
    try {
      setCreating(true);
      const c = await CommunitiesService.createCommunity(form.name.trim(), form.description.trim(), form.isPublic);
      toast({ title: "Community created", description: `${c.name} is ready` });
      setForm({ name: "", description: "", isPublic: true });
      const mine = await CommunitiesService.getMyCommunities();
      setMy(mine);
    } catch (e:any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to create community", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const join = async (id: string) => {
    try {
      await CommunitiesService.joinCommunity(id);
      toast({ title: "Joined", description: "You joined the community" });
      const mine = await CommunitiesService.getMyCommunities();
      setMy(mine);
      setDiscover(discover.filter(d => d.id !== id));
    } catch (e:any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to join", variant: "destructive" });
    }
  };

  const leave = async (id: string) => {
    try {
      await CommunitiesService.leaveCommunity(id);
      toast({ title: "Left", description: "You left the community" });
      setMy(my.filter(m => m.id !== id));
    } catch (e:any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to leave", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UberNavbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-primary" />
          <h1 className="text-3xl font-bold">Communities</h1>
        </div>

        {/* Create */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create a Community</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Textarea rows={3} placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">Public</div>
                <div className="text-sm text-muted-foreground">Anyone can find and join</div>
              </div>
              <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
            </div>
            <div className="flex justify-end">
              <Button onClick={create} disabled={creating || form.name.trim().length < 2}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lists */}
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading communities…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Communities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {my.length === 0 ? (
                  <div className="text-sm text-muted-foreground">You haven't joined any communities yet.</div>
                ) : (
                  my.map((c) => (
                    <div key={c.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        {c.description && <div className="text-sm text-muted-foreground line-clamp-1">{c.description}</div>}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => leave(c.id)}>Leave</Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discover</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {discover.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No public communities found.</div>
                ) : (
                  discover.map((c) => (
                    <div key={c.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        {c.description && <div className="text-sm text-muted-foreground line-clamp-1">{c.description}</div>}
                      </div>
                      <Button size="sm" onClick={() => join(c.id)}>Join</Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communities;
