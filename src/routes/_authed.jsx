import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";
import AppShell from "@/components/layout/AppShell";
import { getViewer } from "@/lib/server-fns";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: requireSignedIn,
  loader: () => getViewer(),
  errorComponent: AuthGateError,
  component: AuthedLayout,
});

function AuthedLayout() {
  const viewer = Route.useLoaderData();
  return (
    <AppShell viewer={viewer}>
      <Outlet />
    </AppShell>
  );
}