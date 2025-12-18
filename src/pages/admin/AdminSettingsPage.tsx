import { AdminSettings } from '@/components/AdminSettings';

export function AdminSettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-muted">Configure platform settings and preferences</p>
      </div>
      <AdminSettings />
    </div>
  );
}
