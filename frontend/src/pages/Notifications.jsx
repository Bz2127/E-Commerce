import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Package, AlertTriangle, CheckCircle} from 'lucide-react';

const Notifications = () => {
    const { notifications, markAsRead } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case 'order_update': return <Package size={20} color="#3b82f6" />;
            case 'low_stock': return <AlertTriangle size={20} color="#ef4444" />;
            case 'alert': return <Bell size={20} color="#f59e0b" />;
            default: return <CheckCircle size={20} color="#10b981" />;
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Your Notifications</h2>
            {notifications.length === 0 ? (
                <p style={styles.empty}>No notifications yet.</p>
            ) : (
                <div style={styles.list}>
                    {notifications.map((n) => (
                        <div 
                            key={n.id} 
                            style={{...styles.card, borderLeft: n.is_read ? '4px solid #e2e8f0' : '4px solid #10b981'}}
                            onClick={() => !n.is_read && markAsRead(n.id)}
                        >
                            <div style={styles.iconWrapper}>{getIcon(n.type)}</div>
                            <div style={styles.content}>
                                <h4 style={styles.msgTitle}>{n.title}</h4>
                                <p style={styles.message}>{n.message}</p>
                                <span style={styles.time}>{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                            {!n.is_read && <div style={styles.unreadDot} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { maxWidth: '800px', margin: '40px auto', padding: '0 20px' },
    title: { fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: '#0f172a' },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    card: { 
        display: 'flex', alignItems: 'flex-start', padding: '16px', 
        background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        cursor: 'pointer', position: 'relative', transition: '0.2s'
    },
    iconWrapper: { marginRight: '15px', marginTop: '2px' },
    content: { flex: 1 },
    msgTitle: { margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' },
    message: { margin: 0, fontSize: '14px', color: '#64748b' },
    time: { fontSize: '11px', color: '#94a3b8', marginTop: '8px', display: 'block' },
    unreadDot: { width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', position: 'absolute', top: '16px', right: '16px' },
    empty: { textAlign: 'center', color: '#64748b', marginTop: '40px' }
};

export default Notifications;