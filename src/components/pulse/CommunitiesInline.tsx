import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CommunitiesService, Community } from '@/services/communities';
import { useToast } from '@/hooks/use-toast';

const CommunitiesInline: React.FC = () => {
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [publicCommunities, setPublicCommunities] = useState<Community[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    try {
      const [mine, pub] = await Promise.all([
        CommunitiesService.getMyCommunities(),
        CommunitiesService.getPublicCommunities(20)
      ]);
      setMyCommunities(mine);
      // Exclude already joined
      const mineIds = new Set(mine.map(c => c.id));
      setPublicCommunities(pub.filter(c => !mineIds.has(c.id)));
    } catch (e) {
      console.error('Failed to load communities', e);
    }
  };

  useEffect(() => { load(); }, []);

  const createCommunity = async () => {
    try {
      setCreating(true);
      await CommunitiesService.createCommunity(name, description, isPublic);
      setName('');
      setDescription('');
      setIsPublic(true);
      await load();
      toast({ title: 'Community created' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to create community', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const joinCommunity = async (id: string) => {
    try {
      await CommunitiesService.joinCommunity(id);
      await load();
      toast({ title: 'Joined community' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to join', variant: 'destructive' });
    }
  };

  const leaveCommunity = async (id: string) => {
    try {
      await CommunitiesService.leaveCommunity(id);
      await load();
      toast({ title: 'Left community' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to leave', variant: 'destructive' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My Communities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myCommunities.length === 0 && (
            <div className="text-sm text-muted-foreground">You haven't joined any communities yet.</div>
          )}
          {myCommunities.map(c => (
            <div key={c.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                {c.description && <div className="text-sm text-muted-foreground">{c.description}</div>}
                <Badge variant="secondary" className="mt-1">{c.is_public ? 'Public' : 'Private'}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => leaveCommunity(c.id)}>Leave</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discover Communities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {publicCommunities.length === 0 && (
            <div className="text-sm text-muted-foreground">No public communities available.</div>
          )}
          {publicCommunities.map(c => (
            <div key={c.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                {c.description && <div className="text-sm text-muted-foreground">{c.description}</div>}
              </div>
              <Button size="sm" onClick={() => joinCommunity(c.id)}>Join</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Create a Community</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex items-center gap-2">
              <Button variant={isPublic ? 'default' : 'outline'} type="button" onClick={() => setIsPublic(true)}>Public</Button>
              <Button variant={!isPublic ? 'default' : 'outline'} type="button" onClick={() => setIsPublic(false)}>Private</Button>
              <Button disabled={!name || creating} onClick={createCommunity}>Create</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunitiesInline;
