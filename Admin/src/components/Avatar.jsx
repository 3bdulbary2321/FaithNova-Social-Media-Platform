export default function Avatar({ user, size = 36 }) {
  const initials = (user?.name || '?').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  const style = { width: size, height: size, fontSize: size * 0.38 };
  return user?.avatar
    ? <img src={user.avatar} alt="" style={style} className="shrink-0 rounded-full object-cover" />
    : <span style={style} className="grid shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent">{initials}</span>;
}
