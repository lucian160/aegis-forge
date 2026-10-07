export default function MemberCard({ member }) {
  return (
    <article className="member-card">
      <div className="member-card-top">
        <span className="avatar large">{member.name.split(' ').map((part) => part[0]).join('')}</span>
        <span className={`availability ${member.availability.toLowerCase() === 'inactive' ? 'inactive' : member.availability.toLowerCase() === 'active' ? 'active' : 'review'}`}>
          {member.availability}
        </span>
      </div>

      <div className="member-card-body">
        <h3>{member.name}</h3>
        <p className="member-role">{member.role}</p>
        <p className="member-meta">{member.department}</p>
        <p className="member-meta">{member.location}</p>
      </div>

      <div className="member-skills">
        {member.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className="member-projects">
        {member.projects.map((project) => (
          <span key={project}>{project}</span>
        ))}
      </div>
    </article>
  );
}
