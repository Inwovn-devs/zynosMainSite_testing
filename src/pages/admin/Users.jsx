import { useEffect, useState } from 'react';
import { Table, Select, Tag, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';

const ROLES = ['user', 'sub-admin', 'admin'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/users').then((r) => setUsers(r.data.users || [])).finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/auth/users/${userId}`, { role });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      title: 'User', key: 'user', render: (_, r) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar src={r.photoURL} icon={<UserOutlined />} size={40} style={{ background: '#e63946' }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 600 }}>{r.displayName || '-'}</div>
            <div style={{ color: '#555', fontSize: 12 }}>{r.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Role', dataIndex: 'role', render: (v, r) => (
        <Select
          value={v}
          size="small"
          style={{ width: 120 }}
          onChange={(val) => handleRoleChange(r._id, val)}
          options={ROLES.map((role) => ({ value: role, label: role }))}
        />
      )
    },
    { title: 'Status', dataIndex: 'isActive', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    { title: 'Joined', dataIndex: 'createdAt', render: (v) => <span style={{ color: '#666' }}>{formatDate(v)}</span> },
  ];

  return (
    <div>
      <h2 style={{ color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, letterSpacing: 2, marginBottom: 24 }}>USERS</h2>
      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
        <Table dataSource={users} columns={columns} rowKey="_id" loading={loading} />
      </div>
    </div>
  );
}
