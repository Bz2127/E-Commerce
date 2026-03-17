import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const Notifications = () => {
    const { notifications, markAsRead } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case 'order_update': return <Package size={20} color="#3b82f6" />;
            case 'low_stock': return <AlertTriangle size={20} color="#ef4444" />;
            case 'alert': return <Bell size={20} color="#f59e0b" />;
            case 'error': return <XCircle size={20} color="#ef4444" />;
            default: return <CheckCircle size={20} color="#10b981" />;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>
                    <Bell size={24} style={{ marginRight: '10px' }} /> 
                    Your <span style={{color: '#10b981'}}>Eth</span>market Notifications
                </h2>
                {notifications.length > 0 && (
                    <span style={styles.countBadge}>
                        {notifications.filter(n => !n.is_read).length} New
                    </span>
                )}
            </div>

            {notifications.length === 0 ? (
                <div style={styles.emptyContainer}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔔</div>
                    <p style={styles.empty}>You're all caught up! No notifications yet.</p>
                </div>
            ) : (
                <div style={styles.list}>
                    {notifications.map((n) => (
                        <div 
                            key={n.id} 
                            style={{
                                ...styles.card, 
                                borderLeft: n.is_read ? '4px solid #e2e8f0' : '4px solid #10b981',
                                background: n.is_read ? '#ffffff' : '#f0fdf4'
                            }}
                            onClick={() => !n.is_read && markAsRead(n.id)}
                        >
                            <div style={styles.iconWrapper}>{getIcon(n.type)}</div>
                            <div style={styles.content}>
                                <h4 style={{
                                    ...styles.msgTitle, 
                                    color: n.is_read ? '#475569' : '#0f172a'
                                }}>
                                    {n.title}
                                </h4>
                                <p style={styles.message}>{n.message}</p>
                                <span style={styles.time}>
                                    {new Date(n.created_at).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
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
    container: { maxWidth: '850px', margin: '40px auto', padding: '0 20px', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' },
    title: { display: 'flex', alignItems: 'center', fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-1px' },
    countBadge: { background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '800' },
    list: { display: 'flex', flexDirection: 'column', gap: '15px' },
    card: { 
        display: 'flex', alignItems: 'flex-start', padding: '20px', 
        borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease',
        border: '1px solid #f1f5f9'
    },
    iconWrapper: { 
        marginRight: '18px', 
        padding: '10px', 
        background: '#f8fafc', 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: { flex: 1 },
    msgTitle: { margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700' },
    message: { margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' },
    time: { fontSize: '12px', color: '#94a3b8', marginTop: '10px', display: 'block', fontWeight: '500' },
    unreadDot: { width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', position: 'absolute', top: '22px', right: '20px', boxShadow: '0 0 0 4px #f0fdf4' },
    emptyContainer: { 
        textAlign: 'center', 
        padding: '80px 20px', 
        background: 'white', 
        borderRadius: '24px', 
        border: '1px dashed #e2e8f0' 
    },
    empty: { color: '#64748b', fontSize: '16px', fontWeight: '500' }
};

export default Notifications;