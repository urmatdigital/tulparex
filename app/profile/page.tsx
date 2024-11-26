import { Metadata } from "next"
import ProfilePage from "@/components/profile/profile-page"

export const metadata: Metadata = {
  title: "Профиль",
  description: "Управление профилем пользователя",
}

export default function Profile() {
  return <ProfilePage />
}
