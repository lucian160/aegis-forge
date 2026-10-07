import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { departments, organizationProfile, permissionRows, roleOptions } from '../data/settings';
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
  const [departmentList, setDepartmentList] = useState(departments);
  const [departmentChoices, setDepartmentChoices] = useState([]);
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

  const saveMemberChange = async () => {
    if (!pendingChange) return;
    setSavingChange(true);
    setMessage('');
    try {
      let response;
      if (pendingChange.kind === 'role') {
        response = await updateUserRole(pendingChange.target.id, pendingChange.value);
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

  const updateDepartment = (departmentId, field, value) => {
    setDepartmentList((current) => current.map((department) => department.id === departmentId ? { ...department, [field]: value } : department));
    setMessage('Department details updated in this demo session.');
  };

  return (
    <>
      <header className="page-header settings-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Settings & permissions</h1>
          <p>Manage your workspace, organization, team access, and local demo configuration.</p>
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
                {tab === 'Roles' && <span>9</span>}
              </button>
            ))}
          </nav>
        </aside>

        <section className="settings-content">
          {activeTab === 'Profile' && <ProfileSettings />}
          {activeTab === 'Account' && <AccountSettings />}
          {activeTab === 'Notifications' && <NotificationSettings />}
          {activeTab === 'Appearance' && <AppearanceSettings />}
          {activeTab === 'Security' && <SecuritySettings />}
          {activeTab === 'Organization' && <OrganizationSettings canAdmin={canAdmin} />}
          {activeTab === 'Departments' && <DepartmentSettings canAdmin={canAdmin} departmentList={departmentList} updateDepartment={updateDepartment} />}
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

function ProfileSettings() {
  const [profile, setProfile] = useState(organizationProfile);
  return (
    <div className="settings-section">
      <div className="settings-section-heading"><div><h2>Profile</h2><p>Organization-facing details shown across AEGIS Forge.</p></div></div>
      <div className="settings-form-grid">
        <label><span>Organization name</span><input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
        <label><span>Legal name</span><input value={profile.legalName} onChange={(event) => setProfile({ ...profile, legalName: event.target.value })} /></label>
        <label><span>Industry</span><input value={profile.industry} onChange={(event) => setProfile({ ...profile, industry: event.target.value })} /></label>
        <label><span>Website</span><input value={profile.website} onChange={(event) => setProfile({ ...profile, website: event.target.value })} /></label>
        <label><span>Time zone</span><select value={profile.timezone} onChange={(event) => setProfile({ ...profile, timezone: event.target.value })}><option value="America/Los_Angeles">Pacific Time (UTC−8)</option><option value="America/Denver">Mountain Time (UTC−7)</option><option value="America/Chicago">Central Time (UTC−6)</option><option value="America/New_York">Eastern Time (UTC−5)</option></select></label>
        <label><span>Default language</span><select value={profile.language} onChange={(event) => setProfile({ ...profile, language: event.target.value })}><option>English</option><option>Spanish</option><option>French</option><option>German</option></select></label>
      </div>
      <div className="settings-actions"><Button variant="primary">Save profile</Button></div>
    </div>
  );
}

function AccountSettings() {
  return <SettingsSection title="Account settings" description="Manage the signed-in account and demo session preferences." icon="Account"><div className="settings-form-grid"><label><span>Display name</span><input defaultValue="Alex Kim" /></label><label><span>Email address</span><input defaultValue="alex@aegisforge.internal" type="email" /></label><label><span>Account type</span><input defaultValue="Organization Leader" /></label><label><span>Default department</span><select defaultValue="product"><option value="product">Product / Project Management</option><option value="web">Web Development</option></select></label></div><div className="settings-actions"><Button variant="primary">Save account</Button></div></SettingsSection>;
}

function NotificationSettings() {
  const options = ['Project updates', 'Task assignments', 'Department activity', 'Recruitment activity', 'Security alerts'];
  return <SettingsSection title="Notification settings" description="Choose which workspace updates are delivered." icon="Notifications"><div className="toggle-list">{options.map((option) => <label key={option}><span><strong>{option}</strong><small>Receive relevant updates in your workspace</small></span><input type="checkbox" defaultChecked={option !== 'Security alerts'} /><i /></label>)}</div><div className="settings-actions"><Button variant="primary">Save preferences</Button></div></SettingsSection>;
}

function AppearanceSettings() {
  return <SettingsSection title="Appearance settings" description="Configure the visual experience for this workspace."><div className="appearance-options"><button className="active" type="button"><span className="appearance-swatch dark" />Dark theme</button><button type="button"><span className="appearance-swatch light" />Light theme</button><button type="button"><span className="appearance-swatch contrast" />High contrast</button></div><div className="settings-actions"><Button variant="primary">Apply appearance</Button></div></SettingsSection>;
}

function SecuritySettings() {
  return <SettingsSection title="Security settings" description="Review local demo controls. Production security is handled by the backend phase."><div className="security-list"><div><strong>Password</strong><span>Demo password is stored only in the presentation session.</span><Button>Change password</Button></div><div><strong>Two-factor authentication</strong><span>Not enabled in this static demo.</span><Button>Enable</Button></div><div><strong>Active sessions</strong><span>One signed-in demo session is currently active.</span><Button>Review sessions</Button></div></div></SettingsSection>;
}

function OrganizationSettings({ canAdmin }) {
  return <SettingsSection title="Organization settings" description="Organization-level configuration and status." icon="Organization" disabled={!canAdmin}><div className="settings-summary-grid"><div><span>Organization</span><strong>AEGIS Forge</strong></div><div><span>Members</span><strong>84</strong></div><div><span>Departments</span><strong>6</strong></div><div><span>Plan</span><strong>Team operations</strong></div></div><div className="settings-actions"><Button variant="primary" disabled={!canAdmin}>Edit organization</Button></div></SettingsSection>;
}

function DepartmentSettings({ canAdmin, departmentList, updateDepartment }) {
  return <SettingsSection title="Department management" description="Assign department ownership and capacity." icon="Departments" disabled={!canAdmin}><div className="settings-table"><div className="settings-table-head"><span>Department</span><span>Lead</span><span>Members</span><span>Status</span></div>{departmentList.map((department) => <div className="settings-table-row" key={department.id}><strong>{department.name}</strong><select value={department.head} onChange={(event) => updateDepartment(department.id, 'head', event.target.value)}><option>{department.head}</option><option>Alex Kim</option><option>Ethan Cole</option></select><span>{department.members}</span><span className="status active">{department.status}</span></div>)}</div></SettingsSection>;
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
            const assignableRoles = getAssignableUserRoles(actor?.roleId, member.roleId)
              .filter((roleId) => roleId !== 'department_leader' || Boolean(member.departmentId));
            const targetInScope = !(actor?.roleId === 'organization_leader' && member.roleId === 'super_admin');
            const canChangeRole = canAdmin && targetInScope && member.id !== actor?.id && assignableRoles.length > 0;
            const canChangeDepartment = canAdmin && targetInScope && member.id !== actor?.id
              && canAssignUserDepartment(actor?.roleId, actor?.departmentId, member.departmentId);
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
                    <option value="">Unassigned</option>
                    {scopedDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                  </select>
                ) : <span>{departmentName(member.departmentId)}</span>}
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
  const currentRole = roleOptions.find((role) => role.id === change.target.roleId)?.name || change.target.roleId;
  const newRole = roleOptions.find((role) => role.id === change.value)?.name || change.value;
  const oldDepartment = departments.find((item) => item.id === change.target.departmentId)?.name || 'Unassigned';
  const newDepartment = departments.find((item) => item.id === change.value)?.name || 'Unassigned';
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
          <div><dt>Department</dt><dd>{change.kind === 'department' ? `${oldDepartment} → ${newDepartment}` : oldDepartment}</dd></div>
        </dl>
        <div className="user-change-actions"><Button type="button" disabled={saving} onClick={onCancel}>Cancel</Button><Button type="button" variant="primary" disabled={saving} onClick={onConfirm}>{saving ? 'Saving…' : 'Confirm change'}</Button></div>
      </section>
    </div>
  );
}

function RoleSettings({ canAdmin }) {
  return <SettingsSection title="Role management" description="Use the existing organization hierarchy for access control." icon="Roles" disabled={!canAdmin}><div className="role-list">{roleOptions.map((role) => <article key={role.id}><span className="role-code">{role.id.split('_').map((part) => part[0]).join('').toUpperCase()}</span><div><h3>{role.name}</h3><p>{role.description}</p></div><Button>View permissions</Button></article>)}</div></SettingsSection>;
}

function PermissionSettings({ canAdmin }) {
  return <SettingsSection title="Permission management" description="Review the role-to-action access model used by this demo." icon="Permissions" disabled={!canAdmin}><div className="settings-table permission-table"><div className="settings-table-head"><span>Scope</span><span>View</span><span>Manage</span></div>{permissionRows.map(([scope, view, manage]) => <div className="settings-table-row" key={scope}><strong>{scope}</strong><span>{view}</span><span>{manage}</span></div>)}</div><div className="permission-note"><strong>Demo policy</strong><p>Permissions are evaluated locally from the current role. The backend must replace this policy with server-side authorization.</p></div></SettingsSection>;
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
