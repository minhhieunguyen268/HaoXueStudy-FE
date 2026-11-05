interface UserAvatarProps {
  avatarUrl?: string | null
  alt: string
  className: string
}

const DEFAULT_AVATAR = '/defaultavt.jpg'

function UserAvatar({ avatarUrl, alt, className }: UserAvatarProps) {
  return (
    <img
      className={className}
      src={avatarUrl || DEFAULT_AVATAR}
      alt={alt}
      onError={(event) => {
        if (event.currentTarget.getAttribute('src') !== DEFAULT_AVATAR) {
          event.currentTarget.src = DEFAULT_AVATAR
        }
      }}
    />
  )
}

export default UserAvatar
