import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { permissionRows, roleOptions } from '../data/settings';
import { canAssignUserDepartment, getAssignableUserRoles, hasPermission } from '../data/permissions';
import { getAuditEntries } from '../services/auditApi';
import { getDepartments } from '../services/domainsApi';
import { listUsers, updateUser, updateUserRole } from '../services/usersApi';

const tabs = [
  'Profile',
  'Account',
  'Notifications',
  'Appearance',
  'Security',
  'Organization',
  'Departments',
  'Members',
  'Roles',
  'Permissions',
  'Audit Log',
];

export default function Settings({ initialTab = 'Profile' }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [memberList, setMemberList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [departmentChoices, setDepartmentChoices] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState('');
  const [message, setMessage] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [pendingChange, setPendingChange] = useState(null);
  const [savingChange, setSavingChange] = useState(false);
  const canAdmin = hasPermission(user?.roleId, 'manage', 'settings');
  const canManageMembers = hasPermission(user?.roleId, 'manage', 'users');
  const canViewMembers = hasPermission(user?.roleId, 'view', 'users');
  const canViewAudit = hasPermission(user?.roleId, 'view', 'activities');

  const selectedRole = useMemo(() => roleOptions.find((role) => role.id === user?.roleId), [user?.roleId]);

  useEffect(() => {
    if (activeTab !== 'Departments' || !canAdmin) return undefined;
    let active = true;
    setDepartmentLoading(true);
    setDepartmentError('');
    getDepartments()
      .then((response) => {
        if (active) setDepartmentList(response.departments || []);
      })
      .catch((error) => {
        if (active) setDepartmentError(error.message || 'Unable to load department data.');
      })
      .finally(() => {
        if (active) setDepartmentLoading(false);
      });
    return () => { active = false; };
  }, [activeTab, canAdmin]);

  useEffect(() => {
    if (activeTab !== 'Members' || !canViewMembers) return undefined;
    let active = true;
    setMemberLoading(true);
    setMemberError('');
    Promise.all([listUsers(), getDepartments()])
      .then(([userResponse, departmentResponse]) => {
        if (!active) return;
        setMemberList(userResponse.users || []);
        setDepartmentChoices((departmentResponse.departments || []).map((department) => ({
          ...department,
          id: department.id || department._id,
        })));
      })
      .catch((error) => {
        if (active) setMemberError(error.message || 'Unable to load member data.');
      })
      .finally(() => {
        if (active) setMemberLoading(false);
      });
    return () => { active = false; };
  }, [activeTab, canViewMembers]);

  const saveMemberChange = async (departmentId) => {
    if (!pendingChange) return;
    setSavingChange(true);
    setMessage('');
    try {
      let response;
      if (pendingChange.kind === 'role') {
        if (pendingChange.value === 'department_leader' && departmentId) {
          response = await updateUser(pendingChange.target.id, { roleId: pendingChange.value, departmentId });
        } else {
          response = await updateUserRole(pendingChange.target.id, pendingChange.value);
        }
      } else {
        const data = pendingChange.kind === 'department'
          ? { departmentId: pendingChange.value || null }
          : { isActive: pendingChange.value };
        response = await updateUser(pendingChange.target.id, data);
      }
      setMemberList((current) => current.map((member) => member.id === response.user.id ? response.user : member));
      setMessage(`${pendingChange.target.name}'s ${pendingChange.kind} was updated.`);
      setPendingChange(null);
    } catch (error) {
      setMemberError(error.status === 403 ? 'You are not authorized to make that change.' : error.message || 'Unable to update this user.');
      setPendingChange(null);
    } finally {
      setSavingChange(false);
    }
  };

  return (
    <>
      <header className="page-header settings-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Settings & permissions</h1>
          <p>Manage your workspace, organization, and team access.</p>
        </div>
        <div className="settings-role"><span>Current role</span><strong>{selectedRole?.name || 'Member'}</strong></div>
      </header>

      {message && <div className="settings-message" role="status">{message}</div>}

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <div className="settings-sidebar-title">Workspace</div>
          <nav aria-label="Settings sections">
            {tabs.map((tab) => (
              <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)} type="button">
                {tab}
                {tab === 'Roles' && <span>{roleOptions.length}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <section className="settings-content">
          {activeTab === 'Profile' && <ProfileSettings user={user} roleName={selectedRole?.name} />}
          {activeTab === 'Account' && <AccountSettings user={user} roleName={selectedRole?.name} />}
          {activeTab === 'Notifications' && <NotificationSettings />}
          {activeTab === 'Appearance' && <AppearanceSettings />}
          {activeTab === 'Security' && <SecuritySettings />}
          {activeTab === 'Organization' && <OrganizationSettings canAdmin={canAdmin} />}
          {activeTab === 'Departments' && <DepartmentSettings canAdmin={canAdmin} departmentList={departmentList} loading={departmentLoading} error={departmentError} />}
          {activeTab === 'Members' && <MemberSettings canView={canViewMembers} canAdmin={canManageMembers} actor={user} memberList={memberList} departmentChoices={departmentChoices} loading={memberLoading} error={memberError} onError={setMemberError} onChange={(change) => setPendingChange(change)} />}
          {activeTab === 'Roles' && <RoleSettings canAdmin={canAdmin} />}
          {activeTab === 'Permissions' && <PermissionSettings canAdmin={canAdmin} />}
          {activeTab === 'Audit Log' && <AuditLogSettings canAdmin={canViewAudit} />}
        </section>
      </div>
      {pendingChange && <RoleChangeConfirmation change={pendingChange} departments={departmentChoices} saving={savingChange} onCancel={() => setPendingChange(null)} onConfirm={saveMemberChange} />}
    </>
  );
}

function ProfileSettings({ user, roleName }) {
  return (
    <div className="settings-section">
      <div className="settings-section-heading"><div><h2>Profile</h2><p>Your identity is provided by the active authentication session.</p></div></div>
      <div className="settings-form-grid">
        <label><span>Name</span><input value={user?.name || ''} readOnly /></label>
        <label><span>Email address</span><input value={user?.email || ''} readOnly /></label>
        <label><span>Role</span><input value={roleName || user?.roleId || ''} readOnly /></label>
        <label><span>Department</span><input value={['super_admin', 'organization_leader'].includes(user?.roleId) ? 'Organization-wide' : user?.departmentId || 'Unassigned'} readOnly /></label>
      </div>
    </div>
  );
}

function AccountSettings({ user, roleName }) {
  return <SettingsSection title="Account settings" description="Account identity and verification status from the authenticated session." icon="Account"><div className="settings-summary-grid"><div><span>Account</span><strong>{user?.email || 'Unavailable'}</strong></div><div><span>Role</span><strong>{roleName || user?.roleId || 'Unavailable'}</strong></div><div><span>Verification</span><strong>{user?.isVerified ? 'Verified' : 'Not verified'}</strong></div><div><span>Status</span><strong>{user?.isActive ? 'Active' : 'Inactive'}</strong></div></div></SettingsSection>;
}

function NotificationSettings() {
  return <SettingsSection title="Notification settings" description="Notification preferences are not available from the current account API." icon="Notifications"><p className="empty-state">No notification preference records are available.</p></SettingsSection>;
}

function AppearanceSettings() {
  return <SettingsSection title="Appearance settings" description="Appearance preferences are not available from the current account API."><p className="empty-state">No appearance preference records are available.</p></SettingsSection>;
}

function SecuritySettings() {
  return <SettingsSection title="Security settings" description="Session authentication and account security are handled by the backend."><p className="empty-state">No additional security settings are available.</p></SettingsSection>;
}

function OrganizationSettings({ canAdmin }) {
  return <SettingsSection title="Organization settings" description="Organization-level configuration." icon="Organization" disabled={!canAdmin}><p className="empty-state">Organization profile data is not available from the current API.</p></SettingsSection>;
}

function DepartmentSettings({ canAdmin, departmentList, loading, error }) {
  return <SettingsSection title="Department management" description="Live departments from the existing API. Structure and leadership are managed through authorized user management." icon="Departments" disabled={!canAdmin}>{error && <p className="auth-error" role="alert">Unable to load departments: {error}</p>}{loading ? <div className="auth-loading">Loading departments…</div> : departmentList.length ? <div className="settings-table"><div className="settings-table-head"><span>Department</span><span>Lead assignment</span><span>Members</span><span>Status</span></div>{departmentList.map((department) => <div className="settings-table-row" key={department.id || department._id}><strong>{department.name}</strong><span>{department.lead ? 'Assigned' : 'Unassigned'}</span><span>{Array.isArray(department.members) ? department.members.length : '—'}</span><span className={`status ${(department.status || 'unknown').toLowerCase()}`}>{department.status || 'Unavailable'}</span></div>)}</div> : !error && <p className="empty-state">No department records are available.</p>}</SettingsSection>;
}

function MemberSettings({ canView, canAdmin, actor, memberList, departmentChoices, loading, error, onError, onChange }) {
  if (!canView) return <SettingsSection title="Member management" description="Review team membership and access." icon="Members" disabled />;

  const departmentName = (departmentId) => departmentChoices.find((department) => department.id === departmentId)?.name || 'Unassigned';
  const scopedDepartments = actor?.roleId === 'department_leader'
    ? departmentChoices.filter((department) => department.id === actor.departmentId)
    : departmentChoices;

  return (
    <SettingsSection title="Member management" description="Manage roles and department assignments within your authority." icon="Members">
      {error && <div className="settings-message" role="alert">{error}<button type="button" className="text-button" onClick={() => onError('')}>Dismiss</button></div>}
      {loading ? <div className="auth-loading">Loading users…</div> : (
        <div className="settings-table member-table">
          <div className="settings-table-head"><span>Member</span><span>Role</span><span>Department</span><span>Status</span><span>Account</span></div>
          {memberList.map((member) => {
            const assignableRoles = getAssignableUserRoles(actor?.roleId, member.roleId);
            const targetInScope = !(actor?.roleId === 'organization_leader' && member.roleId === 'super_admin');
            const canChangeRole = canAdmin && targetInScope && member.id !== actor?.id && assignableRoles.length > 0;
            const canChangeDepartment = canAdmin && targetInScope && member.id !== actor?.id
              && !['super_admin', 'organization_leader'].includes(member.roleId)
              && canAssignUserDepartment(actor?.roleId, actor?.departmentId, member.departmentId);
            const displayedDepartment = ['super_admin', 'organization_leader'].includes(member.roleId)
              ? 'Organization-wide'
              : departmentName(member.departmentId);
            const canChangeStatus = actor?.roleId === 'super_admin' && member.id !== actor?.id;
            return (
              <div className="settings-table-row" key={member.id}>
                <strong>{member.name}<small>{member.email}</small></strong>
                {canChangeRole ? (
                  <select value={member.roleId} aria-label={`Role for ${member.name}`} onChange={(event) => { if (event.target.value !== member.roleId) onChange({ kind: 'role', target: member, value: event.target.value, oldValue: member.roleId }); }}>
                    {assignableRoles.map((roleId) => <option key={roleId} value={roleId}>{roleOptions.find((role) => role.id === roleId)?.name || roleId}</option>)}
                  </select>
                ) : <span>{roleOptions.find((role) => role.id === member.roleId)?.name || member.roleId}</span>}
                {canChangeDepartment ? (
                  <select value={member.departmentId || ''} aria-label={`Department for ${member.name}`} onChange={(event) => onChange({ kind: 'department', target: member, value: event.target.value, oldValue: member.departmentId || '' })}>
                    {member.roleId !== 'department_leader' && <option value="">Unassigned</option>}
                    {scopedDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                  </select>
                ) : <span>{displayedDepartment}</span>}
                <span className={`status ${member.isActive ? 'active' : 'inactive'}`}>{member.isActive ? 'Active' : 'Inactive'}</span>
                {canChangeStatus ? <button className="text-button" type="button" onClick={() => onChange({ kind: 'status', target: member, value: !member.isActive, oldValue: member.isActive })}>{member.isActive ? 'Disable' : 'Enable'}</button> : <span>—</span>}
              </div>
            );
          })}
          {!memberList.length && <p className="settings-empty">No users are assigned to this department.</p>}
        </div>
      )}
    </SettingsSection>
  );
}

function RoleChangeConfirmation({ change, departments, saving, onCancel, onConfirm }) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(change.target.departmentId || '');
  const currentRole = roleOptions.find((role) => role.id === change.target.roleId)?.name || change.target.roleId;
  const newRole = roleOptions.find((role) => role.id === change.value)?.name || change.value;
  const oldDepartment = departments.find((item) => item.id === change.target.departmentId)?.name || 'Unassigned';
  const organizationWideRole = ['super_admin', 'organization_leader'].includes(change.value);
  const requiresDepartment = change.kind === 'role' && change.value === 'department_leader' && !change.target.departmentId;
  const resultingDepartmentId = change.kind === 'department'
    ? change.value
    : requiresDepartment
      ? selectedDepartmentId
      : change.target.departmentId;
  const newDepartment = organizationWideRole
    ? 'Organization-wide'
    : departments.find((item) => item.id === resultingDepartmentId)?.name
      || (requiresDepartment ? 'Select a department' : 'Unassigned');
  const title = change.kind === 'role' ? 'Confirm role change' : change.kind === 'department' ? 'Confirm department change' : 'Confirm account status change';
  const valueLabel = change.kind === 'role' ? newRole : change.kind === 'department' ? newDepartment : (change.value ? 'Active' : 'Inactive');

  return (
    <div className="user-change-backdrop">
      <section className="user-change-dialog" role="dialog" aria-modal="true" aria-labelledby="user-change-title">
        <p className="eyebrow">Authorization change</p>
        <h2 id="user-change-title">{title}</h2>
        <dl>
          <div><dt>Target user</dt><dd>{change.target.name}</dd></div>
          <div><dt>Current role</dt><dd>{currentRole}</dd></div>
          <div><dt>New role / value</dt><dd>{valueLabel}</dd></div>
          <div><dt>Department</dt><dd>{change.kind === 'department' || change.kind === 'role' ? `${oldDepartment} → ${newDepartment}` : oldDepartment}</dd></div>
        </dl>
        {requiresDepartment && (
          <label className="form-field">
            <span>Assign department</span>
            <select value={selectedDepartmentId} onChange={(event) => setSelectedDepartmentId(event.target.value)} required>
              <option value="">Select a department</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>
        )}
        <div className="user-change-actions"><Button type="button" disabled={saving} onClick={onCancel}>Cancel</Button><Button type="button" variant="primary" disabled={saving || requiresDepartment && !selectedDepartmentId} onClick={() => onConfirm(requiresDepartment ? selectedDepartmentId : undefined)}>{saving ? 'Saving…' : 'Confirm change'}</Button></div>
      </section>
    </div>
  );
}

function RoleSettings({ canAdmin }) {
  return <SettingsSection title="Role management" description="Use the existing organization hierarchy for access control." icon="Roles" disabled={!canAdmin}><div className="role-list">{roleOptions.map((role) => <article key={role.id}><span className="role-code">{role.id.split('_').map((part) => part[0]).join('').toUpperCase()}</span><div><h3>{role.name}</h3><p>{role.description}</p></div><Button>View permissions</Button></article>)}</div></SettingsSection>;
}

function PermissionSettings({ canAdmin }) {
  return <SettingsSection title="Permission management" description="Review the existing role-to-action access model." icon="Permissions" disabled={!canAdmin}><div className="settings-table permission-table"><div className="settings-table-head"><span>Scope</span><span>View</span><span>Manage</span></div>{permissionRows.map(([scope, view, manage]) => <div className="settings-table-row" key={scope}><strong>{scope}</strong><span>{view}</span><span>{manage}</span></div>)}</div><div className="permission-note"><p>API operations are also enforced by backend authorization middleware.</p></div></SettingsSection>;
}

function AuditLogSettings({ canAdmin }) {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canAdmin) return;
    getAuditEntries({ limit: 50 }).then((response) => setEntries(response.auditEntries || [])).catch((requestError) => setError(requestError.message));
  }, [canAdmin]);

  return <SettingsSection title="Security audit log" description="Review authentication, authorization, account, and resource events." icon="Audit" disabled={!canAdmin}><div className="settings-table audit-table"><div className="settings-table-head"><span>Time</span><span>Actor</span><span>Action</span><span>Resource</span><span>Result</span></div>{entries.map((entry) => <div className="settings-table-row" key={entry._id}><strong>{new Date(entry.createdAt).toLocaleString()}</strong><span>{entry.user?.name || 'System'}</span><span>{entry.action}</span><span>{entry.targetType}</span><span className={`status ${entry.result}`}>{entry.result}</span></div>)}{error && <div className="settings-disabled"><strong>Audit log unavailable</strong><p>{error}</p></div>}</div></SettingsSection>;
}

function SettingsSection({ title, description, icon, children, disabled = false }) {
  return (
    <div className="settings-section">
      <div className="settings-section-heading"><div><h2>{title}</h2><p>{description}</p></div>{icon && <span className="settings-section-icon">{icon}</span>}</div>
      {disabled ? <div className="settings-disabled"><strong>Administration access required</strong><p>Only Super Admin and Organization Leader roles can change this section.</p></div> : children}
    </div>
  );
}
