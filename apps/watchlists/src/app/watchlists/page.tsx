import { Plus } from "lucide-react";
import { Button } from "@pk-task/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pk-task/ui/components/card";

export default function WatchlistsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Watchlists</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Signed-in users will create and manage named market lists here.
          </p>
        </div>
        <Button>
          <Plus className="size-4" aria-hidden="true" />
          Create
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No watchlists yet</CardTitle>
          <CardDescription>
            Wallet auth and CRUD mutations are planned for upcoming milestones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            The empty state is intentionally visible in milestone 1.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
