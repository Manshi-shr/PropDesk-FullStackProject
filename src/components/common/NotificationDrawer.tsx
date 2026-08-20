import React from 'react';
import { Bell, CheckCheck, X, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Notification } from '../../types/index.js';
import { formatRelativeTime } from '../../utils/formatters.js';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onNavigate?: (link?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const safeList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeList.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'RENT_OVERDUE':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'PAYMENT_RECORDED':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'MAINTENANCE_CREATED':
      case 'MAINTENANCE_UPDATED':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-200/60 rounded-lg text-slate-700">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500">{unreadCount} unread alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {safeList.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No notifications right now.
              </div>
            ) : (
              safeList.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead && onMarkRead) onMarkRead(n.id);
                    if (n.link && onNavigate) {
                      onNavigate(n.link);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    n.isRead
                      ? 'bg-white border-slate-100 opacity-75 hover:opacity-100 hover:border-slate-200'
                      : 'bg-slate-50/80 border-slate-200/90 shadow-xs hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/60 shadow-2xs shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{n.title}</h4>
                        <span className="text-2xs text-slate-400 shrink-0 font-medium">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
