import { ContactIcon, MessagesSquare,Users } from "lucide-react";
import { usePathname } from "next/navigation"
import { useMemo } from "react"
export const useNavigation = () => {
  const pathname = usePathname()

  const paths = useMemo(() => [
    {
        name: "Conversations",
        href:"/conversations",
        icon: <MessagesSquare/>,
        active: pathname.startsWith("/conversations"),
    },
    {
        name: "Friends",
        href:"/friends",
        icon: <ContactIcon/>,
        active: pathname === "/friends",
    },
    {
      name: "Groups",
      href:"/groups",
      icon: <Users/>,
      active: pathname.startsWith("/groups"),
    }
  ], [pathname]);

    return paths;
}