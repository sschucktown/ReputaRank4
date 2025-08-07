import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
  onAddClient?: () => void;
}

export default function Header({ title, subtitle, onAddClient }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            data-testid="button-notifications"
            className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Quick Actions */}
          {onAddClient && (
            <Button
              data-testid="button-add-client-header"
              onClick={onAddClient}
              className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
